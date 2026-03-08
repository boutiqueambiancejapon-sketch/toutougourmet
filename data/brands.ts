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
      "+2,5 ans d'espérance de vie vs croquettes industrielles",
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
    slug: 'petty-well',
    name: 'Petty Well',
    logo: '/images/marques/pettywell-logo.webp',
    tagline: 'Croquettes 100% françaises, formulées avec AgroParisTech',
    affiliateUrl: 'https://c3po.link/QHutadCFex',
    affiliateCode: null,
    animal: ['chien', 'chat'],
    type: ['croquettes', 'pâtée'],
    scores: {
      global: 4.5,
      qualiteIngredients: 4.6,
      rapportQualitePrix: 4.5,
      digestibilite: 4.4,
      variantesDisponibles: 4.3,
      serviceClient: 4.7,
    },
    pros: [
      'Fabrication 100% française (Maine-et-Loire + Nord)',
      'Volaille du Gers nommément citée — traçabilité totale',
      'Co-développé avec AgroParisTech et Food\'Inn Lab',
      'Glucosamine & chondroïtine intégrées dans les recettes',
      '4,7/5 sur 2 700+ avis Trustpilot',
      "-34% sur la 1ère box via notre lien",
    ],
    cons: [
      'Pas de repas frais (croquettes + pâtées uniquement)',
      'Taux de glucides ~33% (idéalement <25% selon nutritionnistes)',
    ],
    priceRange: '€€',
    discountOffer: "-34% sur la 1ère box via notre lien",
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
    ],
    priceRange: '€€€',
    discountOffer: "-35% sur la box d'essai avec le code WZU7090",
    discountCode: 'WZU7090',
  },
]

export function getBrandBySlug(slug: string): Brand | undefined {
  return brands.find((b) => b.slug === slug)
}
