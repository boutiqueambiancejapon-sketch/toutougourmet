import type { Pool } from 'pg'
import { SITE } from '../config'
import type { Filters } from '../filters'
import { googlebotSql, tsIn } from './crawl'
import { gscAgg, gscDaily, type Agg, type DayPoint, type Totals } from './gsc-core'
import { addDays, gscRanges, logRanges, type Ranges } from './range'
import { filterSql, Params } from './sql'

// @cdc tableau de bord SEO — fiche d'une page et fiche d'une requête : même gabarit pour toutes. Les courbes couvrent
// toujours 3 mois (91 jours) pour lire une tendance ; les tuiles suivent la période choisie.

export interface PageDetail {
  ranges: Ranges
  cur: Totals
  prev: Totals | null
  long: DayPoint[]
  queries: Agg[]
  visits: number
  partnerClicks: { brand: string; n: number }[]
  googlebot: { hits: number; last: string | null }
  ai: { label: string; n: number }[]
  inspection: { verdict: string | null; coverage: string | null; checked: string | null; canonical: string | null } | null
  audit: { title: string | null; description: string | null; status: number; linksIn: number } | null
  firstImpression: string | null
}

export async function pageDetail(pool: Pool, f: Filters, path: string): Promise<PageDetail> {
  const ranges = await gscRanges(pool, f)
  const logs = logRanges(f)
  const long = { start: addDays(ranges.last, -90), end: ranges.last }
  const p = new Params()
  const g = await googlebotSql(p)
  const ev = new Params()
  const evWhere = filterSql(f, ev, { deviceCol: 'device', deviceKind: 'hits' })
  const [cur, prev, daily, queries, gb, ai, visits, clicks, insp, audit, first] = await Promise.all([
    gscPage(pool, f, ranges.cur.start, ranges.cur.end, path),
    ranges.prev ? gscPage(pool, f, ranges.prev.start, ranges.prev.end, path) : Promise.resolve(null),
    gscDaily(pool, f, long, path),
    gscAgg(pool, f, ranges.cur, 'query', { page: path, limit: 200 }),
    pool.query(`SELECT count(*)::int AS n, max(ts)::date::text AS last FROM analytics.hits WHERE ${g} AND path = ${p.add(path)} AND ${tsIn(p, logs.cur)}`, p.values),
    pool.query(`SELECT coalesce(operator, bot) AS label, count(*)::int AS n FROM analytics.hits WHERE kind LIKE 'ai\\_%' AND path = $1 GROUP BY 1 ORDER BY 2 DESC LIMIT 8`, [path]),
    pool.query(`SELECT count(*)::int AS n FROM analytics.events WHERE name = 'Pageview' AND page = ${ev.add(path)} AND ${tsIn(ev, logs.cur)}${evWhere}`, ev.values),
    pool.query(`SELECT coalesce(props->>'brand', '?') AS brand, count(*)::int AS n FROM analytics.events WHERE name = 'Affiliate Click' AND page = $1 AND ts >= $2::date GROUP BY 1 ORDER BY 2 DESC`, [path, logs.cur.start]),
    pool.query(`SELECT verdict, coverage, checked_at::date::text AS checked, google_canonical AS canonical FROM analytics.url_inspection WHERE path = $1`, [path]),
    pool.query(`SELECT a.title, a.description, a.status, (SELECT count(DISTINCT src)::int FROM analytics.page_links l WHERE l.dst = a.path AND l.src <> a.path AND NOT l.src = ANY($2::text[])) AS "linksIn" FROM analytics.page_audit a WHERE a.path = $1`, [path, SITE.linkHubs]),
    pool.query(`SELECT min(day)::text AS d FROM analytics.gsc_page_daily WHERE page = $1 AND impressions > 0`, [path]),
  ])
  return {
    ranges,
    cur,
    prev: ranges.partial ? null : prev,
    long: daily,
    queries,
    visits: visits.rows[0]?.n ?? 0,
    partnerClicks: clicks.rows,
    googlebot: { hits: gb.rows[0]?.n ?? 0, last: gb.rows[0]?.last ?? null },
    ai: ai.rows,
    inspection: insp.rows[0] ?? null,
    audit: audit.rows[0] ?? null,
    firstImpression: first.rows[0]?.d ?? null,
  }
}

async function gscPage(pool: Pool, f: Filters, start: string, end: string, page: string): Promise<Totals> {
  const d = await gscDaily(pool, f, { start, end }, page)
  const clicks = d.reduce((a, x) => a + x.clicks, 0)
  const impressions = d.reduce((a, x) => a + x.impressions, 0)
  const position = impressions ? d.reduce((a, x) => a + x.position * x.impressions, 0) / impressions : 0
  return { clicks, impressions, ctr: impressions ? clicks / impressions : 0, position }
}

export interface QueryDetail {
  ranges: Ranges
  cur: Totals
  prev: Totals | null
  long: DayPoint[]
  pages: Agg[]
  related: Agg[]
}

export async function queryDetail(pool: Pool, f: Filters, q: string): Promise<QueryDetail> {
  const ranges = await gscRanges(pool, f)
  const long = { start: addDays(ranges.last, -90), end: ranges.last }
  const [pages, curQ, prevQ, longRows] = await Promise.all([
    gscAgg(pool, f, ranges.cur, 'page', { query: q }),
    gscAgg(pool, f, ranges.cur, 'query', { query: q }),
    ranges.prev ? gscAgg(pool, f, ranges.prev, 'query', { query: q }) : Promise.resolve([]),
    queryDaily(pool, f, long.start, long.end, q),
  ])
  const main = [...pages].sort((a, b) => b.impressions - a.impressions)[0]
  const related = main ? (await gscAgg(pool, f, ranges.cur, 'query', { page: main.key, limit: 30 })).filter((x) => x.key !== q) : []
  const zero: Totals = { clicks: 0, impressions: 0, ctr: 0, position: 0 }
  return { ranges, cur: curQ[0] ?? zero, prev: ranges.prev ? (prevQ[0] ?? zero) : null, long: longRows, pages, related }
}

async function queryDaily(pool: Pool, f: Filters, start: string, end: string, q: string): Promise<DayPoint[]> {
  const out: DayPoint[] = []
  const p = new Params()
  const where = filterSql(f, p, { pageCol: 'page', deviceCol: 'device' })
  const { rows } = await pool.query<{ day: string; clicks: number; impressions: number; position: number }>(
    `SELECT day::text, sum(c)::int AS clicks, sum(i)::int AS impressions, sum(pos * i) / nullif(sum(i), 0) AS position FROM (
       SELECT day, device, sum(clicks) AS c, max(impressions) AS i, min(position) AS pos FROM analytics.gsc_qp_daily
        WHERE query = ${p.add(q)} AND day BETWEEN ${p.add(start)} AND ${p.add(end)}${where} GROUP BY 1, 2) x GROUP BY 1`,
    p.values,
  )
  const by = new Map(rows.map((r) => [r.day, r]))
  for (let d = start; d <= end; d = addDays(d, 1)) {
    const r = by.get(d)
    out.push({ day: d, clicks: r?.clicks ?? 0, impressions: r?.impressions ?? 0, ctr: r && r.impressions ? r.clicks / r.impressions : 0, position: Number(r?.position ?? 0) })
  }
  return out
}

