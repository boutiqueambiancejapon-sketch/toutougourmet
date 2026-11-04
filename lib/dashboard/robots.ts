import { pageTypeOf, PAGE_TYPE_LABELS } from '@/lib/page-type'

// @cdc tableau de bord — robots IA, sans base ni affichage : filtre lu dans l'URL, couverture des
// articles par rubrique, tri entre articles et pages de navigation.

export const ROBOT_KINDS = [
  { key: 'ai_user', label: 'Lecture en direct', short: 'en direct', hint: 'Quelqu’un pose une question, l’IA ouvre la page pour lui répondre.' },
  { key: 'ai_search', label: 'Moteur IA', short: 'moteur', hint: 'Index d’un assistant qui cite ses sources.' },
  { key: 'ai_training', label: 'Entraînement', short: 'entraînement', hint: 'Collecte pour un futur modèle.' },
] as const

export type RobotKind = (typeof ROBOT_KINDS)[number]['key']

export interface RobotFilter {
  robot: string | null
  kind: RobotKind | null
}

const one = (value: string | string[] | undefined): string | undefined => (Array.isArray(value) ? value[0] : value)

export function parseRobotFilter(robot: string | string[] | undefined, kind: string | string[] | undefined): RobotFilter {
  const name = one(robot)
  const visit = one(kind)
  return {
    robot: name && /^[\p{L}\d .()_-]{1,40}$/u.test(name) ? name : null,
    kind: ROBOT_KINDS.find((k) => k.key === visit)?.key ?? null,
  }
}

export function robotHref(base: string, periodQuery: string, filter: RobotFilter): string {
  const params = new URLSearchParams(periodQuery.replace(/^\?/, ''))
  if (filter.robot) params.set('robot', filter.robot)
  if (filter.kind) params.set('visite', filter.kind)
  const qs = params.toString()
  return qs ? `${base}?${qs}` : base
}

export interface ArticlePath {
  path: string
  title: string
}

export interface CoverageRow {
  label: string
  read: number
  total: number
}

const clean = (path: string): string => path.replace(/\/$/, '') || '/'

/** Articles lus par rubrique du site, les moins couvertes d'abord. */
export function coverageOf(articles: ArticlePath[], readPaths: string[]): CoverageRow[] {
  const read = new Set(readPaths.map(clean))
  const byType = new Map<string, CoverageRow>()
  for (const a of articles) {
    const label = PAGE_TYPE_LABELS[pageTypeOf(a.path)]
    const row = byType.get(label) ?? { label, read: 0, total: 0 }
    row.total += 1
    if (read.has(clean(a.path))) row.read += 1
    byType.set(label, row)
  }
  return [...byType.values()].sort((a, b) => a.read / a.total - b.read / b.total || b.total - a.total)
}

/** Sépare les articles (avec leur titre) des pages de navigation, de compte ou d'outil. */
export function splitPaths<T extends { label: string; value: number }>(rows: T[], titles: Map<string, string>): { articles: T[]; others: T[] } {
  const articles: T[] = []
  const others: T[] = []
  for (const r of rows) {
    const title = titles.get(clean(r.label))
    if (title) articles.push({ ...r, label: title })
    else others.push(r)
  }
  return { articles, others }
}
