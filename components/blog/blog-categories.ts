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
 * Chaque race a maintenant son image unique (.webp pour les 6 historiques,
 * .jpg pour le batch Gemini de 36 races). La fallback `breed-generic`
 * reste disponible pour toute future race non encore mappée.
 */
const BREED_SLOT_BY_SLUG: Record<string, string> = {
  // Batch 1 — webp historique
  'labrador-retriever': 'breed-labrador',
  'golden-retriever': 'breed-golden',
  'bouledogue-francais': 'breed-bouledogue',
  'berger-australien': 'breed-berger-australien',
  chihuahua: 'breed-chihuahua',
  'cavalier-king-charles': 'breed-cavalier',
  // Batch 2 — jpg Gemini (36 races)
  'akita-inu': 'breed-akita-inu',
  'basset-hound': 'breed-basset-hound',
  beagle: 'breed-beagle',
  'berger-allemand': 'breed-berger-allemand',
  'berger-belge-malinois': 'breed-berger-belge-malinois',
  'berger-de-beauce': 'breed-berger-de-beauce',
  'berger-des-shetland': 'breed-berger-des-shetland',
  'bichon-frise': 'breed-bichon-frise',
  'border-collie': 'breed-border-collie',
  'bouledogue-anglais': 'breed-bouledogue-anglais',
  'bouvier-bernois': 'breed-bouvier-bernois',
  boxer: 'breed-boxer',
  'cane-corso': 'breed-cane-corso',
  caniche: 'breed-caniche',
  carlin: 'breed-carlin',
  'chow-chow': 'breed-chow-chow',
  'cocker-spaniel': 'breed-cocker-spaniel',
  dachshund: 'breed-dachshund',
  dalmatien: 'breed-dalmatien',
  doberman: 'breed-doberman',
  'epagneul-breton': 'breed-epagneul-breton',
  'husky-siberien': 'breed-husky-siberien',
  'jack-russell-terrier': 'breed-jack-russell-terrier',
  rottweiler: 'breed-rottweiler',
  'saint-bernard': 'breed-saint-bernard',
  samoyed: 'breed-samoyed',
  'schnauzer-nain': 'breed-schnauzer-nain',
  'shiba-inu': 'breed-shiba-inu',
  'shih-tzu': 'breed-shih-tzu',
  'spitz-nain': 'breed-spitz-nain',
  'staffordshire-bull-terrier': 'breed-staffordshire-bull-terrier',
  teckel: 'breed-teckel',
  'terre-neuve': 'breed-terre-neuve',
  'welsh-corgi-pembroke': 'breed-welsh-corgi-pembroke',
  westie: 'breed-westie',
  'yorkshire-terrier': 'breed-yorkshire-terrier',
}

/**
 * Articles génériques (non-race) avec featured image dédiée.
 * Alimenté par la tâche planifiée `toutougourmet-daily-article` qui génère
 * une image unique par article via Nano Banana et ajoute le slot correspondant
 * à `data/images-manifest.ts`. Le slot suit la convention `art-{slug}` (.jpeg).
 *
 * La présence d'une entrée ici remplace la cover de catégorie par défaut
 * (cf. `getArticleSlot`) — c'est le mécanisme « featured image » par article.
 */
const ARTICLE_SLOT_BY_SLUG: Record<string, string> = {
  'recette-bouillon-os-maison-chien': 'art-recette-bouillon-os-maison-chien',
}

/**
 * Résout le slot Illustration à utiliser pour un article donné.
 * Ordre de priorité :
 *  1. Article générique avec featured dédiée (ARTICLE_SLOT_BY_SLUG)
 *  2. Article de race (`nourriture-{breed}`) → slot breed dédié ou `breed-generic`
 *  3. Autres articles → slot dérivé de `frontmatter.category` (cf. CATEGORY_TABLE)
 */
export function getArticleSlot(slug: string, category: string): string {
  if (ARTICLE_SLOT_BY_SLUG[slug]) {
    return ARTICLE_SLOT_BY_SLUG[slug]
  }
  if (slug.startsWith('nourriture-')) {
    const breed = slug.slice('nourriture-'.length)
    return BREED_SLOT_BY_SLUG[breed] ?? 'breed-generic'
  }
  return getCategoryVisual(category).slot
}
