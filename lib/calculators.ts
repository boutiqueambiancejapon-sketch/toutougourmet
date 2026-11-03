// ─── Types ───────────────────────────────────────────────────────────────────

export type Animal = 'chien' | 'chat'
export type AgeGroup = 'chiot' | 'adulte' | 'senior'
export type ActivityLevel = 'sedentaire' | 'normal' | 'actif' | 'tres-actif'
export type SizeCategory = 'petit' | 'moyen' | 'grand' | 'tres-grand'

// ─── Besoin Énergétique ───────────────────────────────────────────────────────

// @cdc outils — formule unique de la ration, partagée par /outils/ration, le mini-outil de
// l'accueil (components/tools/RationQuick.tsx), le budget et le coût annuel. Les textes
// « Comment on calcule » lisent ces constantes : changer un chiffre ici change aussi l'affichage.
//
// Besoin au repos (RER) : 70 × poids^0,75 pour le chien (NRC 2006, Nutrient Requirements of Dogs
// and Cats, chap. 3). Le besoin d'entretien = RER × facteur d'activité ; avec 70 × 1,5 = 105 pour
// une activité normale, on reste dans la fourchette FEDIAF 2021 (95 kcal/kg^0,75 pour un chien peu
// actif, 110 pour une activité modérée).

/** Coefficient du besoin au repos (kcal par kg^0,75), avant facteur d'activité. */
export const RER_COEFF = { chien: 70, chat: 50, chienSenior: 55, chatSenior: 40, hauteEnergie: 90 } as const

/** Facteurs d'activité appliqués au besoin au repos. */
export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentaire: 1.2,
  normal: 1.5,
  actif: 1.8,
  'tres-actif': 2.3,
}

/** Multiplicateur chiot / chaton (croissance) et réduction après stérilisation. */
export const PUPPY_FACTOR = 1.8
export const STERILIZED_FACTOR = 0.85

/** Densités énergétiques moyennes (kcal pour 100 g) utilisées pour convertir en grammes. */
export const KIBBLE_KCAL_100G = 360
// @cdc outils — repas frais : 133 kcal/100 g, moyenne publiée par Dog Chef (help.dogchef.com,
// « How many kcal are in the Dog Chef fresh meals? »). L'ancienne valeur (120) gonflait les grammes de 11 %.
export const FRESH_KCAL_100G = 133

export interface RationInput {
  animal: Animal
  weightKg: number
  ageGroup: AgeGroup
  activityLevel: ActivityLevel
  sterilized: boolean
  isRaceHighEnergy?: boolean // ex: Border Collie, Husky, Terriers
}

/** Besoin énergétique journalier en kcal (voir la formule en tête de section). */
export function calculateDailyCalories(params: RationInput): number {
  const { animal, weightKg, ageGroup, activityLevel, sterilized, isRaceHighEnergy } = params

  let baseCoeff: number = animal === 'chat' ? RER_COEFF.chat : RER_COEFF.chien
  if (ageGroup === 'senior') baseCoeff = animal === 'chien' ? RER_COEFF.chienSenior : RER_COEFF.chatSenior
  if (isRaceHighEnergy) baseCoeff = RER_COEFF.hauteEnergie

  let kcal = baseCoeff * Math.pow(weightKg, 0.75) * ACTIVITY_FACTORS[activityLevel]
  if (ageGroup === 'chiot') kcal *= PUPPY_FACTOR
  if (sterilized) kcal *= STERILIZED_FACTOR

  return Math.round(kcal)
}

/** Convertit les kcal/jour en grammes de croquettes. */
export function caloriesToGramsKibble(kcal: number, kcalPer100g = KIBBLE_KCAL_100G): number {
  return Math.round((kcal / kcalPer100g) * 100)
}

/** Convertit les kcal/jour en grammes de repas frais. */
export function caloriesToGramsFresh(kcal: number, kcalPer100g = FRESH_KCAL_100G): number {
  return Math.round((kcal / kcalPer100g) * 100)
}

export interface RationValues {
  kcal: number
  gKibble: number
  gFresh: number
}

/** Ration complète : kcal et grammes. Même résultat partout pour les mêmes réglages. */
export function computeRation(params: RationInput): RationValues {
  const kcal = calculateDailyCalories(params)
  return { kcal, gKibble: caloriesToGramsKibble(kcal), gFresh: caloriesToGramsFresh(kcal) }
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
    offer: '-30 % 1re commande',
  },
  {
    name: 'Elmut',
    slug: 'elmut',
    pricePerKg: 6.0,    // tarif abonnement (~6€/kg livré, moins cher que Dog Chef)
    type: 'repas-frais',
    kcalPer100g: 170,   // densité calorique recettes viande fraîche Elmut
    affiliateUrl: 'https://c3po.link/QWMW4k6mbU',
    offer: '-40 % 1re commande',
  },
  {
    name: 'Dog Chef',
    slug: 'dog-chef',
    pricePerKg: 8.5,    // tarif abonnement mensuel hors remise 1ère box
    type: 'repas-frais',
    kcalPer100g: 188,   // densité calorique recettes Dog Chef (viande fraîche)
    affiliateUrl: 'https://www.dogchef.com/fr/code/WZU7090',
    offer: '-30 % box d\'essai',
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
  /** Écart au poids de forme, en % (négatif = en dessous) */
  gapPct: number
  advice: string
}

/**
 * Situe le poids actuel par rapport au poids de forme. Les seuils (-15 %, -5 %, +10 %, +25 %)
 * sont des repères de l'outil, pas l'échelle BCS 1-9 qui s'évalue à la palpation.
 */
export function evaluateBodyScore(currentWeight: number, idealWeight: number): BodyScoreResult {
  const ratio = currentWeight / idealWeight
  const gapPct = Math.round((ratio - 1) * 100)

  if (ratio < 0.85) {
    return { score: 'maigre', label: 'Trop maigre', gapPct, advice: 'Augmente sa ration progressivement et montre-le à ton vétérinaire pour écarter une cause médicale.' }
  }
  if (ratio < 0.95) {
    return { score: 'sous-poids', label: 'Un peu sous son poids de forme', gapPct, advice: 'Augmente sa ration de 10\u00a0% et repèse-le dans 4 semaines.' }
  }
  if (ratio <= 1.1) {
    return { score: 'ideal', label: 'À son poids de forme', gapPct, advice: 'Garde la même ration et repèse-le tous les mois.' }
  }
  if (ratio <= 1.25) {
    return { score: 'surpoids', label: 'En surpoids', gapPct, advice: 'Calcule sa ration pour son poids de forme, pas pour son poids actuel, et compte les friandises dedans.' }
  }
  return { score: 'obese', label: 'En fort surpoids', gapPct, advice: "Plus de 25\u00a0% au-dessus de son poids de forme\u00a0: demande un programme d'amaigrissement à ton vétérinaire avant de réduire sa ration." }
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

// ─── Calculateur d'âge humain équivalent ─────────────────────────────────────

// Tables de conversion âge chien → âge humain selon la taille
// Source : tableau par gabarit diffusé par l'AVMA (American Veterinary Medical Association)
const AGE_TABLES: Record<SizeCategory, number[]> = {
  // index 0 = 1 an, index 1 = 2 ans, etc.
  petit:      [15, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76, 80],
  moyen:      [15, 24, 28, 32, 36, 42, 47, 51, 56, 60, 65, 69, 74, 78, 83, 87],
  grand:      [15, 24, 28, 32, 36, 45, 50, 55, 61, 66, 72, 77, 82, 88],
  'tres-grand': [12, 22, 31, 38, 45, 49, 56, 64, 71, 79, 86, 93],
}

export interface DogAgeResult {
  humanAge: number
  lifeStage: string
  stagePill: 'chiot' | 'jeune' | 'adulte' | 'senior' | 'tres-senior'
  context: string
}

/**
 * Convertit l'âge d'un chien en âge humain équivalent selon sa taille.
 * Supporte les années fractionnaires (ex : 1.5 = 1 an et 6 mois).
 */
export function calculateDogHumanAge(dogYears: number, size: SizeCategory): DogAgeResult {
  const table = AGE_TABLES[size]
  const maxAge = table.length // âge max de la table (1-indexé)

  let humanAge: number

  if (dogYears <= 0) {
    // Moins d'1 an : interpolation linéaire entre 0 et table[0]
    humanAge = Math.round(dogYears * table[0])
  } else if (dogYears >= maxAge) {
    // Au-delà de la table : extrapolation avec le dernier incrément
    const lastIncrement = table[maxAge - 1] - table[maxAge - 2]
    humanAge = table[maxAge - 1] + Math.round((dogYears - maxAge) * lastIncrement)
  } else {
    // Interpolation linéaire entre deux entrées de la table
    const lowerIdx = Math.floor(dogYears) - 1
    const upperIdx = lowerIdx + 1
    const frac = dogYears - Math.floor(dogYears)
    const lower = lowerIdx < 0 ? 0 : table[lowerIdx]
    const upper = table[upperIdx] ?? table[lowerIdx]
    humanAge = Math.round(lower + frac * (upper - lower))
  }

  // Stade de vie et contexte
  if (dogYears < 1) {
    return { humanAge, lifeStage: 'Chiot', stagePill: 'chiot', context: 'Il est encore en croissance : sa ration se calcule avec un besoin presque doublé et des croquettes adaptées à son gabarit adulte.' }
  }
  if (dogYears < 3) {
    return { humanAge, lifeStage: 'Jeune adulte', stagePill: 'jeune', context: 'Sa croissance est terminée ou presque (jusqu\'à 18 à 24 mois pour les très grandes races). Il passe à une ration d\'adulte.' }
  }
  if (size === 'petit' || size === 'moyen') {
    if (dogYears < 8) return { humanAge, lifeStage: 'Adulte', stagePill: 'adulte', context: 'Les petits et moyens gabarits vieillissent plus lentement que les grands : il a encore plusieurs années avant de passer senior.' }
    if (dogYears < 12) return { humanAge, lifeStage: 'Senior', stagePill: 'senior', context: 'Il entre dans sa phase senior. Prévois une visite chez le vétérinaire chaque année, et revois sa ration si son activité baisse.' }
    return { humanAge, lifeStage: 'Très senior', stagePill: 'tres-senior', context: 'Les petites races dépassent souvent 15 ans. Surveille son poids et sa masse musculaire, qui fond plus vite à cet âge.' }
  }
  if (dogYears < 7) return { humanAge, lifeStage: 'Adulte', stagePill: 'adulte', context: 'Les grands gabarits vieillissent plus vite que les petits : la phase senior arrive vers 7 ans.' }
  if (dogYears < 10) return { humanAge, lifeStage: 'Senior', stagePill: 'senior', context: 'Il entre dans sa phase senior. Parle de sa ration avec ton vétérinaire au prochain rendez-vous annuel.' }
  return { humanAge, lifeStage: 'Très senior', stagePill: 'tres-senior', context: 'Peu de chiens de grande taille atteignent cet âge. Surveille son poids, ses articulations et sa masse musculaire.' }
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
}

/** Hypothèses de prix et de densité par type d'aliment (affichées dans « Comment on calcule »). */
export const FOOD_TYPES: Array<Omit<CostComparison, 'monthlyBudget' | 'annualBudget'>> = [
  { type: 'croquettes-standard', label: 'Croquettes de grande surface', pricePerKg: 4.5, kcalPer100g: 340 },
  { type: 'croquettes-premium', label: 'Croquettes premium', pricePerKg: 12.0, kcalPer100g: 375 },
  // moyenne des abonnements repas frais (Elmut ~6 €/kg, Dog Chef ~8 €/kg)
  { type: 'repas-frais', label: 'Repas frais livrés', pricePerKg: 7.0, kcalPer100g: 145 },
  // ~70 % croquettes premium + 30 % frais, prix et densité intermédiaires
  { type: 'mixte', label: 'Mix croquettes premium et repas frais', pricePerKg: 7.0, kcalPer100g: 200 },
]

export function buildCostComparisons(dailyCalories: number): CostComparison[] {
  return FOOD_TYPES.map((t) => {
    const dailyGrams = (dailyCalories / t.kcalPer100g) * 100
    const dailyCost = (dailyGrams / 1000) * t.pricePerKg
    const monthlyBudget = Math.round(dailyCost * 30)
    return { ...t, monthlyBudget, annualBudget: monthlyBudget * 12 }
  })
}
