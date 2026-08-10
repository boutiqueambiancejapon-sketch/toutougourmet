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
 * à `data/images-manifest.ts` (ou `data/extra-image-slots.ts` quand le manifest
 * principal est trop volumineux pour être réécrit via l'API). Le slot suit la
 * convention `art-{slug}` (.jpeg).
 *
 * La présence d'une entrée ici remplace la cover de catégorie par défaut
 * (cf. `getArticleSlot`) — c'est le mécanisme « featured image » par article.
 * Elle écrase aussi la cover breed historique pour les articles de race.
 */
const ARTICLE_SLOT_BY_SLUG: Record<string, string> = {
  'nourriture-berger-blanc-suisse': 'art-nourriture-berger-blanc-suisse',
  'nourriture-dogue-de-bordeaux': 'art-nourriture-dogue-de-bordeaux',
  'choisir-taille-croquettes-chien': 'art-choisir-taille-croquettes-chien',
  'chien-peut-manger-thon': 'art-chien-peut-manger-thon',
  'quelle-quantite-patee-chien-par-jour': 'art-quelle-quantite-patee-chien-par-jour',
  'recette-bouillon-os-maison-chien': 'art-recette-bouillon-os-maison-chien',
  'chien-peut-manger-beurre-de-cacahuete': 'art-chien-peut-manger-beurre-de-cacahuete',
  'tapis-de-lechage-chien-guide-utilisation': 'art-tapis-de-lechage-chien-guide-utilisation-v2',
  'mycotoxines-croquettes-chien-risques-prevention': 'art-mycotoxines-croquettes-chien-risques-prevention-v2',
  'recette-friandises-saumon-patate-douce-chien': 'art-recette-friandises-saumon-patate-douce-chien',
  'comprendre-etiquette-patee-chien': 'art-comprendre-etiquette-patee-chien-v2',
  'chien-peut-manger-courgette': 'art-chien-peut-manger-courgette',
  'omega-3-chien-comparatif-sources': 'art-omega-3-chien-comparatif-sources-v4',
  'avis-franklin-light-dinde-patate-douce-epinards': 'art-avis-franklin-light-dinde-patate-douce-epinards',
  'avis-dog-chef-croquettes-canard-frais': 'art-avis-dog-chef-croquettes-canard-frais',
  'avis-fidelis-menus-frais-chien-bocaux': 'art-avis-fidelis-menus-frais-chien-bocaux-v2',
  'avis-dogfy-diet-repas-frais-chien': 'art-avis-dogfy-diet-repas-frais-chien',
  'chien-barbecue-securite-aliments-eviter': 'art-chien-barbecue-securite-aliments-eviter',
  'faut-il-rehydrater-croquettes-chien': 'art-faut-il-rehydrater-croquettes-chien-2',
  'chien-peut-manger-pain': 'art-chien-peut-manger-pain',
  'psyllium-chien-bienfaits-dosage': 'art-psyllium-chien-bienfaits-dosage',
  'huile-olive-chien-bienfaits-dosage': 'art-huile-olive-chien-bienfaits-dosage',
  'recette-biscuits-potiron-chien': 'art-recette-biscuits-potiron-chien',
  'proteines-chien-besoins-qualite': 'art-proteines-chien-besoins-qualite',
  'croquettes-chiot-grande-race': 'art-croquettes-chiot-grande-race',
  'chien-peut-manger-noix': 'art-chien-peut-manger-noix',
  'chien-peut-manger-lentilles': 'art-chien-peut-manger-lentilles',
  'recette-poulet-seche-chien': 'art-recette-poulet-seche-chien',
  'chien-peut-manger-kiwi': 'art-chien-peut-manger-kiwi',
  'recette-friandises-foie-seche-chien': 'art-recette-friandises-foie-seche-chien-2',
  'meilleures-croquettes-chien-senior': 'art-meilleures-croquettes-chien-senior',
  'chien-peut-manger-avoine': 'art-chien-peut-manger-avoine',
  'additifs-croquettes-chien-conservateurs-colorants': 'art-additifs-croquettes-chien-conservateurs-colorants',
  'chien-peut-manger-melon': 'art-chien-peut-manger-melon',
  'chien-mange-xylitol-urgence': 'art-chien-mange-xylitol-urgence',
  'chardon-marie-chien-bienfaits-dosage': 'art-chardon-marie-chien-bienfaits-dosage',
  'chien-toujours-faim-causes-solutions': 'art-chien-toujours-faim-causes-solutions',
  'chien-peut-manger-carottes': 'art-chien-peut-manger-carottes',
  'croquettes-a-volonte-ou-rationnees': 'art-croquettes-a-volonte-ou-rationnees',
  'recette-patee-maison-poulet-chien': 'art-recette-patee-maison-poulet-chien',
  'recette-patee-maison-poisson-chien': 'art-recette-patee-maison-poisson-chien',
  'chien-peut-manger-pomme': 'art-chien-peut-manger-pomme',
  'gamelle-surelevee-chien': 'art-gamelle-surelevee-chien-v2',
  'recette-patate-douce-sechee-chien': 'art-recette-patate-douce-sechee-chien',
  'chien-peut-manger-haricots-verts': 'art-chien-peut-manger-haricots-verts',
  'glucides-croquettes-chien': 'art-glucides-croquettes-chien',
  'fibres-alimentaires-chien-role-sources-dosage': 'art-fibres-alimentaires-chien-role-sources-dosage',
  'recette-friandises-banane-avoine-chien': 'art-recette-friandises-banane-avoine-chien',
  'nourriture-braque-de-weimar': 'art-nourriture-braque-de-weimar',
  'nourriture-american-staffordshire-terrier': 'art-nourriture-american-staffordshire-terrier',
  'chien-peut-manger-prunes': 'art-chien-peut-manger-prunes',
  'meilleures-croquettes-petit-chien': 'art-meilleures-croquettes-petit-chien',
  'chien-a-bu-eau-de-mer-que-faire': 'art-chien-a-bu-eau-de-mer-que-faire',
  'conserver-patee-chien-apres-ouverture': 'art-conserver-patee-chien-apres-ouverture',
  'chien-peut-manger-pates': 'art-chien-peut-manger-pates',
  'chien-boit-beaucoup-eau-causes': 'art-chien-boit-beaucoup-eau-causes',
  'recette-biscuits-sardine-chien': 'art-recette-biscuits-sardine-chien',
  'recette-friandises-education-chien': 'art-recette-friandises-education-chien',
  'pica-chien-causes-solutions': 'art-pica-chien-causes-solutions',
  'chien-peut-manger-noix-de-coco': 'art-chien-peut-manger-noix-de-coco',
  'avis-butternut-box': 'art-avis-butternut-box',
  'donner-comprime-chien-refuse-medicament': 'art-donner-comprime-chien-refuse-medicament',
  'nourriture-braque-allemand': 'art-nourriture-braque-allemand',
  'chien-peut-manger-jambon': 'art-chien-peut-manger-jambon',
  'collagene-chien-bienfaits-dosage': 'art-collagene-chien-bienfaits-dosage',
  'recette-friandises-dentaires-maison-chien': 'art-recette-friandises-dentaires-maison-chien',
  'alimentation-poisson-chien-guide': 'art-alimentation-poisson-chien-guide',
  'meilleure-gamelle-anti-glouton-chien': 'art-meilleure-gamelle-anti-glouton-chien',
  'chien-mange-noix-macadamia-urgence': 'art-chien-mange-noix-macadamia-urgence',
  'nourriture-setter-irlandais': 'art-nourriture-setter-irlandais',
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
