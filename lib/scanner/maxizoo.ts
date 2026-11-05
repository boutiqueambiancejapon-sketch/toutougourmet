import { foodNoun } from './food-noun'
import { parseIngredientText } from './ingredient-text'
import { partialAnimalShare } from './opff'
import { ANALYTICAL_KEYS, CONFIDENCE_FIELDS, type AnalyticalKey, type ExtractedLabel } from './types'

// @cdc scanner — fiches Maxi Zoo (fonctions pures, testées par scripts/test-maxizoo.ts). Le fichier
// Awin donne le produit, le code-barres et l'adresse ; la page donne la composition et les
// constituants, recopiés sans IA. Une page incomplète ou mêlant plusieurs recettes est écartée.

export const MAXI_ZOO_CATEGORIES: Record<string, Pick<ExtractedLabel, 'typeImage' | 'typeAliment'>> = {
  'Chien > Nourriture pour chien > Croquettes pour chiens': { typeImage: 'aliment-chien', typeAliment: 'sec' },
  'Chien > Nourriture pour chien > Nourriture humide pour chien': { typeImage: 'aliment-chien', typeAliment: 'humide' },
  'Chien > Nourriture pour chien > Friandises et boissons': { typeImage: 'friandise', typeAliment: 'autre' },
}

export interface MaxiZooItem {
  brand: string
  name: string
  ean: string
  category: string
}

export type MaxiZooParse =
  | { ok: true; constituants: Record<AnalyticalKey, number | null>; composition: string; kcal100g: number | null }
  | { ok: false; reason: 'section-absente' | 'plusieurs-recettes' | 'chiffres-manquants' | 'composition-absente' }

const PATTERNS: Record<AnalyticalKey, string> = {
  proteines: 'prot[ée]ines?(?: brutes?)?',
  matieresGrasses: 'mati[èe]res? grasses?(?: brutes?)?|teneur en mati[èe]res? grasses?|graisses? brutes?',
  cendres: 'cendres?(?: brutes?)?',
  cellulose: 'cellulose(?: brute)?|fibres?(?: brutes?)?',
  humidite: 'humidit[ée]',
  calcium: 'calcium',
  phosphore: 'phosphore',
}

function percentAfter(text: string, pattern: string): number | null {
  const m = new RegExp(String.raw`(?:^|[^\p{L}])(?:${pattern})\s*:?\s*(\d+(?:[.,]\d+)?)\s*%`, 'iu').exec(text)
  if (!m) return null
  const n = Number(m[1].replace(',', '.'))
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : null
}

/** Texte brut de la page, sans balises ni scripts. */
export function pageText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&apos;|&rsquo;/g, "'")
    .replace(/\s+/g, ' ')
}

const MIX_NAME = /\b(mix|assortiment|assorti(e|es|s)?|vari[ée]t[ée]s?|multipack|s[ée]lection mixte|lot mixte|coffret|\d+\s*saveurs?)\b/i
export const isMixedProduct = (name: string): boolean => MIX_NAME.test(name)

export function parseMaxiZooPage(text: string): MaxiZooParse {
  const start = text.indexOf('Composants analytiques')
  if (start < 0) return { ok: false, reason: 'section-absente' }
  const compoAt = text.indexOf('Composition', start)
  const block = text.slice(start, compoAt > start && compoAt - start < 900 ? compoAt : start + 600)
  // Deux recettes dans la même section : le premier chiffre ne vaudrait que pour l'une d'elles.
  if ((block.match(/prot[ée]ines?/gi) ?? []).length > 1) return { ok: false, reason: 'plusieurs-recettes' }
  const constituants = Object.fromEntries(ANALYTICAL_KEYS.map((k) => [k, percentAfter(block, PATTERNS[k])])) as Record<AnalyticalKey, number | null>
  if (constituants.proteines === null || constituants.matieresGrasses === null) return { ok: false, reason: 'chiffres-manquants' }
  if (constituants.proteines + constituants.matieresGrasses + (constituants.cendres ?? 0) + (constituants.cellulose ?? 0) > 100) return { ok: false, reason: 'chiffres-manquants' }
  if (compoAt < 0) return { ok: false, reason: 'composition-absente' }
  const after = text.slice(compoAt + 'Composition'.length)
  const end = after.search(/Peut contenir|Additifs par kg|Additifs nutritionnels|Mode d.emploi|Conseils? d.utilisation|L\.I\.P\.|Teneur en humidit|Informations concernant|Le montant de commande/i)
  const composition = (end > 0 ? after.slice(0, end) : after.slice(0, 1500)).trim().replace(/^[:\s]+/, '').replace(/^.{0,120}?\(\d{5,}\)\s*:?\s*/, '')
  if (composition.length < 15) return { ok: false, reason: 'composition-absente' }
  if (constituants.humidite === null) constituants.humidite = percentAfter(text.slice(compoAt, compoAt + 2500), PATTERNS.humidite)
  const kcal = /(\d{3,4}(?:[.,]\d+)?)\s*kcal\s*\/\s*kg/i.exec(block)
  return { ok: true, constituants, composition, kcal100g: kcal ? Math.round(Number(kcal[1].replace(',', '.')) / 10) : null }
}

/** Marque et poids de paquet retirés du nom du fichier Awin. */
export function productName(item: Pick<MaxiZooItem, 'brand' | 'name'>): string {
  const brand = item.brand.trim()
  const name = item.name.trim()
  return name.toLowerCase().startsWith(brand.toLowerCase()) ? name.slice(brand.length).trim() || name : name
}

export function maxiZooLabel(item: MaxiZooItem, page: Extract<MaxiZooParse, { ok: true }>): ExtractedLabel | null {
  const type = MAXI_ZOO_CATEGORIES[item.category]
  if (!type) return null
  const parsed = parseIngredientText(page.composition)
  if (parsed.ingredients.length < 1) return null
  const has = (v: unknown) => (v === null || (Array.isArray(v) && v.length === 0) ? 'absent' : 'haute')
  const label: ExtractedLabel = {
    estUneEtiquette: true,
    typeImage: type.typeImage,
    lisibilite: 'nette',
    marque: item.brand.trim() || null,
    produit: productName(item),
    ean: item.ean,
    espece: 'chien',
    typeAliment: type.typeAliment,
    ingredients: parsed.ingredients,
    constituants: page.constituants,
    additifs: parsed.additifs,
    partAnimaleDeclaree: partialAnimalShare(parsed.partiels),
    energie: { kcalKg: null, kcal100g: page.kcal100g, kcalPiece: null, poidsPieceG: null },
    confiance: Object.fromEntries(CONFIDENCE_FIELDS.map((k) => [k, has(k === 'marque' ? item.brand : k === 'ingredients' ? parsed.ingredients : k === 'additifs' ? parsed.additifs : 'x')])) as ExtractedLabel['confiance'],
    illisibles: [],
    champsDouteux: [],
  }
  return foodNoun(label) ? label : null
}
