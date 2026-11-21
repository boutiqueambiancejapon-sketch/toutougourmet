import type { Pool } from 'pg'
import { pageTypeLabel, pageTypeOf } from '../config'
import { crawlErrors, type ErrorRow } from './crawl'
import { cruxConfigured, cruxOrigin, type CruxResult } from './crux'
import { logRanges } from './range'
import { groupVitals, type GroupVitals } from './vitals'

// @cdc tableau de bord SEO — Technique : vitesse (mesures maison, CrUX si la clé existe), liens cassés (graphe de liens
// de l'audit de nuit + 404 vues par les robots), pages orphelines, titres et descriptions. Rien n'est réécrit ici.

export interface TitleIssue {
  kind: string
  label: string
  pages: { path: string; detail: string }[]
}

export interface TechniqueData {
  audited: number
  lastAudit: string | null
  vitals: { groups: GroupVitals[]; samples: number }
  crux: { configured: boolean; phone: CruxResult | null; error: string | null }
  broken: { path: string; status: number; from: number; example: string | null }[]
  robot404: ErrorRow[]
  orphans: { path: string; type: string; linksIn: number }[]
  titles: TitleIssue[]
}

export async function technique(pool: Pool): Promise<TechniqueData> {
  const logs = logRanges({ period: '28j', days: 28, compare: 'aucune', pages: 'toutes', device: 'tous' })
  const [audit, broken, orphans, robot404, vitals] = await Promise.all([
    pool.query<{ path: string; title: string | null; description: string | null; status: number; checked_at: Date; noindex: boolean }>(
      `SELECT path, title, description, status, checked_at, noindex FROM analytics.page_audit WHERE in_sitemap`,
    ),
    pool.query<{ path: string; status: number; from: number; example: string | null }>(
      `SELECT s.path, s.status, count(DISTINCT l.src)::int AS "from", min(l.src) AS example
         FROM analytics.link_status s JOIN analytics.page_links l ON l.dst = s.path
        WHERE s.status >= 400 GROUP BY 1, 2 ORDER BY 3 DESC LIMIT 100`,
    ),
    pool.query<{ path: string; n: number }>(
      `SELECT a.path, (SELECT count(DISTINCT l.src)::int FROM analytics.page_links l WHERE l.dst = a.path AND l.src <> a.path) AS n
         FROM analytics.page_audit a WHERE a.in_sitemap AND a.status = 200 AND a.path <> '/'`,
    ),
    crawlErrors(pool, logs.cur),
    groupVitals(pool, (t) => pageTypeLabel(t, true)),
  ])
  let crux: TechniqueData['crux'] = { configured: cruxConfigured(), phone: null, error: null }
  if (crux.configured) {
    try {
      crux = { ...crux, phone: await cruxOrigin('PHONE') }
    } catch (err) {
      crux = { ...crux, error: err instanceof Error ? err.message : 'erreur' }
    }
  }
  const rows = audit.rows
  const titles: TitleIssue[] = []
  const add = (kind: string, label: string, pages: { path: string; detail: string }[]) => {
    if (pages.length) titles.push({ kind, label, pages })
  }
  add('title-long', 'Titre trop long (> 65 signes)', rows.filter((r) => (r.title?.length ?? 0) > 65).map((r) => ({ path: r.path, detail: `${r.title?.length} signes` })))
  add('title-missing', 'Titre absent', rows.filter((r) => r.status === 200 && !r.title).map((r) => ({ path: r.path, detail: '' })))
  add('desc-long', 'Description trop longue (> 160)', rows.filter((r) => (r.description?.length ?? 0) > 160).map((r) => ({ path: r.path, detail: `${r.description?.length} signes` })))
  add('desc-short', 'Description trop courte (< 70)', rows.filter((r) => r.description && r.description.length < 70).map((r) => ({ path: r.path, detail: `${r.description?.length} signes` })))
  add('desc-missing', 'Description absente', rows.filter((r) => r.status === 200 && !r.description).map((r) => ({ path: r.path, detail: '' })))
  const dup = new Map<string, string[]>()
  for (const r of rows) if (r.title) dup.set(r.title, [...(dup.get(r.title) ?? []), r.path])
  add('title-dup', 'Titre en double', [...dup].filter(([, p]) => p.length > 1).flatMap(([t, p]) => p.map((path) => ({ path, detail: t.slice(0, 50) }))))
  add('noindex', 'Dans le plan du site mais en noindex', rows.filter((r) => r.noindex).map((r) => ({ path: r.path, detail: '' })))
  const last = rows.reduce<Date | null>((m, r) => (!m || r.checked_at > m ? r.checked_at : m), null)
  return {
    audited: rows.length,
    lastAudit: last ? last.toISOString() : null,
    vitals,
    crux,
    broken: broken.rows,
    robot404: robot404.filter((e) => e.status >= 400 && e.status < 500),
    orphans: orphans.rows.filter((o) => o.n === 0).map((o) => ({ path: o.path, type: pageTypeOf(o.path), linksIn: o.n })),
    titles,
  }
}
