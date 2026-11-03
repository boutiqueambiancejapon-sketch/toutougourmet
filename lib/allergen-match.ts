// @cdc profil chien — allergies du profil face à la composition d'un produit (scanner, fiche
// /croquettes). Correspondance prudente, mot entier, accents et casse ignorés, sur chaque
// ingrédient de la liste. Les allergies courantes ont leurs synonymes (français, anglais des
// fiches Open Pet Food Facts) ; une allergie inconnue de la table est cherchée telle quelle.
// « Possible » : l'ingrédient peut contenir l'allergène sans le nommer (« volaille » peut être du
// poulet, « gluten » sans céréale précisée peut venir du blé). Une protéine « animale » sans
// espèce ne déclenche rien : la liste ne permet pas de conclure.

interface AllergenGroup {
  /** Termes que le propriétaire tape pour cette allergie */
  names: string[]
  /** Ingrédients qui la contiennent */
  sure: string[]
  /** Ingrédients qui peuvent la contenir */
  maybe?: string[]
  /** Un ingrédient qui contient aussi l'un de ces mots n'est pas « possible » (gluten de maïs) */
  maybeUnless?: string[]
  /** « du bœuf », « de l'œuf », « des produits laitiers » */
  partitive: string
}

const GROUPS: AllergenGroup[] = [
  { names: ['boeuf', 'beef', 'bovin', 'viande bovine'], sure: ['boeuf', 'beef', 'bovin', 'bovine', 'veau', 'veal'], partitive: 'du bœuf' },
  { names: ['poulet', 'chicken', 'poule'], sure: ['poulet', 'chicken', 'poule', 'poules'], maybe: ['volaille', 'volailles', 'poultry'], partitive: 'du poulet' },
  { names: ['dinde', 'turkey'], sure: ['dinde', 'turkey'], maybe: ['volaille', 'volailles', 'poultry'], partitive: 'de la dinde' },
  { names: ['canard', 'duck'], sure: ['canard', 'duck'], maybe: ['volaille', 'volailles', 'poultry'], partitive: 'du canard' },
  { names: ['ble', 'wheat', 'froment', 'gluten'], sure: ['ble', 'wheat', 'froment', 'epeautre', 'spelt'], maybe: ['gluten'], maybeUnless: ['mais', 'corn', 'riz', 'rice'], partitive: 'du blé' },
  {
    names: ['lait', 'lactose', 'produits laitiers', 'produit laitier', 'laitier', 'laitiers', 'dairy', 'milk'],
    sure: ['lait', 'lactose', 'lactoserum', 'petit lait', 'fromage', 'yaourt', 'yogourt', 'caseine', 'babeurre', 'produits laitiers', 'milk', 'whey', 'cheese', 'dairy', 'yogurt'],
    partitive: 'des produits laitiers',
  },
  { names: ['oeuf', 'oeufs', 'egg', 'eggs'], sure: ['oeuf', 'oeufs', 'egg', 'eggs', 'ovoproduits'], partitive: 'de l’œuf' },
  { names: ['soja', 'soy', 'soya'], sure: ['soja', 'soy', 'soya'], partitive: 'du soja' },
  { names: ['agneau', 'lamb', 'mouton'], sure: ['agneau', 'agneaux', 'lamb', 'mouton', 'ovin', 'mutton'], partitive: 'de l’agneau' },
  {
    names: ['poisson', 'poissons', 'fish'],
    sure: ['poisson', 'poissons', 'fish', 'saumon', 'salmon', 'thon', 'tuna', 'truite', 'trout', 'hareng', 'herring', 'sardine', 'sardines', 'cabillaud', 'colin', 'merlan', 'anchois', 'maquereau', 'whitefish', 'morue', 'lieu noir', 'hoki'],
    partitive: 'du poisson',
  },
  { names: ['mais', 'corn', 'maize'], sure: ['mais', 'corn', 'maize'], partitive: 'du maïs' },
  { names: ['porc', 'pork', 'cochon'], sure: ['porc', 'pork', 'cochon', 'porcine'], partitive: 'du porc' },
]

/** Minuscules, sans accents, ligatures dépliées, ponctuation remplacée par des espaces. */
export function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/** Mot ou expression entière dans un texte normalisé (pluriel en s ou x accepté). */
function hasWord(text: string, term: string): boolean {
  const padded = ` ${text} `
  return [term, `${term}s`, `${term}x`].some((t) => padded.includes(` ${t} `))
}

export interface AllergenHit {
  /** L'allergie telle que tapée dans le profil */
  allergy: string
  /** « du bœuf » ; l'allergie tapée quand elle n'est pas dans la table */
  partitive: string
  /** Ingrédient de la composition qui a déclenché l'alerte, tel qu'écrit */
  ingredient: string
  /** true : l'ingrédient peut en contenir sans le nommer */
  possible: boolean
}

function groupOf(allergy: string): AllergenGroup | null {
  const a = normalizeText(allergy)
  return GROUPS.find((g) => g.names.some((n) => a === n || hasWord(a, n))) ?? null
}

/** Allergies du profil retrouvées dans la liste d'ingrédients (une alerte par allergie au plus). */
export function findAllergens(allergies: string[], ingredients: string[]): AllergenHit[] {
  const list = ingredients.map((raw) => ({ raw, text: normalizeText(raw) })).filter((i) => i.text !== '')
  const hits: AllergenHit[] = []
  for (const allergy of allergies) {
    const g = groupOf(allergy)
    const own = normalizeText(allergy)
    if (!g && own.length < 3) continue
    const sure = g ? g.sure : [own]
    const found = list.find((i) => sure.some((t) => hasWord(i.text, t)))
    if (found) {
      hits.push({ allergy, partitive: g ? g.partitive : `« ${allergy} »`, ingredient: found.raw, possible: false })
      continue
    }
    const maybe = g?.maybe ?? []
    const unless = g?.maybeUnless ?? []
    const likely = list.find((i) => maybe.some((t) => hasWord(i.text, t)) && !unless.some((t) => hasWord(i.text, t)))
    if (g && likely) hits.push({ allergy, partitive: g.partitive, ingredient: likely.raw, possible: true })
  }
  return hits
}
