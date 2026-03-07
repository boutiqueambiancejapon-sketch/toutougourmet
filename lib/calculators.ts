// ─── Types ───────────────────────────────────────────────────────────────────

export type Animal = 'chien' | 'chat'
export type AgeGroup = 'chiot' | 'adulte' | 'senior'
export type ActivityLevel = 'sedentaire' | 'normal' | 'actif' | 'tres-actif'
export type SizeCategory = 'petit' | 'moyen' | 'grand' | 'tres-grand'

// ─── Besoin Énergétique ───────────────────────────────────────────────────────

/**
 * Calcule le Besoin Énergétique d'Entretien (BEE) en kcal/jour.
 * Source : formule vétérinaire standard (NRC 2006)
 */
export function calculateDailyCalories(params: {
  animal: Animal
  weightKg: number
  ageGroup: AgeGroup
  activityLevel: ActivityLevel
  sterilized: boolean
  isRaceHighEnergy?: boolean // ex: Border Collie, Husky, Terriers
}): number {
  const { animal, weightKg, ageGroup, activityLevel, sterilized, isRaceHighEnergy } = params

  // Base RER (Resting Energy Requirement) — FEDIAF/NRC 2006
  // Chien : 70 × W^0.75 | Chat : 50 × W^0.75
  // NB : le facteur 130 anciennement utilisé incluait déjà l'activité,
  //      ce qui causait un double-comptage avec les facteurs ci-dessous.
  let baseCoeff = animal === 'chat' ? 50 : 70
  if (ageGroup === 'senior') baseCoeff = animal === 'chien' ? 55 : 40
  if (isRaceHighEnergy) baseCoeff = 90

  let ber = baseCoeff * Math.pow(weightKg, 0.75)

  // Facteur d'activité appliqué sur le RER
  const activityFactors: Record<ActivityLevel, number> = {
    sedentaire:   1.2,
    normal:       1.5,
    actif:        1.8,
    'tres-actif': 2.3,
  }
  ber *= activityFactors[activityLevel]

  // Chiots : besoins augmentés (~1.8× adulte)
  if (ageGroup === 'chiot') ber *= 1.8

  // Stérilisé : -15%
  if (sterilized) ber *= 0.85

  return Math.round(ber)
}

/**
 * Convertit les kcal/jour en grammes de croquettes.
 * Densité énergétique moyenne : 360 kcal/100g (premium sans céréales)
 */
export function caloriesToGramsKibble(kcal: number, kcalPer100g = 360): number {
  return Math.round((kcal / kcalPer100g) * 100)
}

/**
 * Convertit les kcal/jour en grammes de repas frais.
 * Densité énergétique moyenne : 120 kcal/100g
 */
export function caloriesToGramsFresh(kcal: number, kcalPer100g = 120): number {
  return Math.round((kcal / kcalPer100g) * 100)
}

// ─── Budget mensuel ───────────────────────────────────────────────────────────

interface BrandPricing {
  name: string
  slug: string
  pricePerKg: number // € / kg
  type: 'croquettes' | 'repas-frais'
  kcalPer100g: number
  affiliateUrl: string
  offer: string
}

export const brandPricings: BrandPricing[] = [
  {
    name: 'Franklin Pet Food',
    slug: 'franklin',
    pricePerKg: 12.5,
    type: 'croquettes',
    kcalPer100g: 380,
    affiliateUrl: 'https://c3po.link/Q3xbJhfapn',
    offer: '-30% 1ère commande',
  },
  {
    name: 'Petty Well',
    slug: 'petty-well',
    pricePerKg: 11.8,
    type: 'croquettes',
    kcalPer100g: 370,
    affiliateUrl: 'https://c3po.link/QHutadCFex',
    offer: '-34% 1ère box',
  },
  {
    name: 'Elmut',
    slug: 'elmut',
    pricePerKg: 8.0,    // tarif abonnement mensuel (~8€/kg livré)
    type: 'repas-frais',
    kcalPer100g: 140,   // repas frais, densité élevée
    affiliateUrl: 'https://c3po.link/QWMW4k6mbU',
    offer: '-20% 1ère commande',
  },
  {
    name: 'Dog Chef',
    slug: 'dog-chef',
    pricePerKg: 8.5,    // tarif abonnement mensuel hors remise 1ère box
    type: 'repas-frais',
    kcalPer100g: 150,   // recettes légèrement plus denses qu'Elmut
    affiliateUrl: 'https://www.dogchef.com/fr/code/WZU7090',
    offer: '-35% box d\'essai',
  },
]

export function calculateMonthlyBudget(dailyCalories: number, brand: BrandPricing): number {
  const dailyGrams = (dailyCalories / brand.kcalPer100g) * 100
  const dailyCost = (dailyGrams / 1000) * brand.pricePerKg
  return Math.round(dailyCost * 30)
}

// ─── Score de Condition Corporelle ──────────────────────────────────────────

export type BodyScore = 'maigre' | 'sous-poids' | 'ideal' | 'surpoids' | 'obese'

export interface BodyScoreResult {
  score: BodyScore
  label: string
  description: string
  advice: string
  color: string
}

/**
 * Évalue le score de condition corporelle selon le poids actuel vs idéal.
 * Basé sur l'échelle BCS (Body Condition Score) vétérinaire 1-9.
 */
export function evaluateBodyScore(currentWeight: number, idealWeight: number): BodyScoreResult {
  const ratio = currentWeight / idealWeight

  if (ratio < 0.85) {
    return {
      score: 'maigre',
      label: 'Trop maigre',
      description: 'Ton animal est significativement en dessous de son poids idéal.',
      advice: 'Augmente les rations progressivement et consulte un vétérinaire pour écarter une cause médicale.',
      color: '#5B9BD5',
    }
  }
  if (ratio < 0.95) {
    return {
      score: 'sous-poids',
      label: 'Légèrement sous le poids idéal',
      description: 'Ton animal est légèrement en dessous de son poids de forme.',
      advice: 'Augmente légèrement les rations (+10%) et surveille l\'évolution sur 4 semaines.',
      color: '#F2B85A',
    }
  }
  if (ratio <= 1.1) {
    return {
      score: 'ideal',
      label: 'Poids idéal',
      description: 'Ton animal est à son poids de forme.',
      advice: 'Continue avec les rations actuelles. Bravo !',
      color: '#4CAF7D',
    }
  }
  if (ratio <= 1.25) {
    return {
      score: 'surpoids',
      label: 'Légèrement en surpoids',
      description: 'Ton animal dépasse son poids idéal de 10 à 25%.',
      advice: 'Réduis les rations de 10-15% et augmente l\'activité physique. Évite les friandises en dehors des repas.',
      color: '#F2B85A',
    }
  }
  return {
    score: 'obese',
    label: 'Surpoids important',
    description: 'Ton animal dépasse son poids idéal de plus de 25%. C\'est un facteur de risque sérieux.',
    advice: 'Consulte un vétérinaire pour un programme de perte de poids adapté. Une alimentation pauvre en glucides (comme les croquettes sans céréales) peut aider.',
    color: '#E8622A',
  }
}

/**
 * Poids idéal approximatif par taille/catégorie pour les chiens.
 * Source : standards vétérinaires par catégorie de taille.
 */
export const dogSizeRanges: Record<SizeCategory, { label: string; minKg: number; maxKg: number; midKg: number }> = {
  petit: { label: 'Petit (Yorkshire, Chihuahua, Carlin...)', minKg: 1, maxKg: 10, midKg: 5 },
  moyen: { label: 'Moyen (Cocker, Beagle, Bulldog...)', minKg: 10, maxKg: 25, midKg: 15 },
  grand: { label: 'Grand (Labrador, Golden, Husky...)', minKg: 25, maxKg: 40, midKg: 32 },
  'tres-grand': { label: 'Très grand (Berger, Dogue, Saint-Bernard...)', minKg: 40, maxKg: 80, midKg: 55 },
}

// ─── Comparateur coût annuel ─────────────────────────────────────────────────

export type FoodType = 'croquettes-standard' | 'croquettes-premium' | 'repas-frais' | 'mixte'

export interface CostComparison {
  type: FoodType
  label: string
  pricePerKg: number
  kcalPer100g: number
  monthlyBudget: number
  annualBudget: number
  pros: string[]
  cons: string[]
}

export function buildCostComparisons(dailyCalories: number): CostComparison[] {
  const types: Array<Omit<CostComparison, 'monthlyBudget' | 'annualBudget'>> = [
    {
      type: 'croquettes-standard',
      label: 'Croquettes standard (grande surface)',
      pricePerKg: 4.5,
      kcalPer100g: 340,
      pros: ['Le moins cher', 'Facile à trouver'],
      cons: ['Qualité nutritionnelle faible', 'Beaucoup de céréales', 'Digestibilité basse'],
    },
    {
      type: 'croquettes-premium',
      label: 'Croquettes premium sans céréales',
      pricePerKg: 12.0,
      kcalPer100g: 375,
      pros: ['Meilleure qualité', 'Plus digestible', 'Moins de selles'],
      cons: ['Plus cher', 'Moins disponible en magasin'],
    },
    {
      type: 'repas-frais',
      label: 'Repas frais (livraison)',
      pricePerKg: 5.3,     // tarif abonnement fidèle (~5-6€/kg livré, hors remise 1ère box)
      kcalPer100g: 145,    // densité moyenne repas frais premium
      pros: ['Meilleure digestibilité', 'Ingrédients qualité humaine', 'Sans conservateurs'],
      cons: ['Le plus cher', 'Nécessite un frigo', 'Logistique de livraison'],
    },
    {
      type: 'mixte',
      label: 'Mix croquettes premium + repas frais',
      pricePerKg: 7.0,     // prix moyen pondéré ~70% croquettes + 30% frais
      kcalPer100g: 200,    // densité intermédiaire
      pros: ['Bon compromis qualité/prix', 'Variété appréciée des animaux'],
      cons: ['Calcul des rations plus complexe'],
    },
  ]

  return types.map((t) => {
    const dailyGrams = (dailyCalories / t.kcalPer100g) * 100
    const dailyCost = (dailyGrams / 1000) * t.pricePerKg
    const monthlyBudget = Math.round(dailyCost * 30)
    return { ...t, monthlyBudget, annualBudget: monthlyBudget * 12 }
  })
}
