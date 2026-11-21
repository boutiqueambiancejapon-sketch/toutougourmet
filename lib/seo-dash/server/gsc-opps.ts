import type { Pool } from 'pg'
import { expectedCtr, scaled } from '../ctr'
import type { Filters } from '../filters'
import { gscAgg, type Agg } from './gsc-core'
import { addDays, type Range } from './range'
import { filterSql, num, Params } from './sql'

// @cdc tableau de bord SEO — opportunités calculées sur la période : à portée de main (positions 5 à 20),
// taux de clic sous l'attendu, pages qui se font concurrence, pages qui s'essoufflent sur 13 semaines.

export interface Striking extends Agg {
  /** Clics de plus si la requête passait à 5 % de taux de clic. */
  gain: number
}

export async function striking(pool: Pool, f: Filters, r: Range, queries?: Agg[]): Promise<{ rows: Striking[]; total: number }> {
  const all = queries ?? (await gscAgg(pool, f, r, 'query'))
  const min = scaled(50, f.days)
  const hits = all.filter((q) => q.position >= 5 && q.position <= 20 && q.impressions >= min)
  const rows = hits.map((q) => ({ ...q, gain: Math.max(0, Math.round(q.impressions * 0.05 - q.clicks)) })).sort((a, b) => b.impressions - a.impressions)
  return { rows, total: hits.length }
}

export interface LowCtr extends Agg {
  expected: number
  /** Clics manqués par rapport à l'attendu. */
  missed: number
}

export async function lowCtr(pool: Pool, f: Filters, r: Range, pages?: Agg[]): Promise<LowCtr[]> {
  const all = pages ?? (await gscAgg(pool, f, r, 'page'))
  const min = scaled(400, f.days)
  return all
    .filter((x) => x.position <= 10.5 && x.impressions >= min)
    .map((x) => {
      const expected = expectedCtr(x.position)
      return { ...x, expected, missed: Math.round((expected - x.ctr) * x.impressions) }
    })
    .filter((x) => x.ctr < x.expected * 0.6 && x.missed > 0)
    .sort((a, b) => b.missed - a.missed)
}

export interface Cannibal {
  query: string
  impressions: number
  pages: Agg[]
}

/** Requêtes pour lesquelles Google montre au moins deux pages du site, chacune avec assez d'affichages. */
export async function cannibals(pool: Pool, f: Filters, r: Range): Promise<{ rows: Cannibal[]; total: number }> {
  const p = new Params()
  const where = filterSql(f, p, { pageCol: 'page', deviceCol: 'device' })
  const min = p.add(scaled(20, f.days))
  const { rows } = await pool.query(
    `WITH qp AS (
       SELECT query, page, sum(clicks)::int AS clicks, sum(impressions)::int AS impressions,
              sum(position * impressions) / nullif(sum(impressions), 0) AS position
         FROM analytics.gsc_qp_daily WHERE day BETWEEN ${p.add(r.start)} AND ${p.add(r.end)}${where} GROUP BY 1, 2)
     SELECT query, page, clicks, impressions, position FROM qp
      WHERE impressions >= ${min} AND query IN (SELECT query FROM qp WHERE impressions >= ${min} GROUP BY 1 HAVING count(*) >= 2)`,
    p.values,
  )
  const m = new Map<string, Cannibal>()
  for (const x of rows as { query: string; page: string; clicks: number; impressions: number; position: unknown }[]) {
    const c = m.get(x.query) ?? { query: x.query, impressions: 0, pages: [] }
    c.impressions += x.impressions
    c.pages.push({ key: x.page, clicks: x.clicks, impressions: x.impressions, ctr: x.impressions ? x.clicks / x.impressions : 0, position: num(x.position) })
    m.set(x.query, c)
  }
  const all = [...m.values()].sort((a, b) => b.impressions - a.impressions)
  for (const c of all) c.pages.sort((a, b) => a.position - b.position)
  return { rows: all, total: all.length }
}

export interface Decay {
  page: string
  weeks: number[]
  first: number
  last: number
  pct: number
}

/** 13 semaines pleines finissant au dernier jour relevé : premier mois ≥ 25 clics, dernier mois au moins 30 % plus bas. */
export async function decays(pool: Pool, f: Filters, last: string): Promise<Decay[]> {
  const p = new Params()
  const start = addDays(last, -90)
  const where = filterSql(f, p, { pageCol: 'page', deviceCol: 'device' })
  const { rows } = await pool.query(
    `SELECT page, floor((day - ${p.add(start)}::date) / 7)::int AS w, sum(clicks)::int AS c
       FROM analytics.gsc_page_daily WHERE day BETWEEN ${p.add(start)} AND ${p.add(last)}${where} GROUP BY 1, 2`,
    p.values,
  )
  const m = new Map<string, number[]>()
  for (const x of rows as { page: string; w: number; c: number }[]) {
    const s = m.get(x.page) ?? Array.from({ length: 13 }, () => 0)
    if (x.w >= 0 && x.w < 13) s[x.w] += x.c
    m.set(x.page, s)
  }
  const out: Decay[] = []
  for (const [page, weeks] of m) {
    const first = weeks.slice(0, 4).reduce((a, b) => a + b, 0)
    const lastM = weeks.slice(9, 13).reduce((a, b) => a + b, 0)
    if (first >= 25 && lastM < first * 0.7) out.push({ page, weeks, first, last: lastM, pct: Math.round(((lastM - first) / first) * 100) })
  }
  return out.sort((a, b) => a.last - a.first - (b.last - b.first))
}
