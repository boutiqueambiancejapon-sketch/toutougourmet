import type { Pool } from 'pg'
import { pageTypeOf, SITE } from '../config'

// @cdc tableau de bord SEO — état dans Google par type de page, d'après l'inspection d'URL de la nuit
// (analytics.url_inspection). Quatre groupes, du meilleur au pire, et les raisons données par Google.

export const INDEX_GROUPS = [
  { key: 'indexee', label: 'Indexée', color: 'var(--sd-good)' },
  { key: 'exploree', label: 'Explorée, non indexée', color: 'var(--sd-warn)' },
  { key: 'detectee', label: 'Détectée, non explorée', color: 'var(--sd-serious)' },
  { key: 'exclue', label: 'Exclue ou inconnue', color: 'var(--sd-prev)' },
] as const

export type IndexGroup = (typeof INDEX_GROUPS)[number]['key']

/** Groupe d'une ligne d'inspection (verdict PASS = indexée ; sinon d'après l'état de couverture en anglais). */
export function groupOf(verdict: string | null, coverage: string | null): IndexGroup {
  if (verdict === 'PASS') return 'indexee'
  const c = (coverage ?? '').toLowerCase()
  if (c.includes('crawled')) return 'exploree'
  if (c.includes('discovered')) return 'detectee'
  return 'exclue'
}

/** Raisons de Google traduites (les plus fréquentes), sinon le texte d'origine. */
export const COVERAGE_FR: Record<string, string> = {
  'Submitted and indexed': 'Envoyée et indexée',
  'Indexed, not submitted in sitemap': 'Indexée, absente du plan du site',
  'Crawled - currently not indexed': 'Explorée, actuellement non indexée',
  'Discovered - currently not indexed': 'Détectée, actuellement non explorée',
  'Alternate page with proper canonical tag': 'Autre page avec balise canonique correcte',
  'Duplicate, Google chose different canonical than user': 'En double, Google a choisi une autre page canonique',
  'Duplicate without user-selected canonical': 'En double, sans page canonique choisie',
  "Excluded by 'noindex' tag": 'Exclue par la balise noindex',
  'Page with redirect': 'Page avec redirection',
  'Not found (404)': 'Introuvable (404)',
  'URL is unknown to Google': 'Adresse inconnue de Google',
  'Blocked by robots.txt': 'Bloquée par robots.txt',
  'Soft 404': 'Soft 404',
  'Server error (5xx)': 'Erreur serveur (5xx)',
}

export interface IndexTypeRow {
  type: string
  label: string
  total: number
  counts: Record<IndexGroup, number>
}

export interface IndexationData {
  checked: number
  lastCheck: string | null
  types: IndexTypeRow[]
  reasons: { reason: string; count: number }[]
}

export async function indexation(pool: Pool): Promise<IndexationData> {
  const { rows } = await pool.query<{ path: string; verdict: string | null; coverage: string | null; checked_at: Date }>(
    `SELECT path, verdict, coverage, checked_at FROM analytics.url_inspection WHERE error IS NULL`,
  )
  const byType = new Map<string, IndexTypeRow>()
  const reasons = new Map<string, number>()
  let last: Date | null = null
  for (const r of rows) {
    const type = pageTypeOf(r.path)
    const t = byType.get(type) ?? { type, label: SITE.pageTypes.find((x) => x.key === type)?.plural ?? 'Autres pages', total: 0, counts: { indexee: 0, exploree: 0, detectee: 0, exclue: 0 } }
    const g = groupOf(r.verdict, r.coverage)
    t.counts[g] += 1
    t.total += 1
    byType.set(type, t)
    if (g !== 'indexee' && r.coverage) reasons.set(r.coverage, (reasons.get(r.coverage) ?? 0) + 1)
    if (!last || r.checked_at > last) last = r.checked_at
  }
  const order = [...SITE.pageTypes.map((t) => t.key), 'autre']
  return {
    checked: rows.length,
    lastCheck: last ? last.toISOString() : null,
    types: [...byType.values()].sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type)),
    reasons: [...reasons].map(([reason, count]) => ({ reason: COVERAGE_FR[reason] ?? reason, count })).sort((a, b) => b.count - a.count),
  }
}
