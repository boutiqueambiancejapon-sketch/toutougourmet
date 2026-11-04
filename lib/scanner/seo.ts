import { brands, type Brand } from '@/data/brands'
import { NOUNS, type FoodNoun } from './food-noun'
import { bandFor, type Band, type ProductKind } from './score'
import { slugify } from './slug'

// @cdc lot 6 — référencement des fiches du scanner (fonctions pures, testées par
// scripts/test-scanner-score.ts) : title de fiche ≤ 60 caractères, adresse des pages marque,
// marque partenaire et alternatives proposées sous une note faible.

export const TITLE_MAX = 60
/** Fiches relues nécessaires pour indexer le classement /croquettes */
export const RANKING_MIN_REVIEWED = 5
/** Fiches relues nécessaires pour indexer une page marque */
export const BRAND_MIN_REVIEWED = 2
/** Sous cette note, la fiche propose des marques partenaires */
export const ALTERNATIVE_BELOW = 55
export const RANKING_PAGE_SIZE = 20

/** Nom du produit sans la marque ni les mots génériques déjà dans le title. */
export function shortProduct(brand: string | null, product: string | null): string {
  let p = (product ?? '').replace(/\s+/g, ' ').trim()
  if (brand) {
    const escaped = brand.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    p = p.replace(new RegExp(`^${escaped}\\s*[-:,]?\\s*`, 'i'), '')
  }
  return p
    .replace(/(?<![\p{L}-])(croquettes?|friandises?|pâtées?)(?![\p{L}-])/giu, '')
    .replace(/\bpour\s+chiens?\b/gi, '')
    .replace(/\s+[-–,:]\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Coupe au dernier mot entier qui tient dans `max` caractères (sans mot de liaison final). */
function cutWords(text: string, max: number): string {
  if (text.length <= max) return text
  const words = text.split(' ')
  let out = ''
  for (const w of words) {
    const next = out ? `${out} ${w}` : w
    if (next.length > max) break
    out = next
  }
  return out.replace(/\s+(de|du|des|à|au|aux|et|en|la|le|les|pour|avec|sans)$/i, '').replace(/[\s,–-]+$/, '')
}

/**
 * « Croquettes {Marque} {produit court} : avis et note {note}/100 » (« Pâtée … », « Aliment … »,
 * « Friandise … » selon le produit : lib/scanner/food-noun.ts), 60 caractères au plus.
 */
export function ficheTitle(brand: string | null, product: string | null, score: number | null, noun: FoodNoun | ProductKind = 'croquettes'): string {
  const suffix = score === null ? ' : avis et composition' : ` : avis et note ${score}/100`
  const word = NOUNS[noun === 'treat' ? 'friandise' : noun === 'complete' ? 'croquettes' : noun].title
  const head = brand ? `${word} ${brand.trim()}` : word
  const short = shortProduct(brand, product)
  const room = TITLE_MAX - head.length - suffix.length - 1
  const fitted = room >= 4 ? cutWords(short, room) : ''
  const title = fitted ? `${head} ${fitted}${suffix}` : `${head}${suffix}`
  return title.length <= TITLE_MAX ? title : `${cutWords(head, TITLE_MAX - suffix.length)}${suffix}`
}

export function brandSlug(brand: string | null): string | null {
  const s = slugify(brand ?? '')
  return s.length >= 2 ? s : null
}

/** Marque partenaire du site qui correspond à la marque lue sur l'étiquette. */
export function partnerBrand(brand: string | null): Brand | null {
  const s = brandSlug(brand)
  if (!s) return null
  return brands.find((b) => s === b.slug || s === slugify(b.name) || s.startsWith(`${b.slug}-`)) ?? null
}

export interface Alternative {
  brand: Brand
  reason: string
}

/** Choix du propriétaire : Dog Chef et Franklin d'abord (DECISIONS.md), les autres ensuite. */
const FIRST_PARTNERS = ['dog-chef', 'franklin']
const partnerRank = (slug: string): number => {
  const i = FIRST_PARTNERS.indexOf(slug)
  return i < 0 ? FIRST_PARTNERS.length : i
}

/** Une ou deux marques partenaires qui vendent des croquettes, hors marque de la fiche et hors rupture. */
export function alternativesFor(brand: string | null, score: number | null, kind: ProductKind = 'complete'): Alternative[] {
  // Pas de marque partenaire de friandises : rien à proposer à la place d'une friandise
  if (kind === 'treat' || score === null || score >= ALTERNATIVE_BELOW) return []
  const own = partnerBrand(brand)?.slug
  return brands
    .filter((b) => b.slug !== own && !b.stockNote && b.animal.includes('chien') && b.type.includes('croquettes'))
    .sort((a, b) => partnerRank(a.slug) - partnerRank(b.slug) || b.scores.qualiteIngredients - a.scores.qualiteIngredients)
    .slice(0, 2)
    .map((b) => ({ brand: b, reason: `${b.facts.strength}. Pour qui : ${b.facts.bestFor.charAt(0).toLowerCase()}${b.facts.bestFor.slice(1)}.` }))
}

export const BAND_FILTERS: { band: Band; label: string }[] = [
  { band: 'tres-bon', label: '75 et plus' },
  { band: 'correct', label: '55 à 74' },
  { band: 'moyen', label: '35 à 54' },
  { band: 'faible', label: 'moins de 35' },
]

export function parseBand(value: string | string[] | undefined): Band | null {
  const v = Array.isArray(value) ? value[0] : value
  return BAND_FILTERS.some((f) => f.band === v) ? (v as Band) : null
}

export function inBand(score: number, band: Band | null): boolean {
  return band === null || bandFor(score) === band
}

/** Onglet du classement /croquettes : aliments complets (défaut) ou friandises (?type=friandises). */
export function parseKind(value: string | string[] | undefined): ProductKind {
  return (Array.isArray(value) ? value[0] : value) === 'friandises' ? 'treat' : 'complete'
}

/** Recettes de friandises maison du site (viande ou poisson en premier), proposées sous une friandise mal notée. */
export const HOMEMADE_TREATS: { label: string; href: string }[] = [
  { label: 'friandises au foie séché', href: '/chien/alimentation-quotidienne/recette-friandises-foie-seche-chien' },
  { label: 'friandises saumon et patate douce', href: '/chien/alimentation-quotidienne/recette-friandises-saumon-patate-douce-chien' },
]

export function parsePage(value: string | string[] | undefined): number {
  const n = Number(Array.isArray(value) ? value[0] : value)
  return Number.isInteger(n) && n >= 1 && n <= 1000 ? n : 1
}

/** Un produit proposé à la place d'un autre doit l'être pour sa note : 70 au moins, et 15 points de mieux. */
export const betterEnough = (candidate: number, current: number): boolean => candidate >= 70 && candidate - current >= 15
