import type { Ingredient } from './types'

// @cdc lot 6 — découpe d'une liste d'ingrédients écrite en texte libre (fiches Open Pet Food
// Facts, formulaire de relecture) vers le même format que la lecture des photos. Fonction pure,
// testée par scripts/test-scanner-score.ts. Les sous-listes entre parenthèses restent dans le nom.
// Le bloc « Additifs » et les constituants analytiques sont séparés de la composition avant le
// découpage, même collés au dernier ingrédient (« huile de lin. 3a671 vitamine D3 200 U.I. ») :
// ils n'entrent ni dans la liste des ingrédients ni dans les critères qui la lisent.

/** Début du bloc des additifs (vitamines, oligo-éléments, conservateurs…). */
const ADDITIVES_START =
  /^(additifs?|additives?|tilsetningsstoffer|vitamines?\s+[a-e]\d?\b|oligo-?\s?elements?|oligo-?\s?éléments?|conservateurs?|antioxyg[eè]nes?|antioxydants?|liants?|stabilisateurs?|aromatisants?|technologiques?|nutritionnels?|sensoriels?|colorants?)/i

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

// Nombre sans chiffre ni séparateur juste avant (« 0,0008 % » ne se lit pas « 8 % »), virgule
// ou point décimal, autant de décimales que la saisie en donne.
const NUMBER = String.raw`(?<![\d.,])\d+(?:[.,]\d+)?`
const PERCENT = new RegExp(String.raw`(${NUMBER})\s?%`)

/** Pourcentage écrit pour l'ingrédient (le premier, ex. « Poulet (26 % dont poulet frais 14 %) » : 26). */
export function percentOf(item: string): number | null {
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
    .replace(new RegExp(String.raw`\(\s*${NUMBER}\s?%\s*\)`, 'g'), '')
    .replace(new RegExp(String.raw`\s${NUMBER}\s?%(?=\s|$)`, 'g'), '')
    .replace(/\(\s*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160)
}

// Début du bloc additifs dans le texte entier : le mot « additifs » après une ponctuation (ou
// en capitales), un numéro d'additif de l'UE (3a671, 3b605, 1b306…) ou une vitamine dosée.
const ADDITIVES_BLOCK = [
  /(?:^|[.,;:)\n\r_–-]\s*)_?(?=(?:additifs?|additives?|additivi|zusatzstoffe|aditivos|tilsetningsstoffer|tilsætningsstoffer|tillsatsämnen)(?![\p{L}]))/iu,
  // « … mélisse officinale Additifs nutritionnels : … » : majuscule en milieu de phrase
  /(?<=\s)(?=Additi(?:fs?|ves?)(?![\p{L}]))/u,
  /(?<![\p{L}])(?=ADDITIFS?(?![\p{L}]))/u,
  // « … aloe vera (dried, 0.05%) Nutritional additives/kg » : catégorie d'additifs sans ponctuation
  /(?<=\s)(?=(?:nutritional|technological|sensory|zootechnical)\s+additives?(?![\p{L}]))/iu,
  /(?<=\s)(?=additifs?\s+(?:nutritionnels?|technologiques?|sensoriels?|zootechniques?)(?![\p{L}]))/iu,
  /(?<![\p{L}\d])(?=[1-4][a-n]\d{3,4}[a-z]?(?![\p{L}\d]))/iu,
  /(?<![\p{L}])(?=vitamin(?:e|a)?s?\s*[a-e]\d{0,2}\s*[:.-]?\s*\d[\d\s.,]*\s*(?:u\.?\s?i\.?|iu|ie|mg|µg))/iu,
  // « … (2,5 % huile de saumon). Fer (oxyde de fer (III)) E1 1.200 mg/kg » : phrase d'un additif dosé
  /\.\s+(?=[^.,;]{0,60}?(?<![\p{L}\d])E\s?\d{1,3}[a-z]?\s+\d[\d.,]*\s*(?:mg|µg|u\.?\s?i\.?|iu)(?![\p{L}]))/iu,
  // « … chlorure de potassium. Vitamine A, … » : vitamines en début de phrase
  /\.\s+(?=vitamin(?:e|es|s)?(?![\p{L}]))/iu,
]
// Fin du texte utile : conseils de conservation, mode d'emploi, renvoi au site de la marque
const TAIL_BLOCK = /[.\n]\s*(?:à |a )?(?:conserver|mode d'emploi|pour plus d'informations|ration journali[eè]re|best before|store in)/i
// Préambule avant la composition (« Aliment complémentaire pour chiens. Composition : … »)
// (en capitales, le mot suffit : « FR - Aliment complet … COMPOSITION : riz »)
const COMPOSITION_LABEL =
  /(?:(?:^|[.\n]\s*)(?:[Cc]omposition|[Ii]ngr[ée]dients?|INGR[ÉE]DIENTS?|[Ss]ammens[eæ]tning|SAMMENS[EÆ]TNING|[Ss]ammans[äa]ttning|SAMMANS[ÄA]TTNING)|(?<![\p{L}])COMPOSITION)\s*:\s*/u
/**
 * Vitamines, oligo-éléments et acides aminés cités un par un dans une liste à l'américaine
 * (« niacine (vitamine B3) », « Zinc Sulfate ») : rangés avec les additifs, sans clore la liste.
 */
const NUTRITIONAL_ITEM =
  /^(suppl[ée]ment (de |en )?)?(vitamines?|vitamins?|niacine?|biotine?|acide folique|folic acid|thiamine|mononitrate de thiamine|riboflavine?|pyridoxine|chlorhydrate de pyridoxine|pantoth[ée]nate|d-calcium pantothenate|chlorure de choline|choline chloride|taurine|dl-m[ée]thionine|l-carnitine|s[ée]l[ée]nite de sodium|sodium selenite|iod(at|ur)e de (calcium|potassium)|potassium iodide|calcium iodate|oxyde de (zinc|magn[ée]sium|mangan[eè]se)|(zinc|magnesium|manganous) oxide|sulfate ferreux|(sulfate|sulphate) de (zinc|cuivre|fer|mangan[eè]se)|(zinc|copper|ferrous|manganese) (sulfate|sulphate)|mixed tocopherols|tocoph[ée]rols m[ée]lang[ée]s|(avec (du )?)?tbhq)\b|^(trace )?minerals?\s*[(\[](?=[^)\]]*(sulfate|sulphate|oxide|selenite|iodate|proteinate|chelate))|\(vitamine [a-k]\d{0,2}\)/i

// Constituants analytiques recopiés dans la composition : retirés (ni ingrédient ni additif)
const ANALYTICAL_BLOCK = /(?:constituants|composants|composition)\s+analytiques?|analytical\s+constituents|analytische\s+bestandteile|analytiske\s+bestanddeler|analytiska\s+best[åa]ndsdelar/i

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

// Mot qui ouvre le bloc des additifs, collé à l'ingrédient précédent faute de virgule
// (« pomme (séchée) 0,05% antioxygènes », « sous-produits végétaux conservateurs »). Pluriels seuls :
// « extrait de romarin antioxydant » reste un ingrédient.
const GLUED_ADDITIVES = /^(.*?[\p{L}\d)%\]])\s+((?:antioxyg[eè]nes|antioxydants|conservateurs|colorants|additifs|antioxidants|preservatives|colou?rants)(?![\p{L}]).*)$/iu
const NEGATION_BEFORE = /(?:^|\s)(?:sans|without|avec|with|de|des|d'|et|and|ni|no|free)$/i
const balanced = (s: string) => (s.match(/[([]/g) ?? []).length === (s.match(/[)\]]/g) ?? []).length

/** Coupe un ingrédient suivi d'additifs sans ponctuation ; null si rien à couper. */
export function splitGluedAdditives(item: string): [string, string] | null {
  const m = GLUED_ADDITIVES.exec(item)
  if (!m || !balanced(m[1]) || NEGATION_BEFORE.test(m[1])) return null
  return [m[1], m[2]]
}

export function parseIngredientText(text: string): ParsedIngredients {
  const ingredients: Ingredient[] = []
  const additifs: string[] = []
  let inAdditives = false
  const nfc = text.normalize('NFC')
  const label = COMPOSITION_LABEL.exec(nfc)
  const body = label ? nfc.slice(label.index + label[0].length) : nfc.replace(/^\s*(composition|ingr[ée]dients?)\s*:?\s*/i, '')
  const { composition, additives } = splitAdditivesBlock(body)
  let gluedBefore = false
  for (const item of splitTopLevel(composition)) {
    // Les additifs collés à l'ingrédient précédent ouvrent le bloc : la suite en fait partie
    if (gluedBefore) inAdditives = true
    const glued = inAdditives ? null : splitGluedAdditives(item)
    const raw = glued ? glued[0] : item
    if (glued) {
      gluedBefore = true
      const a = glued[1].replace(/\s+/g, ' ').trim().slice(0, 160)
      if (isAdditivePiece(a)) additifs.push(a)
    }
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
