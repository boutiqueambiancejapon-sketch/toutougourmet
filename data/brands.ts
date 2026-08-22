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
]

export function getBrandBySlug(slug: string): Brand | undefined {
  return brands.find((b) => b.slug === slug)
}
