/**
 * Mapping catégorie (libellé frontmatter) → présentation blog hub.
 * Utilisé pour les chips, les covers Illustration et les pills sur les cartes.
 */

export interface CategoryVisual {
  /** Slot Illustration à utiliser pour cette catégorie */
  slot: string
  /** Variable CSS de la pill color */
  pillVar: string
  /** Emoji badge */
  emoji: string
}

const DEFAULT_VISUAL: CategoryVisual = {
  slot: 'cat-nutrition',
  pillVar: 'var(--pill-amber)',
  emoji: '📚',
}

const CATEGORY_TABLE: Record<string, CategoryVisual> = {
  Alimentation: { slot: 'cat-alimentation', pillVar: 'var(--pill-rose)', emoji: '🥩' },
  Santé: { slot: 'cat-sante', pillVar: 'var(--pill-green)', emoji: '💊' },
  'Santé & nutrition': { slot: 'cat-sante', pillVar: 'var(--pill-green)', emoji: '💊' },
  'Avis & Comparatif': { slot: 'cat-avis-marques', pillVar: 'var(--pill-blue)', emoji: '🔍' },
  Race: { slot: 'cat-par-race', pillVar: 'var(--pill-amber)', emoji: '🐕' },
  'Urgences & Intoxications': { slot: 'cat-urgences', pillVar: 'var(--pill-rose)', emoji: '⚠️' },
  Comportement: { slot: 'cat-comportement', pillVar: 'var(--pill-blue)', emoji: '🐾' },
  Guide: { slot: 'cat-nutrition', pillVar: 'var(--pill-amber)', emoji: '📘' },
  Nutrition: { slot: 'cat-nutrition', pillVar: 'var(--pill-amber)', emoji: '🍖' },
  Enquêtes: { slot: 'cat-enquetes', pillVar: 'var(--pill-amber)', emoji: '🔎' },
}

export function getCategoryVisual(label: string): CategoryVisual {
  return CATEGORY_TABLE[label] ?? DEFAULT_VISUAL
}

/**
 * Ordre préféré des chips dans la barre de filtres (les catégories absentes
 * du tableau d'articles ne seront pas affichées).
 */
export const CATEGORY_ORDER: string[] = [
  'Alimentation',
  'Santé',
  'Avis & Comparatif',
  'Race',
  'Urgences & Intoxications',
  'Comportement',
  'Guide',
]

/**
 * Articles de race (slugs `nourriture-{breed}`) → slot de cover dédié.
 * Les 6 races phares de la home ont leur image unique ; les 26 autres
 * tombent sur `breed-generic`.
 */
const BREED_SLOT_BY_SLUG: Record<string, string> = {
  'labrador-retriever': 'breed-labrador',
  'golden-retriever': 'breed-golden',
  'bouledogue-francais': 'breed-bouledogue',
  'berger-australien': 'breed-berger-australien',
  chihuahua: 'breed-chihuahua',
  'cavalier-king-charles': 'breed-cavalier',
}

/**
 * Résout le slot Illustration à utiliser pour un article donné.
 * - Articles de race (`nourriture-{breed}`) → slot breed dédié ou `breed-generic`
 * - Autres articles → slot dérivé de `frontmatter.category` (cf. CATEGORY_TABLE)
 */
export function getArticleSlot(slug: string, category: string): string {
  if (slug.startsWith('nourriture-')) {
    const breed = slug.slice('nourriture-'.length)
    return BREED_SLOT_BY_SLUG[breed] ?? 'breed-generic'
  }
  return getCategoryVisual(category).slot
}
