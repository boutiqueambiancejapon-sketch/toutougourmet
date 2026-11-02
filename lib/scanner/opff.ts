import { parseIngredientText } from './ingredient-text'
import { scoreLabel } from './score'
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

export function opffImageType(tags: string[] = []): ImageType {
  const t = tags.join(' ')
  if (/cat-food|aliments?-pour-chats?|:chats?\b/.test(t) && !/dog-food/.test(t)) return 'aliment-chat'
  if (/treat|friandise|biscuit|snack|chew|os-a-macher|complementary/.test(t)) return 'friandise'
  return 'aliment-chien'
}

const firstBrand = (b?: string) => b?.split(',')[0]?.trim() || null
const clean = (s?: string) => s?.replace(/\s+/g, ' ').trim().slice(0, 160) || null

export type OpffVerdict =
  | { kind: 'complete'; label: ExtractedLabel }
  /** Données partielles : on passe aux photos en préremplissant la marque et le produit. */
  | { kind: 'incomplete'; brand: string | null; product: string | null; type: ImageType }

export function opffToLabel(p: OpffProduct, ean: string): OpffVerdict {
  const type = opffImageType(p.categories_tags)
  const brand = clean(firstBrand(p.brands) ?? undefined)
  const product = clean(p.product_name_fr || p.product_name)
  const text = p.ingredients_text_fr || p.ingredients_text || ''
  const parsed = parseIngredientText(text)
  const additifs = [...parsed.additifs]
  for (const tag of p.additives_tags ?? []) {
    const code = tag.replace(/^en:/, '').toUpperCase()
    if (/^E\d{3}[A-Z]?$/.test(code) && !additifs.some((a) => a.toUpperCase().includes(code))) additifs.push(code)
  }
  const constituants = Object.fromEntries((Object.keys(NUTRIMENTS) as AnalyticalKey[]).map((k) => [k, nutriment(p.nutriments, k)])) as ExtractedLabel['constituants']
  const has = (v: unknown) => (v === null || (Array.isArray(v) && v.length === 0) ? 'absent' : 'haute')
  const label: ExtractedLabel = {
    estUneEtiquette: true,
    typeImage: type,
    lisibilite: 'nette',
    marque: brand,
    produit: product,
    ean,
    espece: type === 'aliment-chat' ? 'chat' : 'chien',
    typeAliment: /wet|humide|pate|terrine/.test((p.categories_tags ?? []).join(' ')) ? 'humide' : 'sec',
    ingredients: parsed.ingredients,
    constituants,
    additifs: additifs.slice(0, 60),
    partAnimaleDeclaree: null,
    confiance: Object.fromEntries(
      CONFIDENCE_FIELDS.map((k) => [k, has(k === 'marque' ? brand : k === 'produit' ? product : k === 'ean' ? ean : k === 'ingredients' ? parsed.ingredients : k === 'additifs' ? additifs : constituants.proteines)]),
    ) as ExtractedLabel['confiance'],
    illisibles: [],
    champsDouteux: [],
  }
  // Exploitable : ingrédients ET protéines ET matières grasses plausibles, et notre barème arrive
  // à noter. Des valeurs hors de toute croquette (ex. 2 % de protéines, saisie erronée dans la
  // base) renvoient aux photos plutôt que de produire une note fausse.
  const c = constituants
  const sum = (c.proteines ?? 0) + (c.matieresGrasses ?? 0) + (c.cellulose ?? 0) + (c.cendres ?? 0) + (c.humidite ?? 0)
  const plausible =
    c.proteines !== null &&
    c.matieresGrasses !== null &&
    sum <= 100 &&
    (label.typeAliment === 'humide' ? c.proteines >= 3 : c.proteines >= 12 && c.proteines <= 70 && c.matieresGrasses >= 3 && c.matieresGrasses <= 45)
  const usable = type === 'aliment-chien' && label.ingredients.length >= 3 && plausible && scoreLabel(label).score !== null
  return usable ? { kind: 'complete', label } : { kind: 'incomplete', brand, product, type }
}
