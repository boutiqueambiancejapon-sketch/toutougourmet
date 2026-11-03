// @cdc mesure — type de page de la carte des conversions (docs/v2/cro-carte.md). Une seule
// classification pour tout le site : encart du milieu (lib/mid-cta.ts), bandeau collant
// (lib/sticky-cta-config.ts), événements du navigateur (lib/analytics.ts) et tableau de bord
// (lib/server/dashboard-conversions.ts). Déduite du chemin seul, pour marcher partout
// (navigateur, serveur, anciens événements déjà en base).

export const PAGE_TYPES = [
  'aliments',
  'urgences',
  'sante',
  'nutrition-marques',
  'races',
  'recettes',
  'outils',
  'quiz',
  'scanner',
  'accueil',
  'compte',
  'autre',
] as const

export type PageType = (typeof PAGE_TYPES)[number]

export const PAGE_TYPE_LABELS: Record<PageType, string> = {
  aliments: 'Aliments « peut-il manger »',
  urgences: 'Urgences',
  sante: 'Santé, poids',
  'nutrition-marques': 'Nutrition, marques, avis',
  races: 'Races',
  recettes: 'Recettes',
  outils: 'Outils',
  quiz: 'Quiz',
  scanner: 'Scanner, fiches croquettes',
  accueil: 'Accueil',
  compte: 'Espace compte',
  autre: 'Autres pages',
}

/** Rubriques d'aliments : une page par aliment. */
const FOOD_CATEGORIES = new Set(['peut-manger', 'fruit', 'legumes', 'feculents', 'viandes'])
/** Rubriques de choix d'achat : nutrition au quotidien, marques, avis, comparatifs. */
const BUY_CATEGORIES = new Set(['alimentation-quotidienne', 'avis-marques', 'marque'])

/** Type d'un article à partir de sa rubrique et de son slug. */
function articleType(category: string, slug: string): PageType {
  if (category === 'urgences' || /-urgence$/.test(slug)) return 'urgences'
  if (category === 'race') return 'races'
  if (slug.startsWith('recette-')) return 'recettes'
  if (FOOD_CATEGORIES.has(category) || slug.startsWith('chien-peut-')) return 'aliments'
  if (category === 'sante') return 'sante'
  if (BUY_CATEGORIES.has(category)) return 'nutrition-marques'
  return 'autre'
}

/** Type de page d'un chemin (« /chien/race/nourriture-carlin », « /outils/ration »…). */
export function pageTypeOf(pathname: string): PageType {
  const path = pathname.split(/[?#]/)[0].replace(/^\/en(?=\/|$)/, '').replace(/\/+$/, '') || '/'
  if (path === '/') return 'accueil'
  const [first = '', second = '', third = ''] = path.slice(1).split('/')
  switch (first) {
    case 'compte':
    case 'premium':
      return 'compte'
    case 'quiz':
      return 'quiz'
    case 'scanner':
    case 'croquettes':
      return 'scanner'
    case 'outils':
      return 'outils'
    case 'comparateur':
      return 'nutrition-marques'
    case 'chien':
      if (!second) return 'autre'
      return articleType(second, third)
    case 'blog':
      return second ? articleType('', second) : 'autre'
    default:
      return 'autre'
  }
}

export function isPageType(value: unknown): value is PageType {
  return typeof value === 'string' && (PAGE_TYPES as readonly string[]).includes(value)
}
