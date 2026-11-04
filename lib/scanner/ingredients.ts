// @cdc lot 6 — reconnaissance des ingrédients pour la note (lib/scanner/score.ts). Listes
// en français normalisé (minuscules, sans accents). Justifications : docs/v2/scanner-score.md.

// @cdc lot 6 — étiquettes étrangères : l'ingrédient reste affiché tel quel, mais la note le lit en
// français. Sans cette table, « carne di agnello » n'était pas une viande et « conservanti » n'était
// pas un conservateur (premier scan réel, 2026-11-04). Italien, espagnol, allemand, néerlandais, anglais.
const FOREIGN_TERMS: Record<string, string> = {
  carne: 'viande', fleisch: 'viande', vlees: 'viande', pollame: 'volaille', aves: 'volaille', ave: 'volaille',
  gefluegel: 'volaille', geflugel: 'volaille', gevogelte: 'volaille', pesce: 'poisson', pescado: 'poisson', fisch: 'poisson', vis: 'poisson',
  sottoprodotti: 'sous-produits', subproductos: 'sous-produits', nebenerzeugnisse: 'sous-produits', bijproducten: 'sous-produits',
  agnello: 'agneau', cordero: 'agneau', lamm: 'agneau', lam: 'agneau', lammfleisch: 'agneau', lamsvlees: 'agneau',
  pollo: 'poulet', huhn: 'poulet', hahnchen: 'poulet', huhner: 'poulet', huhnerfleisch: 'poulet', hahnchenfleisch: 'poulet', kip: 'poulet', kippenvlees: 'poulet',
  tacchino: 'dinde', pavo: 'dinde', pute: 'dinde', truthahn: 'dinde', putenfleisch: 'dinde', kalkoen: 'dinde',
  anatra: 'canard', pato: 'canard', ente: 'canard', entenfleisch: 'canard', eend: 'canard',
  manzo: 'boeuf', bovino: 'boeuf', ternera: 'boeuf', vacuno: 'boeuf', rind: 'boeuf', schweine: 'porc', puten: 'dinde', enten: 'canard', forellen: 'truite', rindfleisch: 'boeuf', rund: 'boeuf', rundvlees: 'boeuf',
  maiale: 'porc', suino: 'porc', cerdo: 'porc', schwein: 'porc', schweinefleisch: 'porc', varken: 'porc', varkensvlees: 'porc', pork: 'porc',
  vitello: 'veau', veal: 'veau', kalb: 'veau', coniglio: 'lapin', conejo: 'lapin', kaninchen: 'lapin', konijn: 'lapin', rabbit: 'lapin',
  cavallo: 'cheval', caballo: 'cheval', pferd: 'cheval', paard: 'cheval', horse: 'cheval', cervo: 'cerf', ciervo: 'cerf', hirsch: 'cerf', hert: 'cerf', venison: 'cerf',
  cinghiale: 'sanglier', jabali: 'sanglier', wildschwein: 'sanglier',
  salmone: 'saumon', lachs: 'saumon', zalm: 'saumon', trota: 'truite', trucha: 'truite', forelle: 'truite', forel: 'truite', trout: 'truite',
  tonno: 'thon', atun: 'thon', thunfisch: 'thon', tonijn: 'thon', tuna: 'thon', merluzzo: 'cabillaud', bacalao: 'cabillaud', kabeljauw: 'cabillaud', cod: 'cabillaud',
  aringa: 'hareng', arenque: 'hareng', hering: 'hareng', haring: 'hareng', uovo: 'oeuf', uova: 'oeufs', huevo: 'oeuf', huevos: 'oeufs', eier: 'oeufs',
  glicerolo: 'glycerine', glicerina: 'glycerine', glicerol: 'glycerine', glyzerin: 'glycerine', glycerin: 'glycerine', glycerol: 'glycerine',
  conservanti: 'conservateurs', conservante: 'conservateurs', conservantes: 'conservateurs', konservierungsstoffe: 'conservateurs', conserveermiddelen: 'conservateurs', preservatives: 'conservateurs',
  antiossidanti: 'antioxygenes', antioxidantes: 'antioxygenes', antioxidantien: 'antioxygenes', antioxidanten: 'antioxygenes', antioxidants: 'antioxygenes',
  coloranti: 'colorants', colorantes: 'colorants', farbstoffe: 'colorants', kleurstoffen: 'colorants', aromi: 'aromes', aromas: 'aromes', aromastoffe: 'aromes',
  zucchero: 'sucre', zuccheri: 'sucres', azucar: 'sucre', azucares: 'sucres', zucker: 'sucre', suiker: 'sucre', melassa: 'melasse', melaza: 'melasse', melasse: 'melasse', miele: 'miel', honig: 'miel', honing: 'miel',
  sale: 'sel', sal: 'sel', salz: 'sel', zout: 'sel',
  farina: 'farine', harina: 'farine', mehl: 'farine', meel: 'farine', frumento: 'ble', grano: 'ble', trigo: 'ble', weizen: 'ble', tarwe: 'ble',
  riso: 'riz', arroz: 'riz', reis: 'riz', rijst: 'riz', orzo: 'orge', cebada: 'orge', gerste: 'orge', gerst: 'orge', avena: 'avoine', hafer: 'avoine', haver: 'avoine', granoturco: 'mais', maiz: 'mais', cereali: 'cereales',
  cioccolato: 'chocolat', schokolade: 'chocolat', chocolate: 'chocolat', cipolla: 'oignon', cipolle: 'oignons', cebolla: 'oignon', zwiebel: 'oignon', onion: 'oignon',
  aglio: 'ail', ajo: 'ail', knoblauch: 'ail', knoflook: 'ail', garlic: 'ail', uva: 'raisin', uvas: 'raisin', trauben: 'raisin', druiven: 'raisin', grapes: 'raisin',
}

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/[’']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    // Mots composés allemands : « Geflügelprotein », « Lachsmehl », « Rinderfett ».
    .replace(/\b(gefluegel|geflugel|lachs|forellen|thunfisch|fisch|rinder?|lamm|huhner|hahnchen|schweine?|puten|enten)(?=[a-z]{3,})/g, (w) => `${w === 'rinder' ? 'rind' : w} `)
    .replace(/[a-z]+/g, (w) => (Object.hasOwn(FOREIGN_TERMS, w) ? FOREIGN_TERMS[w] : w))
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
const BY_PRODUCTS = words([
  'sous-produits?', 'sous produits?', 'derives? d origine animale', 'derives? d origine vegetale', 'by-products?',
  'derivatives? of animal origin', '(animal|meat|fish) derivatives?',
])

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

/**
 * Nom principal d'un ingrédient (texte normalisé) : sans parenthèses ni crochets, et sans la
 * précision « dont… » (« viandes et sous-produits animaux (dont 4 % de poulet) » : « viandes et
 * sous-produits animaux »). Une espèce citée seulement dans la précision ne nomme pas l'ingrédient.
 */
export function mainName(name: string): string {
  let n = normalize(name)
  for (let i = 0; i < 3; i++) n = n.replace(/\([^()]*\)|\[[^[\]]*\]/g, ' ')
  return n
    .replace(/[([].*$/, ' ') // parenthèse non refermée (texte tronqué)
    .replace(/(^|[^a-z])(dont|including|incl|of which|containing|contenant)([^a-z].*|$)/, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Texte sur lequel juger l'origine animale. Le nom principal s'il cite une espèce ou une catégorie
 * de sous-produits : « viandes et sous-produits animaux (dont poulet) » reste sans espèce. Sinon
 * (« Viandes et abats crus (agneau 56 %, jambon 10 %) », « Morceaux (poulet 80 %) »), le nom entier
 * sans la précision « dont… » : une parenthèse qui détaille l'ingrédient nomme son espèce, un
 * « dont 4 % de poulet » n'en nomme qu'une partie.
 */
function animalText(name: string): string {
  const head = mainName(name)
  if (BY_PRODUCTS.test(head) || NAMED_ANIMAL.test(head)) return head
  return normalize(name).replace(/(^|[^a-z])(dont|including|incl|of which|containing|contenant)([^a-z][^()[\]]*|$)/g, ' ')
}

/** Source animale d'un ingrédient, hors graisses et huiles (qui n'apportent pas de protéines). */
export function animalKind(name: string): AnimalKind {
  const n = animalText(name)
  const head = mainName(name) || n
  if (FATS.test(head) && !/proteines?/.test(head)) return null
  if (/vegetale?s?([^a-z]|$)/.test(head)) return null
  if (BY_PRODUCTS.test(n) && !NAMED_ANIMAL.test(n)) return 'non-nommee'
  if (NAMED_ANIMAL.test(n)) return 'nommee'
  if (UNNAMED_ANIMAL.test(n) && !/vegetale/.test(n)) return 'non-nommee'
  return null
}

/** Espèce citée seulement dans la précision d'un ingrédient générique (« viandes et sous-produits animaux (dont poulet) »). */
export const speciesInDetailOnly = (name: string) => animalKind(name) === 'non-nommee' && NAMED_ANIMAL.test(normalize(name))

/** Ingrédient d'origine animale dont l'espèce n'est pas dite (« graisses animales », « protéines de volaille »). */
const GENERIC_ANIMAL = words(['animal', 'animale', 'animales', 'animaux', 'volailles?', 'viandes?', 'poissons?', 'meat', 'poultry', 'fish'])
export const isUnnamedAnimal = (name: string) => {
  const n = animalText(name)
  return GENERIC_ANIMAL.test(n) && !NAMED_ANIMAL.test(n) && !/vegetale/.test(n) && !isByProduct(name)
}

/** Antioxygènes ou conservateurs mentionnés sans être nommés (l'étiquette peut les regrouper). */
const NAMED_ANTIOX = /(tocopherol|e ?30[67]|romarin|acide citrique|e ?330|acide ascorbique|e ?300|palmitate d ascorbyle|e ?304|lecithine)/
export function unnamedAntioxidants(texts: string[]): boolean {
  const all = texts.map(normalize)
  const generic = all.some((t) => /^(conservateurs?|antioxygenes?|antioxydants?)( |$|:)/.test(t) && !NAMED_ANTIOX.test(t))
  return generic
}

export const isByProduct = (name: string) => {
  const n = animalText(name)
  // « sous-produits d'origine végétale » n'est pas une origine animale non nommée.
  return BY_PRODUCTS.test(n) && !NAMED_ANIMAL.test(n) && !/vegetale?s?([^a-z]|$)/.test(mainName(name))
}
export const isCereal = (name: string) => CEREALS.test(normalize(name)) && animalKind(name) === null
export const hasSugar = (name: string) => SUGARS.test(normalize(name))
export const hasColorant = (name: string) => COLORANTS.test(normalize(name))

export function controversialPreservatives(texts: string[]): string[] {
  const all = texts.map(normalize)
  return CONTROVERSIAL_PRESERVATIVES.filter((p) => all.some((t) => p.re.test(t))).map((p) => p.name)
}
