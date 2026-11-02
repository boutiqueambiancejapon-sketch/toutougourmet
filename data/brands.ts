export interface BrandScores {
  global: number
  qualiteIngredients: number
  rapportQualitePrix: number
  digestibilite: number
  variantesDisponibles: number
  serviceClient: number
}

export interface Brand {
  slug: string
  name: string
  logo: string
  tagline: string
  affiliateUrl: string
  affiliateCode: string | null
  animal: ('chien' | 'chat')[]
  type: string[]
  scores: BrandScores
  pros: string[]
  cons: string[]
  priceRange: '€' | '€€' | '€€€'
  discountOffer: string
  discountCode: string | null
  /** Alerte de disponibilité affichée à la place de l'offre (rupture de stock, etc.) */
  stockNote?: string
}

export const brands: Brand[] = [
  {
    slug: 'franklin',
    name: 'Franklin Pet Food',
    logo: '/images/marques/franklin-logo.webp',
    tagline: 'Pionniers du mono-protéine en France depuis 2018',
    affiliateUrl: 'https://c3po.link/Q3xbJhfapn',
    affiliateCode: null,
    animal: ['chien', 'chat'],
    type: ['croquettes', 'pâtée', 'friandises', 'compléments'],
    scores: {
      global: 4.6,
      qualiteIngredients: 4.7,
      rapportQualitePrix: 4.4,
      digestibilite: 4.5,
      variantesDisponibles: 4.8,
      serviceClient: 4.3,
    },
    pros: [
      "Pionniers du mono-protéine en France — idéal allergies",
      "Jusqu'à 70% de viande, cuisson basse température 90–110 °C",
      "Formulé avec la Dr Charlotte Dirat (vétérinaire nutritionniste)",
      "4,7/5 sur 4 700+ avis Trustpilot · 100 000 clients",
      "-30% sur la 1ère commande en abonnement",
    ],
    cons: [
      "Fabriqué en Rép. Tchèque (formulé en France, pas made in France)",
      "Livraison parfois problématique (retards, colis bloqués)",
      "Transition alimentaire délicate — prévoir 10 jours minimum",
    ],
    priceRange: '€€',
    discountOffer: "-30% sur la 1ère commande en abonnement",
    discountCode: null,
  },
  {
    slug: 'elmut',
    name: 'Elmut',
    logo: '/images/marques/elmut-logo.webp',
    tagline: 'Repas frais cuisinés maison, livrés chez toi',
    affiliateUrl: 'https://c3po.link/QWMW4k6mbU',
    affiliateCode: null,
    animal: ['chien', 'chat'],
    type: ['repas frais'],
    scores: {
      global: 4.7,
      qualiteIngredients: 4.9,
      rapportQualitePrix: 4.2,
      digestibilite: 4.8,
      variantesDisponibles: 4.3,
      serviceClient: 4.7,
    },
    pros: [
      'Ingrédients qualité humaine',
      'Sans conservateurs ni additifs controversés',
      'Cuisson douce préservant les nutriments',
      'Livraison réfrigérée à domicile',
      "-40% sur la 1ère commande via notre lien",
    ],
    cons: [
      'Plus onéreux que les croquettes',
      'Nécessite un frigo — logistique différente',
    ],
    priceRange: '€€€',
    discountOffer: "-40% sur la 1ère commande via notre lien",
    discountCode: null,
  },
  {
    slug: 'ultra-premium-direct',
    name: 'Ultra Premium Direct',
    logo: '/images/marques/ultrapremiumdirect-logo.webp',
    tagline: 'Vente directe sans intermédiaire — premium accessible à -40 % vs animalerie',
    affiliateUrl: 'https://c3po.link/QqJYNnzYD8',
    affiliateCode: null,
    animal: ['chien', 'chat'],
    type: ['croquettes', 'pâtée', 'friandises'],
    scores: {
      global: 4.4,
      qualiteIngredients: 4.3,
      rapportQualitePrix: 4.7,
      digestibilite: 4.4,
      variantesDisponibles: 4.5,
      serviceClient: 4.6,
    },
    pros: [
      "Modèle vente directe — jusqu'à -40 % vs marques équivalentes en animalerie",
      "Prébiotiques FOS et MOS intégrés — soutien du confort digestif",
      "Sans colorants ni additifs artificiels",
      "Gamme complète chien et chat (croquettes, pâtées, friandises)",
      "Enrobage final réalisé à Agen (France) — assemblage local",
    ],
    cons: [
      "Croquettes semi-finies sourcées chez des sous-traitants européens — pas 100 % Made in France",
      "Présence de protéines végétales (pois) sur certaines recettes",
      "Taux de glucides parfois élevé (jusqu'à 35 % MS sur certaines formules)",
    ],
    priceRange: '€€',
    discountOffer: "-20 % sur la 1ère commande en abonnement via notre lien",
    discountCode: null,
  },
  {
    slug: 'dog-chef',
    name: 'Dog Chef',
    logo: '/images/marques/dogchef-logo.webp',
    tagline: 'Repas frais sur-mesure, livrés à domicile',
    affiliateUrl: 'https://www.dogchef.com/fr/code/WZU7090',
    affiliateCode: 'WZU7090',
    animal: ['chien'],
    type: ['repas frais', 'croquettes'],
    scores: {
      global: 4.8,
      qualiteIngredients: 4.9,
      rapportQualitePrix: 4.3,
      digestibilite: 4.8,
      variantesDisponibles: 4.6,
      serviceClient: 4.7,
    },
    pros: [
      "Élu Produit de l'Année 2026 — 4.8/5 sur 7 800+ avis",
      '100% personnalisé par profil + ajustement automatique',
      'Boosters ciblés : Puppy, Senior, Mobility, Transit',
      'Livraison gratuite incluse — 0 frais cachés',
      'Conservation 7j frigo / 4 mois congélo',
    ],
    cons: [
      'Uniquement pour les chiens (pas de chat)',
      'Prix plus élevé que les croquettes classiques',
      'Inscription avec profil détaillé obligatoire avant de pouvoir commander',
    ],
    priceRange: '€€€',
    discountOffer: "-35% sur la box d'essai avec le code WZU7090",
    discountCode: 'WZU7090',
  },
  {
    slug: 'dogfy-diet',
    name: 'Dogfy Diet',
    logo: '/images/marques/dogfy-diet-logo.webp',
    tagline: 'Repas frais cuits sous vide, livrés en sachets prédosés',
    affiliateUrl: 'https://tidd.ly/4jT3Tqg',
    affiliateCode: null,
    animal: ['chien'],
    type: ['repas frais'],
    scores: {
      global: 4.4,
      qualiteIngredients: 4.4,
      rapportQualitePrix: 4.2,
      digestibilite: 4.3,
      variantesDisponibles: 4.0,
      serviceClient: 3.9,
    },
    pros: [
      'Cuisson sous vide à température douce',
      'Sachets prédosés, prêts à servir',
      'Abonnement sans engagement et suivi nutritionnel gratuit',
      'Menu bœuf : 65 % de bœuf et 22 % de carotte',
      '4,4/5 sur 12 566 avis Trustpilot',
    ],
    cons: [
      "Prélèvements de l'abonnement mal compris et résiliation jugée difficile dans une partie des avis",
      'Quelques sachets livrés abîmés selon les avis',
      'Menu bœuf riche (environ 31 % de matières grasses sur matière sèche) : à doser avec soin chez un chien en surpoids',
    ],
    priceRange: '€€€',
    discountOffer: "-50 % sur la box d'essai de 14 jours, livraison offerte",
    discountCode: null,
  },
  {
    slug: 'fidelis',
    name: 'Fidelis',
    logo: '/images/marques/fidelis-logo.webp',
    tagline: 'Menus frais en bocaux de verre, cuits à la vapeur douce',
    affiliateUrl: 'https://tidd.ly/48rl0Z3',
    affiliateCode: null,
    animal: ['chien'],
    type: ['menus en bocaux'],
    scores: {
      global: 4.0,
      qualiteIngredients: 4.3,
      rapportQualitePrix: 4.0,
      digestibilite: 4.0,
      variantesDisponibles: 4.2,
      serviceClient: 3.5,
    },
    pros: [
      'Bocaux en verre qui se gardent hors du frigo avant ouverture',
      '8 recettes, dont cheval et chèvre',
      '70 % de viande dans les recettes poulet, bœuf et cheval',
      'Cuisson vapeur douce, recettes développées avec la vétérinaire Anita Kröger',
      'Environ 11 à 12,50 € le kilo',
    ],
    cons: [
      'Tous les menus en bocaux affichés en rupture de stock (« Sold Out ») au 1er novembre 2026',
      "Pas de page Trustpilot pour fidelis.fr : peu d'avis clients vérifiables",
    ],
    priceRange: '€€',
    discountOffer: '',
    discountCode: null,
    stockNote: 'Bocaux en rupture de stock au 1er novembre 2026',
  },
]

export function getBrandBySlug(slug: string): Brand | undefined {
  return brands.find((b) => b.slug === slug)
}

/** Libellé de la case « offre » : l'offre de bienvenue, sinon l'alerte de stock. */
export function brandOfferLabel(brand: Brand): string {
  return brand.discountOffer || brand.stockNote || "Pas d'offre de bienvenue"
}

/** Couleurs par marque (jetons V2) : encre pour le texte, fond teinté, pastille. */
export interface BrandTone {
  ink: string
  bg: string
  pill: string
}

const BRAND_TONES: Record<string, BrandTone> = {
  franklin: { ink: 'var(--green-ink)', bg: 'var(--green-bg)', pill: 'var(--green)' },
  elmut: { ink: 'var(--rose-ink)', bg: 'var(--rose-bg)', pill: 'var(--rose)' },
  'ultra-premium-direct': { ink: 'var(--blue-ink)', bg: 'var(--blue-bg)', pill: 'var(--blue)' },
  'dog-chef': { ink: 'var(--amber-ink)', bg: 'var(--amber-bg)', pill: 'var(--amber)' },
  'dogfy-diet': { ink: 'var(--orange-ink)', bg: 'var(--cream-2)', pill: 'var(--amber)' },
  fidelis: { ink: 'var(--ink-2)', bg: 'var(--cream-2)', pill: 'var(--line)' },
}

export function brandTone(slug: string): BrandTone {
  return BRAND_TONES[slug] ?? { ink: 'var(--orange-ink)', bg: 'var(--cream-2)', pill: 'var(--line)' }
}

/** Initiales affichées quand aucun logo n'est disponible (« Dogfy Diet » → « DD »). */
export function brandInitials(brand: Brand): string {
  return brand.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('')
}

/** Marques qui ont déjà des pages duel « a-vs-b » : aucun nouveau duel pour les autres. */
export const DUEL_BRAND_SLUGS: readonly string[] = ['franklin', 'elmut', 'ultra-premium-direct', 'dog-chef']

export function getDuelPairs(): [Brand, Brand][] {
  const duelBrands = brands.filter((b) => DUEL_BRAND_SLUGS.includes(b.slug))
  const pairs: [Brand, Brand][] = []
  for (let i = 0; i < duelBrands.length; i++) {
    for (let j = i + 1; j < duelBrands.length; j++) pairs.push([duelBrands[i], duelBrands[j]])
  }
  return pairs
}
