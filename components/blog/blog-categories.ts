/**
 * Mapping catégorie (libellé frontmatter) → présentation blog hub.
 * Utilisé pour les chips, les covers Illustration et les cards.
 *
 * Source de vérité unique pour les couleurs par catégorie. Les composants
 * dérivent leur palette depuis `pillVar`/`bgVar`/`textOnVar` — ne pas
 * hardcoder de couleurs dans les cards.
 */

export interface CategoryVisual {
  /** Slot Illustration à utiliser pour cette catégorie (featured card) */
  slot: string
  /** Pill colorée (pastel saturé) — ex: chips de filtres, accent */
  pillVar: string
  /** Fond pâle de la card en mode Option C */
  bgVar: string
  /** Couleur texte foncée lisible sur fond pillVar / bgVar */
  textOnVar: string
  /** Emoji catégorie (utilisé en watermark sur les cards) */
  emoji: string
}

const DEFAULT_VISUAL: CategoryVisual = {
  slot: 'cat-nutrition',
  pillVar: 'var(--pill-amber)',
  bgVar: 'var(--bg-amber)',
  textOnVar: 'var(--text-on-amber)',
  emoji: '📚',
}

const CATEGORY_TABLE: Record<string, CategoryVisual> = {
  Alimentation: {
    slot: 'cat-alimentation',
    pillVar: 'var(--pill-rose)',
    bgVar: 'var(--bg-rose)',
    textOnVar: 'var(--text-on-rose)',
    emoji: '🥩',
  },
  Santé: {
    slot: 'cat-sante',
    pillVar: 'var(--pill-green)',
    bgVar: 'var(--bg-green)',
    textOnVar: 'var(--text-on-green)',
    emoji: '💊',
  },
  'Avis & Comparatif': {
    slot: 'cat-avis-marques',
    pillVar: 'var(--pill-blue)',
    bgVar: 'var(--bg-blue)',
    textOnVar: 'var(--text-on-blue)',
    emoji: '🔍',
  },
  Race: {
    slot: 'cat-par-race',
    pillVar: 'var(--pill-amber)',
    bgVar: 'var(--bg-amber)',
    textOnVar: 'var(--text-on-amber)',
    emoji: '🐕',
  },
  'Urgences & Intoxications': {
    slot: 'cat-urgences',
    pillVar: 'var(--pill-rose)',
    bgVar: 'var(--bg-rose)',
    textOnVar: 'var(--text-on-rose)',
    emoji: '⚠️',
  },
  Comportement: {
    slot: 'cat-comportement',
    pillVar: 'var(--pill-blue)',
    bgVar: 'var(--bg-blue)',
    textOnVar: 'var(--text-on-blue)',
    emoji: '🐾',
  },
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
