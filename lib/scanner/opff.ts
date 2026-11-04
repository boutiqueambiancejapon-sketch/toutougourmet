import { parseIngredientText } from './ingredient-text'
import { animalKind } from './ingredients'
import { analyseLabel } from './analyse'
import { WET_MOISTURE } from './food-noun'
import { CONFIDENCE_FIELDS, type AnalyticalKey, type ExtractedLabel, type ImageType } from './types'

// @cdc lot 6 — conversion d'une fiche Open Pet Food Facts (API v2, licence ODbL) vers le format
// de lecture des photos (ExtractedLabel), pour calculer NOTRE note sans appel à l'IA.
// Fonction pure, testée par scripts/test-scanner-score.ts. Champs réels de l'API vérifiés le
// 2026-11-02 : constituants des aliments pour animaux en crude-protein, crude-fat, crude-fibre,
// crude-ash, moisture (unité %), parfois saisis dans les champs « humains » proteins, fat, fiber.
// Le calcium et le phosphore ne sont repris qu'en % : la base mélange g et % pour ces deux champs.

export const OPFF_FIELDS = 'code,product_name,product_name_fr,brands,ingredients_text_fr,ingredients_text,nutriments,categories_tags,additives_tags,lang'

export interface OpffProduct {
  code?: string
  product_name?: string
  product_name_fr?: string
  brands?: string
  ingredients_text_fr?: string
  ingredients_text?: string
  nutriments?: Record<string, number | string | undefined>
  categories_tags?: string[]
  additives_tags?: string[]
}

const NUTRIMENTS: Record<AnalyticalKey, string[]> = {
  proteines: ['crude-protein', 'proteins'],
  matieresGrasses: ['crude-fat', 'fat'],
  cellulose: ['crude-fibre', 'fiber'],
  cendres: ['crude-ash'],
  humidite: ['moisture'],
  calcium: ['calcium'],
  phosphore: ['phosphorus'],
}

/** Énergie de la fiche en kcal pour 100 g (friandises surtout), si elle est plausible. */
function energyKcal100g(n: OpffProduct['nutriments']): number | null {
  const v = Number(n?.['energy-kcal_100g'])
  return Number.isFinite(v) && v >= 20 && v <= 900 ? Math.round(v * 10) / 10 : null
}

function nutriment(n: OpffProduct['nutriments'], key: AnalyticalKey): number | null {
  if (!n) return null
  for (const name of NUTRIMENTS[key]) {
    const v = Number(n[`${name}_100g`] ?? n[name])
    if (!Number.isFinite(v) || v < 0 || v > 100) continue
    if ((key === 'calcium' || key === 'phosphore') && (n[`${name}_unit`] !== '%' || v < 0.2 || v > 5)) continue
    return Math.round(v * 100) / 100
  }
  return null
}

// Friandises, snacks, os à mâcher, aliments complémentaires : barème friandise
const TREAT_TAG = /treat|friandise|biscuit|snack|chew|os-a-macher|complementar|complementaire/
const TREAT_NAME = /(friandises?|treats?|snacks?|biscuits?|os[- ]a[- ]macher|chews?|batonnets?|sticks?|dental|rawhide|complementary|complementaire)/i
const COMPLETE_NAME = /croquettes?|kibble|complet/i
const CAT_TAG = /cat-(food|treats?|snacks?)|(aliments?|friandises?)-pour-chats?|:chats?\b/
const DOG_TAG = /dog-(food|treats?|snacks?)/

/** Sans accents, pour comparer les noms saisis dans la base. */
export const stripAccents = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '')

/** Nom du produit tel que le lit opffImageType. */
export const opffName = (p: Pick<OpffProduct, 'product_name' | 'product_name_fr'>) => [p.product_name_fr, p.product_name].filter(Boolean).join(' ')

/**
 * Seule détection du type d'une fiche Open Pet Food Facts, pour le scan par code-barres comme
 * pour l'import : aliment pour chat (refusé), friandise (barème friandise) ou aliment complet.
 * Catégories d'abord ; à défaut, le nom (« Friandises au poulet » rangé en simple dog-food).
 */
export function opffImageType(tags: string[] = [], name = ''): ImageType {
  const t = tags.join(' ')
  if (CAT_TAG.test(t) && !DOG_TAG.test(t)) return 'aliment-chat'
  if (TREAT_TAG.test(t)) return 'friandise'
  const n = stripAccents(name)
  return TREAT_NAME.test(n) && !COMPLETE_NAME.test(n) ? 'friandise' : 'aliment-chien'
}

// Pâtée : catégories ou nom « wet », « pâtée », « boîte », « terrine », « mousse »… (sans accents)
const WET_WORDS = /\b(wet|humide|patees?|pate|terrines?|mousses?|boites?|conserves?|gelee|en sauce|loaf|canned|tins?|chunks|bouchees|eminces|effiloches)\b/i
const DRY_WORDS = /\b(dry|croquettes?|kibbles?|seche?s?|trocken|secco)\b/i

/**
 * Sec, humide ou inconnu : l'humidité déclarée d'abord (≥ 60 % : pâtée, ≤ 14 % : croquettes),
 * puis les catégories, puis le nom. Sans indice : « inconnu » (la note le traite comme un sec).
 */
export function opffFoodType(tags: string[] = [], name: string, moisture: number | null): ExtractedLabel['typeAliment'] {
  if (moisture !== null && moisture >= WET_MOISTURE) return 'humide'
  if (moisture !== null && moisture <= 14) return 'sec'
  for (const text of [stripAccents(tags.join(' ')), stripAccents(name)]) {
    if (WET_WORDS.test(text)) return 'humide'
    if (DRY_WORDS.test(text)) return 'sec'
  }
  return 'inconnu'
}

const firstBrand = (b?: string) => b?.split(',')[0]?.trim() || null
const clean = (s?: string) => s?.replace(/\s+/g, ' ').trim().slice(0, 160) || null

// @cdc scanner — Open Pet Food Facts garde souvent les noms saisis en minuscules (« dokaz »,
// « hühnerbrust ») : on ne touche qu'aux textes sans aucune majuscule. Marque : chaque mot ;
// produit : la première lettre seulement.
const hasUpper = (s: string) => s !== s.toLocaleLowerCase('fr')
const upperFirst = (w: string) => w.charAt(0).toLocaleUpperCase('fr') + w.slice(1)
export const brandCase = (s: string | null) => (s && !hasUpper(s) ? s.split(/(\s+|-)/).map(upperFirst).join('') : s)
export const productCase = (s: string | null) => (s && !hasUpper(s) ? upperFirst(s) : s)

export type OpffVerdict =
  | { kind: 'complete'; label: ExtractedLabel }
  /** Données partielles : on passe aux photos en préremplissant la marque et le produit. */
  | { kind: 'incomplete'; brand: string | null; product: string | null; type: ImageType }

/** Pourquoi une fiche ne peut pas être notée sans photo (compteurs de scripts/opff-import.ts). */
export type OpffUnusableReason = 'pas-aliment-chien' | 'composition' | 'constituants' | 'valeurs-implausibles' | 'note-impossible'

/** Conversion seule, sans juger si la fiche est exploitable. */
/** Part animale connue quand seuls des composants sont chiffrés (« Viandes (dont bœuf 4 %) ») : un minimum. */
export function partialAnimalShare(partiels: { nom: string; pourcentage: number }[]): number | null {
  const sum = partiels.filter((p) => animalKind(p.nom) !== null).reduce((total, p) => total + p.pourcentage, 0)
  return sum > 0 && sum <= 100 ? sum : null
}

export function opffLabel(p: OpffProduct, ean: string): ExtractedLabel {
  const type = opffImageType(p.categories_tags, opffName(p))
  const brand = brandCase(clean(firstBrand(p.brands) ?? undefined))
  const product = productCase(clean(p.product_name_fr || p.product_name))
  const text = p.ingredients_text_fr || p.ingredients_text || ''
  const parsed = parseIngredientText(text)
  const additifs = [...parsed.additifs]
  for (const tag of p.additives_tags ?? []) {
    const code = tag.replace(/^en:/, '').toUpperCase()
    if (/^E\d{3}[A-Z]?$/.test(code) && !additifs.some((a) => a.toUpperCase().includes(code))) additifs.push(code)
  }
  const constituants = Object.fromEntries((Object.keys(NUTRIMENTS) as AnalyticalKey[]).map((k) => [k, nutriment(p.nutriments, k)])) as ExtractedLabel['constituants']
  const has = (v: unknown) => (v === null || (Array.isArray(v) && v.length === 0) ? 'absent' : 'haute')
  return {
    estUneEtiquette: true,
    typeImage: type,
    lisibilite: 'nette',
    marque: brand,
    produit: product,
    ean,
    espece: type === 'aliment-chat' ? 'chat' : 'chien',
    typeAliment: opffFoodType(p.categories_tags, opffName(p), constituants.humidite),
    ingredients: parsed.ingredients,
    constituants,
    additifs: additifs.slice(0, 60),
    partAnimaleDeclaree: partialAnimalShare(parsed.partiels),
    energie: { kcalKg: null, kcal100g: energyKcal100g(p.nutriments), kcalPiece: null, poidsPieceG: null },
    confiance: Object.fromEntries(
      CONFIDENCE_FIELDS.map((k) => [k, has(k === 'marque' ? brand : k === 'produit' ? product : k === 'ean' ? ean : k === 'ingredients' ? parsed.ingredients : k === 'additifs' ? additifs : constituants.proteines)]),
    ) as ExtractedLabel['confiance'],
    illisibles: [],
    champsDouteux: [],
  }
}

/**
 * Exploitable : null, sinon la raison. Aliment complet : ingrédients ET protéines ET matières
 * grasses plausibles, et notre barème arrive à noter. Des valeurs hors de toute croquette (ex. 2 %
 * de protéines, saisie erronée dans la base) renvoient aux photos plutôt que de produire une note
 * fausse. Friandise : son barème ne lit que la composition (et l'énergie, si elle est donnée).
 */
export function opffUnusableReason(label: ExtractedLabel): OpffUnusableReason | null {
  if (label.typeImage === 'friandise') {
    if (label.ingredients.length < 1) return 'composition'
    return analyseLabel(label).score === null ? 'note-impossible' : null
  }
  if (label.typeImage !== 'aliment-chien') return 'pas-aliment-chien'
  if (label.ingredients.length < 3) return 'composition'
  const c = label.constituants
  if (c.proteines === null || c.matieresGrasses === null) return 'constituants'
  const sum = (c.proteines ?? 0) + (c.matieresGrasses ?? 0) + (c.cellulose ?? 0) + (c.cendres ?? 0) + (c.humidite ?? 0)
  const plausible =
    sum <= 100 &&
    (label.typeAliment === 'humide' ? c.proteines >= 3 : c.proteines >= 12 && c.proteines <= 70 && c.matieresGrasses >= 3 && c.matieresGrasses <= 45)
  if (!plausible) return 'valeurs-implausibles'
  return analyseLabel(label).score === null ? 'note-impossible' : null
}

export function opffToLabel(p: OpffProduct, ean: string): OpffVerdict {
  const label = opffLabel(p, ean)
  return opffUnusableReason(label) === null ? { kind: 'complete', label } : { kind: 'incomplete', brand: label.marque, product: label.produit, type: label.typeImage }
}
