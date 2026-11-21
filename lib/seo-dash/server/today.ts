import type { Pool } from 'pg'
import { scoreActions, type Action, type Links } from '../actions'
import type { Filters } from '../filters'
import { crawledPaths, crawlErrors } from './crawl'
import { gscAgg, gscTotals } from './gsc-core'
import { cannibals, decays, lowCtr, striking } from './gsc-opps'
import { gscRanges, logRanges } from './range'
import { sitemapEntries } from './sitemap'

// @cdc tableau de bord SEO — Aujourd'hui : les signaux du scoreur, lus sur 28 jours quelle que soit la période
// choisie (une action du jour ne doit pas changer avec le filtre), puis les actions déjà faites.

export interface NeverCrawled {
  sitemap: number
  paths: string[]
  groups: { group: string; count: number }[]
}

/** Premier segment lisible d'une adresse : « /croquettes », « /chien/race ». */
export function groupOfPath(path: string): string {
  const parts = path.split('/').filter(Boolean)
  if (!parts.length) return '/'
  return parts[0] === 'chien' && parts.length > 2 ? `/chien/${parts[1]}` : `/${parts[0]}`
}

export async function neverCrawled(pool: Pool): Promise<NeverCrawled> {
  const [map, seen] = await Promise.all([sitemapEntries(), crawledPaths(pool)])
  const paths = map.map((e) => e.path).filter((p) => !seen.has(p))
  const g = new Map<string, number>()
  for (const p of paths) g.set(groupOfPath(p), (g.get(groupOfPath(p)) ?? 0) + 1)
  return { sitemap: map.length, paths, groups: [...g].map(([group, count]) => ({ group, count })).sort((a, b) => b.count - a.count) }
}

export async function doneKeys(pool: Pool): Promise<Set<string>> {
  const { rows } = await pool.query<{ key: string }>(`SELECT key FROM analytics.seo_actions_done WHERE done_at > now() - interval '30 days'`)
  return new Set(rows.map((r) => r.key))
}

export async function markDone(pool: Pool, key: string, title: string): Promise<void> {
  await pool.query(
    `INSERT INTO analytics.seo_actions_done (key, title) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET done_at = now(), title = EXCLUDED.title`,
    [key.slice(0, 500), title.slice(0, 300)],
  )
}

export async function todayActions(pool: Pool, base: Filters, links: Links): Promise<Action[]> {
  const f: Filters = { ...base, period: '28j', days: 28, compare: 'avant' }
  const r = await gscRanges(pool, f)
  const logs = logRanges({ ...f, period: '7j', days: 7 })
  const [queries, pages, can, dec, never, errs, done] = await Promise.all([
    gscAgg(pool, f, r.cur, 'query'),
    gscAgg(pool, f, r.cur, 'page'),
    cannibals(pool, f, r.cur),
    decays(pool, f, r.last),
    neverCrawled(pool).catch(() => ({ sitemap: 0, paths: [], groups: [] })),
    crawlErrors(pool, logs.cur),
    doneKeys(pool),
  ])
  const [st, lc] = await Promise.all([striking(pool, f, r.cur, queries), lowCtr(pool, f, r.cur, pages)])
  const pageBy = new Map(pages.map((p) => [p.key, p]))
  return scoreActions(
    {
      days: 28,
      decays: dec.map((d) => ({ ...d, ctr: pageBy.get(d.page)?.ctr ?? 0, position: pageBy.get(d.page)?.position ?? 0 })),
      lowCtr: lc,
      striking: st.rows.sort((a, b) => b.gain - a.gain),
      strikingTotal: st.total,
      cannibals: can.rows,
      cannibalTotal: can.total,
      neverCrawled: { total: never.paths.length, sitemap: never.sitemap, topGroup: never.groups[0]?.group ?? '', topCount: never.groups[0]?.count ?? 0 },
      errors404: errs.filter((e) => e.status >= 400 && e.status < 500),
      errors5xx: errs.filter((e) => e.status >= 500),
    },
    links,
    done,
  )
}

/** Utilisé par les anomalies : taux de clic et affichages, période choisie contre la précédente. */
export async function ctrShift(pool: Pool, f: Filters) {
  const r = await gscRanges(pool, f)
  if (!r.prev) return null
  const [a, b] = await Promise.all([gscTotals(pool, f, r.cur), gscTotals(pool, f, r.prev)])
  return { cur: a, prev: b }
}
