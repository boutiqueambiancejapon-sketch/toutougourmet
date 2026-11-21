import type { Pool } from 'pg'
import { SITE } from '../config'
import type { Filters } from '../filters'
import { publications } from './content'
import { crawlErrors, crawlGroupSql, googlebotSql, tsIn, type ErrorRow } from './crawl'
import { daysOf, logRanges, type Ranges } from './range'
import { filterSql, Params } from './sql'
import { neverCrawled, type NeverCrawled } from './today'

// @cdc tableau de bord SEO — Exploration : ce que Googlebot (vérifié) ou Bingbot et les robots d'IA lisent vraiment,
// d'après les journaux du serveur, et le délai entre publication, premier passage et premier affichage dans Google.

export type CrawlGroup = 'fiche' | 'article' | 'autre' | 'asset'

export interface ExplorationData {
  ranges: Ranges
  days: string[]
  byDay: Record<CrawlGroup, number[]>
  total: number
  status: { ok: number; e404: number; e5xx: number; other: number }
  ai: { label: string; n: number }[]
  aiDaily: { ai_search: number[]; ai_training: number[]; ai_user: number[] }
  aiTotal: number
  errors: ErrorRow[]
  never: NeverCrawled
  delays: { title: string; path: string; date: string; crawl: string | null; seen: string | null; clicks: number }[]
}

export async function exploration(pool: Pool, f: Filters, robot: 'google' | 'bing'): Promise<ExplorationData> {
  const all = logRanges(f)
  // Pas de colonnes vides avant le premier jour des journaux.
  const ranges = { ...all, cur: { ...all.cur, start: all.cur.start < SITE.logsStart ? SITE.logsStart : all.cur.start } }
  const days = daysOf(ranges.cur)
  const p = new Params()
  const who = robot === 'bing' ? `bot = 'Bingbot'` : await googlebotSql(p)
  const page = filterSql(f, p, { pageCol: 'path' })
  const span = tsIn(p, ranges.cur)
  const group = crawlGroupSql(p)
  const day = `(ts AT TIME ZONE 'Europe/Paris')::date::text`
  const [crawl, ai, aiDaily, errors, never] = await Promise.all([
    pool.query<{ day: string; g: CrawlGroup; status: number; n: number }>(
      `SELECT ${day} AS day, ${group} AS g, (status / 100)::int * 100 AS status, count(*)::int AS n FROM analytics.hits
        WHERE ${who} AND ${span}${page} GROUP BY 1, 2, 3`,
      p.values,
    ),
    pool.query<{ label: string; n: number }>(
      `SELECT coalesce(operator, bot, '?') AS label, count(*)::int AS n FROM analytics.hits WHERE kind LIKE 'ai\\_%' AND ts >= $1::date AND ts < $2::date + 1 GROUP BY 1 ORDER BY 2 DESC LIMIT 10`,
      [ranges.cur.start, ranges.cur.end],
    ),
    pool.query<{ day: string; kind: 'ai_search' | 'ai_training' | 'ai_user'; n: number }>(
      `SELECT ${day} AS day, kind, count(*)::int AS n FROM analytics.hits WHERE kind LIKE 'ai\\_%' AND ts >= $1::date AND ts < $2::date + 1 GROUP BY 1, 2`,
      [ranges.cur.start, ranges.cur.end],
    ),
    crawlErrors(pool, ranges.cur),
    neverCrawled(pool).catch((): NeverCrawled => ({ sitemap: 0, paths: [], groups: [] })),
  ])
  const idx = new Map(days.map((d, i) => [d, i]))
  const byDay: Record<CrawlGroup, number[]> = { fiche: days.map(() => 0), article: days.map(() => 0), autre: days.map(() => 0), asset: days.map(() => 0) }
  const status = { ok: 0, e404: 0, e5xx: 0, other: 0 }
  for (const r of crawl.rows) {
    const i = idx.get(r.day)
    if (i !== undefined) byDay[r.g][i] += r.n
    if (r.status === 200) status.ok += r.n
    else if (r.status === 400) status.e404 += r.n
    else if (r.status === 500) status.e5xx += r.n
    else status.other += r.n
  }
  const aiD = { ai_search: days.map(() => 0), ai_training: days.map(() => 0), ai_user: days.map(() => 0) }
  for (const r of aiDaily.rows) {
    const i = idx.get(r.day)
    if (i !== undefined && r.kind in aiD) aiD[r.kind][i] += r.n
  }
  return {
    ranges,
    days,
    byDay,
    total: status.ok + status.e404 + status.e5xx + status.other,
    status,
    ai: ai.rows,
    aiDaily: aiD,
    aiTotal: ai.rows.reduce((a, x) => a + x.n, 0),
    errors,
    never,
    delays: await delays(pool),
  }
}

/** 12 derniers articles : premier passage de Googlebot (vérifié) et premier affichage dans Google après la publication. */
async function delays(pool: Pool): Promise<ExplorationData['delays']> {
  const recent = publications().slice(0, 12)
  if (!recent.length) return []
  const p = new Params()
  const g = await googlebotSql(p, 'h')
  const paths = p.add(recent.map((r) => r.path))
  const dates = p.add(recent.map((r) => r.date))
  const { rows } = await pool.query<{ path: string; crawl: string | null; seen: string | null; clicks: number }>(
    `SELECT a.path,
            (SELECT min(h.ts)::date::text FROM analytics.hits h WHERE h.path = a.path AND ${g} AND h.ts >= a.d::date) AS crawl,
            (SELECT min(day)::text FROM analytics.gsc_page_daily WHERE page = a.path AND impressions > 0 AND day >= a.d::date) AS seen,
            (SELECT coalesce(sum(clicks), 0)::int FROM analytics.gsc_page_daily WHERE page = a.path) AS clicks
       FROM unnest(${paths}::text[], ${dates}::text[]) AS a(path, d)`,
    p.values,
  )
  const by = new Map(rows.map((r) => [r.path, r]))
  return recent.map((r) => ({ title: r.title, path: r.path, date: r.date, crawl: by.get(r.path)?.crawl ?? null, seen: by.get(r.path)?.seen ?? null, clicks: by.get(r.path)?.clicks ?? 0 }))
}
