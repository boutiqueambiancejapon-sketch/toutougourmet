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
}

export const brands: Brand[] = [
  {
    slug: 'franklin',
    name: 'Franklin Pet Food',
    logo: '/images/marques/franklin-logo.webp',
    tagline: 'Croquettes premium sans céréales, mono-protéine',
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
      serviceClient: 4.5,
    },
    pros: [
      "Mono-protéine — moins de risques d'allergies",
      'Sans céréales ni gluten',
      "Jusqu'à 70% de viande",
      'Formulé par des nutritionnistes',
      "-30% sur la 1ère commande en abonnement",
    ],
    cons: [
      'Pas de repas frais dans la gamme',
      'Meilleur tarif uniquement via abonnement',
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
      "+3 ans d'espérance de vie vs croquettes",
    ],
    cons: [
      'Plus onéreux que les croquettes',
      'Nécessite un frigo — logistique différente',
    ],
    priceRange: '€€€',
    discountOffer: "-20% sur la 1ère commande",
    discountCode: null,
  },
  {
    slug: 'petty-well',
    name: 'Petty Well',
    logo: '/images/marques/pettywell-logo.webp',
    tagline: 'Croquettes françaises ultra-protéinées, sans céréales',
    affiliateUrl: 'https://c3po.link/QHutadCFex',
    affiliateCode: null,
    animal: ['chien', 'chat'],
    type: ['croquettes', 'pâtée'],
    scores: {
      global: 4.5,
      qualiteIngredients: 4.6,
      rapportQualitePrix: 4.5,
      digestibilite: 4.4,
      variantesDisponibles: 4.2,
      serviceClient: 4.6,
    },
    pros: [
      'Fabriqué en France, totale transparence',
      "Jusqu'à 41% de protéines animales",
      'Recommandé par des vétérinaires parisiens',
      "Box d'essai sans engagement",
      "-34% sur la 1ère box",
    ],
    cons: [
      'Gamme moins étendue que Franklin',
      'Pas de repas frais',
    ],
    priceRange: '€€',
    discountOffer: "-34% sur la 1ère box",
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
      "Élu Produit de l'Année 2026",
      '100% personnalisé par profil de chien',
      'Aucun conservateur artificiel',
      'Cuisson basse température',
      "4.8/5 sur plus de 7 800 avis vérifiés",
    ],
    cons: [
      'Uniquement pour les chiens (pas de chat)',
      'Prix plus élevé que les croquettes classiques',
    ],
    priceRange: '€€€',
    discountOffer: "-35% sur la box d'essai avec le code WZU7090",
    discountCode: 'WZU7090',
  },
]

export function getBrandBySlug(slug: string): Brand | undefined {
  return brands.find((b) => b.slug === slug)
}
