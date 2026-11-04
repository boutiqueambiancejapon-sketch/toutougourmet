import type { FicheCheckStatus } from '@/db/schema/scanner'
import type { FoodNoun } from './food-noun'
import { meetsIndexRule } from './opff-import'
import type { ProductKind } from './score'
import { brandSlug } from './seo'
import { timeAgo } from './time'
import type { ExtractedLabel } from './types'

// @cdc scanner — règles des listes de /scanner, /scanner/croquette et /scanner/friandise (fonctions
// pures, testées par scripts/test-scanner-lists.ts). Elles ne décident jamais de l'indexation :
// publishedWhere et isPublished (lib/server/scanner-published.ts) restent seuls juges de Google.

export type FicheVue = 'dernieres' | 'top' | 'moins'

export const FICHE_VUES: { vue: FicheVue; label: string; query: string }[] = [
  { vue: 'dernieres', label: 'Dernières fiches', query: '' },
  { vue: 'top', label: 'Top 10', query: '?vue=top' },
  { vue: 'moins', label: 'Moins bien notées', query: '?vue=moins' },
]

export function parseVue(value: string | string[] | undefined): FicheVue {
  const v = Array.isArray(value) ? value[0] : value
  return v === 'top' || v === 'moins' ? v : 'dernieres'
}

/** Pages de consultation : hors Google, mais les liens vers les fiches et le scanner restent suivis. */
export const LIST_ROBOTS = { index: false, follow: true } as const

export const LATEST_SHOWN = 20
export const RANKING_SIZE = 10
export const MAX_PER_BRAND = 3
/** Sous cette note (même seuil que les alternatives) : « Moins bien notées » et « selon la composition affichée » */
export const LOW_SCORE_BELOW = 55

export interface ListFiche {
  slug: string
  brand: string | null
  product: string | null
  score: number | null
  kind: ProductKind
  noun: FoodNoun
  reviewed: boolean
  discarded: boolean
  scanCount: number
  createdAt: Date
  /** Dernier vrai scan connu (scan_history, analytics.scanner_events), null s'il n'y en a pas */
  lastScanAt: Date | null
  /** Contrôle IA encore valable pour le contenu actuel de la fiche, null sinon */
  check: FicheCheckStatus | null
  /** Pays d'Open Pet Food Facts, null si la fiche n'y est pas */
  countries: string[] | null
  /** Marque, produit, composition et constituants assez complets (meetsIndexRule : adapté aux friandises) */
  complete: boolean
}

export const isFicheComplete = (label: ExtractedLabel, score: number | null): boolean => meetsIndexRule(label, score)

/** Une fiche relue garde la main sur le contrôle IA : la décision humaine passe avant. */
export const isPublicFiche = (f: ListFiche): boolean => !f.discarded && (f.reviewed || f.check !== 'rejected')
export const isValidated = (f: ListFiche): boolean => isPublicFiche(f) && (f.reviewed || f.check === 'ok')
export const isRealScan = (f: ListFiche): boolean => f.lastScanAt !== null || f.scanCount > 0

const latestAt = (f: ListFiche): number => Math.max(f.lastScanAt?.getTime() ?? 0, f.createdAt.getTime())

/** Fiches validées et notées, plus tout vrai scan non écarté. Sans limite : base des statistiques. */
export function latestPool(items: ListFiche[], kind?: ProductKind): ListFiche[] {
  return items
    .filter((f) => (!kind || f.kind === kind) && isPublicFiche(f) && ((isValidated(f) && f.score !== null) || isRealScan(f)))
    .sort((a, b) => latestAt(b) - latestAt(a) || a.slug.localeCompare(b.slug))
}

const FRANCE = /^(en:)?(france|fr)$/i
export const seenInFrance = (countries: string[] | null): boolean => !!countries?.some((c) => FRANCE.test(c.trim()))

const brandKey = (f: ListFiche): string => brandSlug(f.brand) ?? f.slug

export function capPerBrand(items: ListFiche[], max = MAX_PER_BRAND): ListFiche[] {
  const seen = new Map<string, number>()
  return items.filter((f) => {
    const n = seen.get(brandKey(f)) ?? 0
    seen.set(brandKey(f), n + 1)
    return n < max
  })
}

/**
 * Choisit d'abord dans les marques qu'Open Pet Food Facts signale en France (une fiche suffit), puis
 * complète avec les autres, 3 fiches par marque au plus. L'affichage suit ensuite la note seule.
 * Pas d'information sur le pays : la marque passe après, sans être exclue.
 */
function pick(pool: ListFiche[], direction: 1 | -1): ListFiche[] {
  const french = new Set(pool.filter((f) => seenInFrance(f.countries)).map(brandKey))
  const byScore = (a: ListFiche, b: ListFiche) => direction * ((a.score ?? 0) - (b.score ?? 0)) || (a.brand ?? '').localeCompare(b.brand ?? '', 'fr') || a.slug.localeCompare(b.slug)
  const ordered = [...pool].sort((a, b) => Number(french.has(brandKey(b))) - Number(french.has(brandKey(a))) || byScore(a, b))
  return capPerBrand(ordered).slice(0, RANKING_SIZE).sort(byScore)
}

const rankingPool = (items: ListFiche[], kind: ProductKind, noun?: FoodNoun) => items.filter((f) => f.kind === kind && (!noun || f.noun === noun) && isValidated(f) && f.complete && f.score !== null)

/** noun : catégorie du classement. Une pâtée et des croquettes ne se comparent pas : l'eau change le calcul. */
export const topFiches = (items: ListFiche[], kind: ProductKind, noun?: FoodNoun): ListFiche[] => pick(rankingPool(items, kind, noun), -1)

/**
 * Aliment thérapeutique ou prescrit : sa composition répond à une maladie (peu de protéines pour le
 * foie, par exemple). Le barème d'un aliment courant ne le juge pas, il ne figure donc pas parmi les
 * moins bien notés.
 */
const THERAPEUTIC = /\b(hepatic|renal|urinary|gastro|hypoallergenic|anallergenic|satiety|veterinar\w*|prescription|derma\w*|cardiac|diabetic|metabolic|[a-z]\/d)\b/i
export const isTherapeutic = (f: Pick<ListFiche, 'brand' | 'product'>): boolean => THERAPEUTIC.test(`${f.brand ?? ''} ${f.product ?? ''}`)

export const lowFiches = (items: ListFiche[], kind: ProductKind, noun?: FoodNoun): ListFiche[] =>
  pick(
    rankingPool(items, kind, noun).filter((f) => (f.score ?? 100) < LOW_SCORE_BELOW && !isTherapeutic(f)),
    1,
  )

/** Vrais comptes : les fiches notées de la liste « Dernières fiches », sans limite d'affichage. */
export function listStats(pool: ListFiche[]): { count: number; average: number | null } {
  const scores = pool.flatMap((f) => (f.score === null ? [] : [f.score]))
  return { count: scores.length, average: scores.length ? Math.round(scores.reduce((s, n) => s + n, 0) / scores.length) : null }
}

const paris = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', ...options })
const dayMonth = paris({ day: '2-digit', month: '2-digit' })
const dayMonthYear = paris({ day: '2-digit', month: '2-digit', year: 'numeric' })
const year = paris({ year: 'numeric' })

/** « Scanné » seulement pour un vrai scan daté. Sinon, la date de création de la fiche. */
export function ficheDateLabel(f: Pick<ListFiche, 'lastScanAt' | 'createdAt'>, now = new Date()): string {
  if (f.lastScanAt) return `Scanné ${timeAgo(f.lastScanAt, now)}`
  const format = year.format(f.createdAt) === year.format(now) ? dayMonth : dayMonthYear
  return `Analysée le ${format.format(f.createdAt)}`
}

const NOUN_WORDS: Record<FoodNoun, string> = { croquettes: 'croquettes', patee: 'pâtée', aliment: 'aliment', friandise: 'friandise' }

/** Ligne sous le produit : type (facultatif), date, origine de la note, réserve sur une note basse. */
export function ficheMeta(f: ListFiche, { now = new Date(), showNoun = false }: { now?: Date; showNoun?: boolean } = {}): string {
  return [
    showNoun ? NOUN_WORDS[f.noun] : null,
    ficheDateLabel(f, now),
    f.reviewed ? 'fiche relue' : 'analyse automatique',
    f.score !== null && f.score < LOW_SCORE_BELOW ? 'selon la composition affichée' : null,
  ]
    .filter(Boolean)
    .join(' · ')
}
