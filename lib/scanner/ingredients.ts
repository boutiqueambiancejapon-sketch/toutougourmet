// @cdc lot 6 — reconnaissance des ingrédients pour la note (lib/scanner/score.ts). Listes
// en français normalisé (minuscules, sans accents). Justifications : docs/v2/scanner-score.md.

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/[’']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const words = (list: string[]) => new RegExp(`(^|[^a-z])(${list.join('|')})([^a-z]|$)`)

/** Espèces animales nommées (viandes, poissons, œuf, insectes identifiés). */
const NAMED_ANIMAL = words([
  'poulets?', 'dindes?', 'canards?', 'oies?', 'cailles?', 'pintades?', 'agneaux?', 'moutons?', 'boeufs?', 'veaux?', 'porcs?',
  'chevaux', 'cheval', 'lapins?', 'cerfs?', 'chevreuils?', 'sangliers?', 'bisons?', 'kangourous?', 'chevres?', 'gibier de [a-z]+',
  'saumons?', 'truites?', 'harengs?', 'maquereaux?', 'sardines?', 'anchois', 'thons?', 'cabillauds?', 'morues?', 'merlans?',
  'colins?', 'lieus?', 'merlus?', 'sprats?', 'capelans?', 'krill', 'oeufs?', 'larves? de [a-z ]+', 'insectes? [a-z]+',
  'chicken', 'turkey', 'duck', 'lamb', 'beef', 'salmon', 'herring', 'eggs?',
])

/** Origine animale sans espèce nommée. */
const UNNAMED_ANIMAL = words(['viandes?', 'volailles?', 'poissons?', 'proteines? animales?', 'gibier', 'animal', 'animale', 'animaux', 'meat', 'poultry', 'fish'])

/** Catégories opaques de la directive 82/475/CEE. */
const BY_PRODUCTS = words(['sous-produits?', 'sous produits?', 'derives? d origine animale', 'derives? d origine vegetale', 'by-products?'])

const FATS = words(['graisses?', 'huiles?', 'gras', 'suif', 'saindoux', 'bouillon', 'hydrolysat', 'hydrolysats', 'digest', 'arome', 'aromes'])

const CEREALS = words([
  'ble', 'mais', 'riz', 'orge', 'avoine', 'seigle', 'epeautre', 'millet', 'sorgho', 'triticale', 'cereales?', 'gluten', 'semoule',
  'wheat', 'corn', 'maize', 'rice', 'barley', 'oats?',
])

const SUGARS = words([
  'sucres?', 'saccharose', 'glucose', 'fructose', 'dextrose', 'sirops?', 'caramel', 'melasses?', 'miel', 'sugar', 'molasses',
])

const CONTROVERSIAL_PRESERVATIVES: { name: string; re: RegExp }[] = [
  { name: 'BHA (E320)', re: /(^|[^a-z0-9])(bha|e ?320|butylhydroxyanisole)([^a-z0-9]|$)/ },
  { name: 'BHT (E321)', re: /(^|[^a-z0-9])(bht|e ?321|butylhydroxytoluene)([^a-z0-9]|$)/ },
  { name: 'éthoxyquine (E324)', re: /(^|[^a-z0-9])(ethoxyquine?|e ?324)([^a-z0-9]|$)/ },
]

const COLORANTS = /(^|[^a-z0-9])(colorants?|e ?1[0-8][0-9][a-z]?|oxydes? de fer|dioxyde de titane|caramel colore|tartrazine|erythrosine)([^a-z0-9]|$)/

export type AnimalKind = 'nommee' | 'non-nommee' | null

/** Source animale d'un ingrédient, hors graisses et huiles (qui n'apportent pas de protéines). */
export function animalKind(name: string): AnimalKind {
  const n = normalize(name)
  if (FATS.test(n) && !/proteines?/.test(n)) return null
  if (/vegetale?s?([^a-z]|$)/.test(n)) return null
  if (BY_PRODUCTS.test(n) && !NAMED_ANIMAL.test(n)) return 'non-nommee'
  if (NAMED_ANIMAL.test(n)) return 'nommee'
  if (UNNAMED_ANIMAL.test(n) && !/vegetale/.test(n)) return 'non-nommee'
  return null
}

/** Ingrédient d'origine animale dont l'espèce n'est pas dite (« graisses animales », « protéines de volaille »). */
const GENERIC_ANIMAL = words(['animal', 'animale', 'animales', 'animaux', 'volailles?', 'viandes?', 'poissons?', 'meat', 'poultry', 'fish'])
export const isUnnamedAnimal = (name: string) => {
  const n = normalize(name)
  return GENERIC_ANIMAL.test(n) && !NAMED_ANIMAL.test(n) && !/vegetale/.test(n) && !isByProduct(name)
}

/** Antioxygènes ou conservateurs mentionnés sans être nommés (l'étiquette peut les regrouper). */
const NAMED_ANTIOX = /(tocopherol|e ?30[67]|romarin|acide citrique|e ?330|acide ascorbique|e ?300|palmitate d ascorbyle|e ?304|lecithine)/
export function unnamedAntioxidants(texts: string[]): boolean {
  const all = texts.map(normalize)
  const generic = all.some((t) => /^(conservateurs?|antioxygenes?|antioxydants?)( |$|:)/.test(t) && !NAMED_ANTIOX.test(t))
  return generic
}

export const isByProduct = (name: string) => BY_PRODUCTS.test(normalize(name)) && !NAMED_ANIMAL.test(normalize(name))
export const isCereal = (name: string) => CEREALS.test(normalize(name)) && animalKind(name) === null
export const hasSugar = (name: string) => SUGARS.test(normalize(name))
export const hasColorant = (name: string) => COLORANTS.test(normalize(name))

export function controversialPreservatives(texts: string[]): string[] {
  const all = texts.map(normalize)
  return CONTROVERSIAL_PRESERVATIVES.filter((p) => all.some((t) => p.re.test(t))).map((p) => p.name)
}
