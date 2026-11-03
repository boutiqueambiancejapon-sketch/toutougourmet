import type { Ingredient } from './types'

// @cdc lot 6 — découpe d'une liste d'ingrédients écrite en texte libre (fiches Open Pet Food
// Facts, formulaire de relecture) vers le même format que la lecture des photos. Fonction pure,
// testée par scripts/test-scanner-score.ts. Les sous-listes entre parenthèses restent dans le nom.
// Le bloc « Additifs » et les constituants analytiques sont séparés de la composition avant le
// découpage, même collés au dernier ingrédient (« huile de lin. 3a671 vitamine D3 200 U.I. ») :
// ils n'entrent ni dans la liste des ingrédients ni dans les critères qui la lisent.

/** Début du bloc des additifs (vitamines, oligo-éléments, conservateurs…). */
const ADDITIVES_START =
  /^(additifs?|additives?|vitamines?\s+[a-e]\d?\b|oligo-?\s?elements?|oligo-?\s?éléments?|conservateurs?|antioxyg[eè]nes?|antioxydants?|liants?|stabilisateurs?|aromatisants?|technologiques?|nutritionnels?|sensoriels?|colorants?)/i

/** Découpe sur les virgules et points-virgules hors parenthèses ; les retours à la ligne séparent aussi. */
export function splitTopLevel(text: string): string[] {
  const parts: string[] = []
  let depth = 0
  let current = ''
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '(' || ch === '[') depth++
    if ((ch === ')' || ch === ']') && depth > 0) depth--
    // « 2,3 % » : virgule décimale entre deux chiffres, pas un séparateur
    const decimal = ch === ',' && /\d/.test(text[i - 1] ?? '') && /\d/.test(text[i + 1] ?? '')
    if ((depth === 0 && !decimal && (ch === ',' || ch === ';')) || ch === '\n' || ch === '\r') {
      parts.push(current)
      current = ''
      continue
    }
    current += ch
  }
  parts.push(current)
  return parts.map((p) => p.replace(/\s+/g, ' ').replace(/^[\s.:*_-]+|[\s.:*_–-]+$/g, '').trim()).filter((p) => p.length > 0)
}

const PERCENT = /(\d{1,3}(?:[.,]\d{1,2})?)\s?%/

/** Pourcentage écrit pour l'ingrédient (le premier, ex. « Poulet (26 % dont poulet frais 14 %) » : 26). */
function percentOf(item: string): number | null {
  if (/mg\s*\/\s*kg|ui\b|u\.i\./i.test(item)) return null
  const m = item.match(PERCENT)
  if (!m) return null
  const n = Number(m[1].replace(',', '.'))
  return Number.isFinite(n) && n > 0 && n <= 100 ? n : null
}

/** Nom propre : sans astérisque ni pourcentage isolé, parenthèses vides retirées. */
function cleanName(item: string): string {
  return item
    .replace(/\*/g, '')
    .replace(/\(\s*\d{1,3}(?:[.,]\d{1,2})?\s?%\s*\)/g, '')
    .replace(/\s\d{1,3}(?:[.,]\d{1,2})?\s?%(?=\s|$)/g, '')
    .replace(/\(\s*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160)
}

// Début du bloc additifs dans le texte entier : le mot « additifs » après une ponctuation (ou
// en capitales), un numéro d'additif de l'UE (3a671, 3b605, 1b306…) ou une vitamine dosée.
const ADDITIVES_BLOCK = [
  /(?:^|[.,;:)\n\r_–-]\s*)_?(?=(?:additifs?|additives?|additivi|zusatzstoffe|aditivos)(?![\p{L}]))/iu,
  // « … mélisse officinale Additifs nutritionnels : … » : majuscule en milieu de phrase
  /(?<=\s)(?=Additi(?:fs?|ves?)(?![\p{L}]))/u,
  /(?<![\p{L}])(?=ADDITIFS?(?![\p{L}]))/u,
  /(?<![\p{L}\d])(?=[1-4][a-n]\d{3,4}[a-z]?(?![\p{L}\d]))/iu,
  /(?<![\p{L}])(?=vitamin(?:e|a)?s?\s*[a-e]\d{0,2}\s*[:.-]?\s*\d[\d\s.,]*\s*(?:u\.?\s?i\.?|iu|mg|µg))/iu,
  // « … chlorure de potassium. Vitamine A, … » : vitamines en début de phrase
  /\.\s+(?=vitamin(?:e|es|s)?(?![\p{L}]))/iu,
]
// Fin du texte utile : conseils de conservation, mode d'emploi, renvoi au site de la marque
const TAIL_BLOCK = /[.\n]\s*(?:à |a )?(?:conserver|mode d'emploi|pour plus d'informations|ration journali[eè]re|best before|store in)/i
// Préambule avant la composition (« Aliment complémentaire pour chiens. Composition : … »)
// (en capitales, le mot suffit : « FR - Aliment complet … COMPOSITION : riz »)
const COMPOSITION_LABEL = /(?:(?:^|[.\n]\s*)(?:[Cc]omposition|[Ii]ngr[ée]dients?|INGR[ÉE]DIENTS?)|(?<![\p{L}])COMPOSITION)\s*:\s*/u
/**
 * Vitamines, oligo-éléments et acides aminés cités un par un dans une liste à l'américaine
 * (« niacine (vitamine B3) », « Zinc Sulfate ») : rangés avec les additifs, sans clore la liste.
 */
const NUTRITIONAL_ITEM =
  /^(suppl[ée]ment (de |en )?)?(vitamines?|vitamin|niacine?|biotine?|acide folique|folic acid|thiamine|mononitrate de thiamine|riboflavine?|pyridoxine|chlorhydrate de pyridoxine|pantoth[ée]nate|d-calcium pantothenate|chlorure de choline|choline chloride|taurine|dl-m[ée]thionine|l-carnitine|s[ée]l[ée]nite de sodium|sodium selenite|iod(at|ur)e de (calcium|potassium)|potassium iodide|oxyde de zinc|(sulfate|sulphate) de (zinc|cuivre|fer|mangan[eè]se)|(zinc|copper|ferrous|manganese) sulfate)\b|\(vitamine [a-k]\d{0,2}\)/i

// Constituants analytiques recopiés dans la composition : retirés (ni ingrédient ni additif)
const ANALYTICAL_BLOCK = /(?:constituants|composants|composition)\s+analytiques?|analytical\s+constituents|analytische\s+bestandteile/i

const firstIndex = (text: string, patterns: RegExp[], from = 0) =>
  patterns.reduce<number>((min, re) => {
    const m = re.exec(text.slice(from))
    return m ? Math.min(min, from + m.index + (m[0].length > 0 ? m[0].length : 0)) : min
  }, Infinity)

/**
 * Composition seule, bloc des additifs à part (vide si la liste n'en a pas). Des constituants
 * recopiés avant les additifs (« … phosphore : 0,9. Additifs par kg : … ») sont écartés des deux.
 */
export function splitAdditivesBlock(text: string): { composition: string; additives: string } {
  const a = firstIndex(text, ADDITIVES_BLOCK)
  const c = text.search(ANALYTICAL_BLOCK)
  const t = text.search(TAIL_BLOCK)
  const analytical = Math.min(c < 0 ? Infinity : c, t < 0 ? Infinity : t)
  const additives = a === Infinity ? '' : text.slice(a, analytical > a ? analytical : text.length)
  return { composition: text.slice(0, Math.min(a, analytical, text.length)), additives }
}

const isAdditivePiece = (a: string) => a.length > 1 && !/^[\d\s.,]+(u\.?i\.?|mg|g|ufc)?\.?$/i.test(a)

export interface ParsedIngredients {
  ingredients: Ingredient[]
  additifs: string[]
}

export function parseIngredientText(text: string): ParsedIngredients {
  const ingredients: Ingredient[] = []
  const additifs: string[] = []
  let inAdditives = false
  const nfc = text.normalize('NFC')
  const label = COMPOSITION_LABEL.exec(nfc)
  const body = label ? nfc.slice(label.index + label[0].length) : nfc.replace(/^\s*(composition|ingr[ée]dients?)\s*:?\s*/i, '')
  const { composition, additives } = splitAdditivesBlock(body)
  for (const raw of splitTopLevel(composition)) {
    if (!inAdditives && ADDITIVES_START.test(raw)) inAdditives = true
    if (inAdditives) {
      const a = raw.replace(/\s+/g, ' ').trim().slice(0, 160)
      // « Vitamine A : », « 24 000 U.I. » : morceaux d'un même additif coupés par la saisie
      if (isAdditivePiece(a)) additifs.push(a)
      continue
    }
    if (NUTRITIONAL_ITEM.test(raw)) {
      additifs.push(raw.replace(/\s+/g, ' ').trim().slice(0, 160))
      continue
    }
    const nom = cleanName(raw)
    if (nom.length < 2) continue
    ingredients.push({ nom, pourcentage: percentOf(raw) })
  }
  for (const raw of splitTopLevel(additives)) {
    const a = raw.replace(/\s+/g, ' ').trim().slice(0, 160)
    if (isAdditivePiece(a)) additifs.push(a)
  }
  return { ingredients: ingredients.slice(0, 80), additifs: additifs.slice(0, 60) }
}
