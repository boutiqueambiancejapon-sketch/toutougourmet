import type { Pool } from 'pg'
import type { Filters } from '../filters'
import { daysOf, type Range } from './range'
import { filterSql, num, Params } from './sql'

// @cdc tableau de bord SEO — Search Console : totaux, courbe par jour, agrégats par requête et par page.
// Sources : analytics.gsc_site_daily (totaux exacts), gsc_page_daily (par page), gsc_qp_daily (requête × page).
// Avec un filtre de type de page, les totaux viennent des pages (Google y compte les affichages par page).

export interface Totals {
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export interface DayPoint extends Totals {
  day: string
}

export const EMPTY_TOTALS: Totals = { clicks: 0, impressions: 0, ctr: 0, position: 0 }

const AGG = `sum(clicks)::int AS clicks, sum(impressions)::int AS impressions,
  CASE WHEN sum(impressions) > 0 THEN sum(position * impressions) / sum(impressions) ELSE 0 END AS position`

function source(f: Filters, p: Params): { table: string; where: string } {
  if (f.pages !== 'toutes') return { table: 'analytics.gsc_page_daily', where: filterSql(f, p, { pageCol: 'page', deviceCol: 'device' }) }
  return { table: 'analytics.gsc_site_daily', where: filterSql(f, p, { deviceCol: 'device' }) }
}

const totalsOf = (r: { clicks: unknown; impressions: unknown; position: unknown }): Totals => {
  const clicks = num(r.clicks)
  const impressions = num(r.impressions)
  return { clicks, impressions, ctr: impressions ? clicks / impressions : 0, position: num(r.position) }
}

export async function gscTotals(pool: Pool, f: Filters, r: Range): Promise<Totals> {
  const p = new Params()
  const { table, where } = source(f, p)
  const { rows } = await pool.query(`SELECT ${AGG} FROM ${table} WHERE day BETWEEN ${p.add(r.start)} AND ${p.add(r.end)}${where}`, p.values)
  return rows[0] ? totalsOf(rows[0]) : EMPTY_TOTALS
}

/** Une valeur par jour de la période, jours sans données à zéro. page : une seule page (détail). */
export async function gscDaily(pool: Pool, f: Filters, r: Range, page?: string): Promise<DayPoint[]> {
  const p = new Params()
  let table: string
  let where: string
  if (page) {
    table = 'analytics.gsc_page_daily'
    where = ` AND page = ${p.add(page)}${filterSql(f, p, { deviceCol: 'device' })}`
  } else ({ table, where } = source(f, p))
  const { rows } = await pool.query(
    `SELECT day::text AS day, ${AGG} FROM ${table} WHERE day BETWEEN ${p.add(r.start)} AND ${p.add(r.end)}${where} GROUP BY day`,
    p.values,
  )
  type Raw = { day: string; clicks: unknown; impressions: unknown; position: unknown }
  const by = new Map((rows as Raw[]).map((x) => [x.day, x]))
  return daysOf(r).map((day) => {
    const x = by.get(day)
    return { day, ...(x ? totalsOf(x) : EMPTY_TOTALS) }
  })
}

export interface Agg extends Totals {
  key: string
}

/** Requêtes (toutes pages confondues) ou pages, agrégées sur la période. */
export async function gscAgg(pool: Pool, f: Filters, r: Range, by: 'query' | 'page', opts: { page?: string; query?: string; limit?: number } = {}): Promise<Agg[]> {
  const p = new Params()
  const table = by === 'page' && !opts.query ? 'analytics.gsc_page_daily' : 'analytics.gsc_qp_daily'
  let where = filterSql(f, p, { pageCol: 'page', deviceCol: 'device' })
  if (opts.page) where += ` AND page = ${p.add(opts.page)}`
  if (opts.query) where += ` AND query = ${p.add(opts.query)}`
  const { rows } = await pool.query(
    `SELECT ${by} AS key, ${AGG} FROM ${table} WHERE day BETWEEN ${p.add(r.start)} AND ${p.add(r.end)}${where}
      GROUP BY 1 ORDER BY sum(clicks) DESC, sum(impressions) DESC LIMIT ${p.add(opts.limit ?? 5000)}`,
    p.values,
  )
  return rows.map((x: { key: string; clicks: unknown; impressions: unknown; position: unknown }) => ({ key: x.key, ...totalsOf(x) }))
}

export interface DeltaRow {
  key: string
  clicks: number
  prevClicks: number
  diff: number
  impressions: number
  prevImpressions: number
  position: number
  prevPosition: number
}

/** Écarts de clics entre deux périodes : les plus fortes hausses et baisses. */
export function deltas(cur: Agg[], prev: Agg[], n = 8): { up: DeltaRow[]; down: DeltaRow[] } {
  const a = new Map(cur.map((x) => [x.key, x]))
  const b = new Map(prev.map((x) => [x.key, x]))
  const rows: DeltaRow[] = []
  for (const key of new Set([...a.keys(), ...b.keys()])) {
    const x = a.get(key)
    const y = b.get(key)
    rows.push({
      key,
      clicks: x?.clicks ?? 0,
      prevClicks: y?.clicks ?? 0,
      diff: (x?.clicks ?? 0) - (y?.clicks ?? 0),
      impressions: x?.impressions ?? 0,
      prevImpressions: y?.impressions ?? 0,
      position: x?.position ?? 0,
      prevPosition: y?.position ?? 0,
    })
  }
  const order = (s: number) => (p: DeltaRow, q: DeltaRow) => s * (p.diff - q.diff) || s * (p.impressions - p.prevImpressions - (q.impressions - q.prevImpressions))
  return {
    up: rows.filter((r) => r.diff > 0).sort(order(-1)).slice(0, n),
    down: rows.filter((r) => r.diff < 0).sort(order(1)).slice(0, n),
  }
}
