import { classifyExtraction } from './outcome'
import { opffImageType, opffLabel, opffUnusableReason, type OpffProduct, type OpffUnusableReason } from './opff'
import { scoreLabel } from './score'
import { cleanEan } from './slug'
import type { ExtractedLabel } from './types'

// @cdc lot 6 — copie hebdomadaire d'Open Pet Food Facts (licence ODbL) : fonctions pures qui
// trient une ligne de l'export JSONL (chien ou non, aliment complet ou friandise), la réduisent
// aux champs utiles et décident si notre barème peut la noter. La note elle-même vient de
// opffLabel / opffUnusableReason / classifyExtraction / scoreLabel, comme pour un scan.
// Appelé par scripts/opff-import.ts et lib/server/opff-store.ts. Tests : scripts/test-opff-import.ts.

/** Ligne de l'export complet (sur-ensemble de la réponse de l'API v2). */
export interface OpffDumpProduct extends OpffProduct {
  generic_name_fr?: string
  countries_tags?: string[]
  lang?: string
  last_modified_t?: number
  product_type?: string
  images?: { selected?: { front?: Record<string, { rev?: string | number } | undefined> } }
  /** Nouveau format des valeurs nutritionnelles (l'export laisse `nutriments` vide depuis 2025) */
  nutrition?: { aggregated_set?: { nutrients?: Record<string, OpffNutrient | undefined> } }
}

export interface OpffNutrient {
  value?: number
  unit?: string
  /** Base de la valeur saisie : 100g, 1kg, serving, 100ml */
  source_per?: string
}

export type OpffSpecies = 'chien' | 'chat' | 'autre'
/**
 * Aliment complet ou friandise, d'après les catégories et le nom. Emplacement prévu pour le
 * barème « friandise » (branche feat/scanner-treats) : aujourd'hui seules les fiches `complete`
 * sont notées, les `treat` sont gardées dans la table sans note.
 */
export type OpffFoodKind = 'complete' | 'treat'

// Mots entiers dans une étiquette de catégorie (« en:dry-dog-food », « fr:croquettes-pour-chiens »)
const DOG = /(^|[-:\s])(dogs?|chiens?|chiots?|canine|puppy|puppies|honden?|hond|hunde?|hundefutter|cane|cani|cucciol[oi]|perros?|cachorros?)($|[-\s])/i
const CAT = /(^|[-:\s])(cats?|chats?|chatons?|kitten|katten?|katze|gatt[oi]|gatos?|felin[es]*|feline)($|[-\s])/i
// Catégories communes aux deux espèces : elles ne disent rien de l'animal
const SHARED = new Set(['en:dog-and-cat-food', 'en:pet-food'])
const TREAT = /(friandises?|treats?|snacks?|biscuits?|os[- ]a[- ]macher|chews?|batonnets?|sticks?|dental|rawhide|complementary|complementaire)/i

const strip = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '')

/** Chien si les catégories (ou à défaut le nom) parlent de chien et pas de chat. */
export function opffSpecies(p: OpffDumpProduct): OpffSpecies {
  const tags = (p.categories_tags ?? []).filter((t) => !SHARED.has(t)).map(strip)
  const dogTag = tags.some((t) => DOG.test(t))
  const catTag = tags.some((t) => CAT.test(t))
  if (dogTag !== catTag) return dogTag ? 'chien' : 'chat'
  const name = strip([p.product_name_fr, p.product_name, p.generic_name_fr].filter(Boolean).join(' '))
  const dogName = DOG.test(name)
  const catName = CAT.test(name)
  if (dogName && !catName) return 'chien'
  if (catName && !dogName) return 'chat'
  return 'autre'
}

export function opffFoodKind(p: OpffDumpProduct): OpffFoodKind {
  if (opffImageType(p.categories_tags) === 'friandise') return 'treat'
  const name = strip([p.product_name_fr, p.product_name].filter(Boolean).join(' '))
  return TREAT.test(name) && !/croquettes?|kibble|complet/i.test(name) ? 'treat' : 'complete'
}

/** Code-barres normalisé comme pour un scan : EAN-8 ou EAN-13 valide (UPC-A complété d'un 0). */
export function normalizeOpffEan(code: unknown): string | null {
  if (typeof code !== 'string' && typeof code !== 'number') return null
  let digits = String(code).replace(/\D/g, '')
  if (digits.length === 12) digits = `0${digits}`
  if (digits.length === 14 && digits.startsWith('0')) digits = digits.slice(1)
  return cleanEan(digits)
}

/** Nutriments repris (ceux que lit lib/scanner/opff.ts), le reste de l'objet est ignoré. */
const NUTRIMENT_KEYS = ['crude-protein', 'proteins', 'crude-fat', 'fat', 'crude-fibre', 'fiber', 'crude-ash', 'moisture', 'calcium', 'phosphorus']

function pickNutriments(n: OpffProduct['nutriments']): Record<string, number | string> {
  const out: Record<string, number | string> = {}
  if (!n) return out
  for (const k of NUTRIMENT_KEYS)
    for (const suffix of ['_100g', '', '_unit']) {
      const v = n[`${k}${suffix}`]
      if (typeof v === 'number' || (typeof v === 'string' && v.length <= 20)) out[`${k}${suffix}`] = v
    }
  return out
}

/**
 * Valeurs du nouveau format ramenées à l'ancien (`crude-protein_100g`, `crude-protein_unit`), celui
 * que lit lib/scanner/opff.ts : un % ne dépend pas de la base ; des grammes pour 1 kg sont
 * divisés par 10 ; une valeur par portion ou pour 100 ml est ignorée.
 */
export function flattenNutrition(nutrients: Record<string, OpffNutrient | undefined> | undefined): Record<string, number | string> {
  const out: Record<string, number | string> = {}
  if (!nutrients) return out
  for (const key of NUTRIMENT_KEYS) {
    const n = nutrients[key]
    if (!n || typeof n.value !== 'number' || !Number.isFinite(n.value)) continue
    const unit = n.unit ?? ''
    let value: number | null = null
    if (unit === '%') value = n.value
    else if (unit === 'g' && n.source_per === '100g') value = n.value
    else if (unit === 'g' && n.source_per === '1kg') value = n.value / 10
    if (value === null) continue
    out[`${key}_100g`] = Math.round(value * 10000) / 10000
    out[`${key}_unit`] = unit
  }
  return out
}

function nutrimentsOf(p: OpffDumpProduct): Record<string, number | string> {
  const flat = pickNutriments(p.nutriments)
  return Object.keys(flat).length > 0 ? flat : flattenNutrition(p.nutrition?.aggregated_set?.nutrients)
}

/** Image de face servie par Open Pet Food Facts (400 px), ou null. */
export function opffImageUrl(code: string, p: OpffDumpProduct): string | null {
  const fronts = p.images?.selected?.front
  if (!fronts) return null
  const lang = [p.lang, 'fr', 'en', ...Object.keys(fronts)].find((l): l is string => !!l && !!fronts[l]?.rev)
  if (!lang) return null
  const path = code.length > 8 ? code.replace(/^(\d{3})(\d{3})(\d{3})(\d+)$/, '$1/$2/$3/$4') : code
  return `https://images.openpetfoodfacts.org/images/products/${path}/front_${lang}.${fronts[lang]?.rev}.400.jpg`
}

const text = (s: unknown, max: number) => (typeof s === 'string' ? s.replace(/\s+/g, ' ').trim().slice(0, max) || null : null)
const tags = (a: unknown, max: number) => (Array.isArray(a) ? a.filter((t): t is string => typeof t === 'string' && t.length <= 120).slice(0, max) : [])

/** Ce que l'on garde d'une fiche (colonnes de app.opff_product). L'empreinte porte sur ces champs. */
export interface OpffRecord {
  ean: string
  name: string | null
  nameFr: string | null
  brand: string | null
  ingredientsText: string | null
  ingredientsTextFr: string | null
  nutriments: Record<string, number | string>
  categories: string[]
  additives: string[]
  countries: string[]
  imageUrl: string | null
  lang: string | null
  kind: OpffFoodKind
  lastModified: Date | null
}

export function toOpffRecord(ean: string, p: OpffDumpProduct): OpffRecord {
  const t = Number(p.last_modified_t)
  return {
    ean,
    name: text(p.product_name, 300),
    nameFr: text(p.product_name_fr, 300),
    brand: text(p.brands, 200),
    ingredientsText: text(p.ingredients_text, 6000),
    ingredientsTextFr: text(p.ingredients_text_fr, 6000),
    nutriments: nutrimentsOf(p),
    categories: tags(p.categories_tags, 60),
    additives: tags(p.additives_tags, 80),
    countries: tags(p.countries_tags, 40),
    imageUrl: opffImageUrl(ean, p),
    lang: text(p.lang, 8),
    kind: opffFoodKind(p),
    lastModified: Number.isFinite(t) && t > 0 ? new Date(t * 1000) : null,
  }
}

/** Retour au format de l'API, pour réutiliser opffToLabel (scan) et opffLabel (import). */
export function recordToProduct(r: Pick<OpffRecord, 'ean' | 'name' | 'nameFr' | 'brand' | 'ingredientsText' | 'ingredientsTextFr' | 'nutriments' | 'categories' | 'additives'>): OpffProduct {
  return {
    code: r.ean,
    product_name: r.name ?? undefined,
    product_name_fr: r.nameFr ?? undefined,
    brands: r.brand ?? undefined,
    ingredients_text: r.ingredientsText ?? undefined,
    ingredients_text_fr: r.ingredientsTextFr ?? undefined,
    nutriments: r.nutriments,
    categories_tags: r.categories,
    additives_tags: r.additives,
  }
}

/** Champs de l'empreinte : tout sauf la date de modification (un simple passage ne change rien). */
export function hashInput(r: OpffRecord): string {
  return JSON.stringify({ ...r, lastModified: undefined })
}

export type OpffSkipReason = OpffUnusableReason | 'friandise' | 'lecture-incomplete'

export type OpffAssessment =
  | { scorable: true; label: ExtractedLabel; score: number; indexable: boolean }
  | { scorable: false; reason: OpffSkipReason }

/** Constituants exigés par la règle d'indexation proposée (OPFF_INDEX_POLICY=complete). */
export const INDEX_MIN_CONSTITUENTS = 5

/**
 * Règle d'indexation proposée pour une fiche importée non relue : marque, nom, composition
 * (3 ingrédients au moins, déjà exigés pour noter) et 5 constituants analytiques sur 7.
 */
export function meetsIndexRule(label: ExtractedLabel, score: number | null): boolean {
  const constituents = Object.values(label.constituants).filter((v) => v !== null).length
  return score !== null && !!label.marque && !!label.produit && label.ingredients.length >= 3 && constituents >= INDEX_MIN_CONSTITUENTS
}

/** Même décision que pour un scan par code-barres, puis la règle d'indexation. */
export function assessOpff(r: OpffRecord): OpffAssessment {
  // Barème friandise (feat/scanner-treats) : à brancher ici une fois fusionné, voir PROGRESS.md
  if (r.kind === 'treat') return { scorable: false, reason: 'friandise' }
  const label = opffLabel(recordToProduct(r), r.ean)
  const reason = opffUnusableReason(label)
  if (reason) return { scorable: false, reason }
  if (classifyExtraction(label).kind !== 'complete') return { scorable: false, reason: 'lecture-incomplete' }
  const score = scoreLabel(label).score
  if (score === null) return { scorable: false, reason: 'note-impossible' }
  return { scorable: true, label, score, indexable: meetsIndexRule(label, score) }
}
