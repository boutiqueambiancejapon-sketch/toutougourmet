import { CONFIRMED_DISCOUNTS } from './partner-discounts'

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
  /** Remise affichée : toujours tirée de data/partner-discounts.ts (seule source) */
  discountOffer: string
  discountCode: string | null
  /** Alerte de disponibilité affichée à la place de l'offre (rupture de stock, etc.) */
  stockNote?: string
  /** Fiche d'identité affichée dans les tableaux et la bande encre (sources : fiches marques et tests publiés). */
  facts: BrandFacts
}

export interface BrandFacts {
  /** Prix indicatif, tel que publié dans la fiche ou le test de la marque */
  price: string
  /** Type d'aliment, en clair */
  format: string
  /** Lieu de fabrication */
  madeIn: string
  /** Mode de livraison */
  delivery: string
  /** Point fort en une phrase courte */
  strength: string
  /** Pour quel chien */
  bestFor: string
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
      "Pionniers du mono-protéine en France, pratique pour un chien allergique",
      "Jusqu'à 70 % de viande, cuisson entre 90 et 110 °C",
      "Formulé avec la Dr Charlotte Dirat (vétérinaire nutritionniste)",
      '4,7/5 sur plus de 4 700 avis Trustpilot, 100 000 clients revendiqués',
      'Abonnement sans engagement, de 15 à 20 % moins cher',
    ],
    cons: [
      "Fabriqué en Rép. Tchèque (formulé en France, pas made in France)",
      "Livraison parfois problématique (retards, colis bloqués)",
      "Transition alimentaire délicate : prévoir 10 jours minimum",
    ],
    priceRange: '€€',
    discountOffer: CONFIRMED_DISCOUNTS.franklin ?? "",
    discountCode: null,
    facts: {
      price: 'Environ 5,20 à 9 € le kg selon la recette et le sac',
      format: 'Croquettes et pâtées',
      madeIn: 'République tchèque (recettes formulées à Paris)',
      delivery: "Colis, gratuit dès 49 € en point relais avec l'abonnement",
      strength: 'Une seule source de viande par recette',
      bestFor: 'Chien allergique ou à la digestion sensible',
    },
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
      'Ingrédients de qualité humaine',
      'Sans conservateur ni colorant artificiel',
      'Cuisson douce sous vide à 90 °C',
      'Livraison réfrigérée à domicile',
      'Recettes pour chat aussi (poulet, bœuf, dinde)',
    ],
    cons: [
      'Plus onéreux que les croquettes',
      'Nécessite de la place au frigo',
    ],
    priceRange: '€€€',
    discountOffer: CONFIRMED_DISCOUNTS.elmut ?? "",
    discountCode: null,
    facts: {
      price: 'Environ 55 à 75 € par mois pour un chien de moins de 10 kg',
      format: 'Repas frais cuisinés',
      madeIn: 'Cuisine agréée qualité humaine (lieu non communiqué)',
      delivery: 'Colis réfrigéré Chronofresh',
      strength: 'Cuisson douce et ration calculée au profil du chien',
      bestFor: 'Chien senior ou en surpoids',
    },
  },
  {
    slug: 'ultra-premium-direct',
    name: 'Ultra Premium Direct',
    logo: '/images/marques/ultrapremiumdirect-logo.webp',
    tagline: 'Croquettes vendues en direct, sans animalerie ni intermédiaire',
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
      "Vente directe : jusqu'à 40 % de moins que des marques équivalentes en animalerie, selon la marque",
      "Prébiotiques FOS et MOS ajoutés pour le confort digestif",
      "Sans colorants ni additifs artificiels",
      "Gamme complète chien et chat (croquettes, pâtées, friandises)",
      "Enrobage final réalisé à Agen (France)",
    ],
    cons: [
      "Croquettes semi-finies achetées à des sous-traitants européens, donc pas 100 % fabriquées en France",
      "Présence de protéines végétales (pois) sur certaines recettes",
      "Taux de glucides parfois élevé (jusqu'à 35 % MS sur certaines formules)",
    ],
    priceRange: '€€',
    discountOffer: CONFIRMED_DISCOUNTS["ultra-premium-direct"] ?? "",
    discountCode: null,
    facts: {
      price: 'Environ 3 à 5 € le kg selon la gamme',
      format: 'Croquettes, pâtées et friandises',
      madeIn: 'Enrobage à Agen, croquettes de sous-traitants européens',
      delivery: 'Colis en 2 à 4 jours ouvrés, gratuit dès 49 €',
      strength: 'Le prix au kilo le plus bas de la sélection',
      bestFor: 'Chien adulte sans souci particulier, budget serré',
    },
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
      "Élu Produit de l'Année 2026, 4,8/5 sur plus de 7 800 avis",
      'Ration calculée sur le profil du chien, recalculée quand son poids change',
      'Boosters ciblés : Puppy, Senior, Mobility, Transit',
      'Livraison gratuite incluse',
      'Se conserve 7 jours au frigo et 4 mois au congélateur',
    ],
    cons: [
      'Uniquement pour les chiens (pas de chat)',
      'Prix plus élevé que les croquettes classiques',
      'Inscription avec profil détaillé obligatoire avant de pouvoir commander',
    ],
    priceRange: '€€€',
    discountOffer: CONFIRMED_DISCOUNTS["dog-chef"] ?? "",
    discountCode: 'WZU7090',
    facts: {
      price: 'Environ 1,50 à 5,50 € par jour selon le gabarit',
      format: 'Repas frais, ou mixte avec croquettes',
      madeIn: 'Atelier Dog Chef à Huldenberg (Belgique)',
      delivery: 'Camionnette réfrigérée, livraison gratuite',
      strength: 'Portions recalculées quand le poids du chien change',
      bestFor: 'Chiot, chien en surpoids ou senior',
    },
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
    discountOffer: CONFIRMED_DISCOUNTS["dogfy-diet"] ?? "",
    discountCode: null,
    facts: {
      price: 'Environ 50 à 200 € par mois, de 5 à 40 kg',
      format: 'Repas frais cuits sous vide',
      madeIn: 'Non communiqué',
      delivery: 'Sachets prédosés livrés congelés',
      strength: 'Sachets prédosés et suivi nutritionnel gratuit',
      bestFor: 'Chien difficile à nourrir',
    },
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
    facts: {
      price: 'Environ 11 à 12,50 € le kg',
      format: 'Menus en bocaux de verre',
      madeIn: 'Allemagne (Sanadog GmbH)',
      delivery: "Colis depuis l'Allemagne, 2 à 5 jours ouvrés",
      strength: 'Bocaux qui se gardent au placard avant ouverture',
      bestFor: "Chien qui a besoin d'une viande peu courante (cheval, chèvre)",
    },
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
