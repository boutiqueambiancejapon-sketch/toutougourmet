// @cdc outils — calcul du test « Quelle marque pour ton chien ? ». Les points attribués à
// chaque réponse sont un choix de la rédaction ; les raisons affichées reprennent les faits
// de data/brands.ts (prix, format, boosters) pour que chaque conseil soit vérifiable.

export type QuizAnswers = Record<string, string | string[]>
export type BrandKey = 'franklin' | 'elmut' | 'ultraPremiumDirect' | 'dogChef'
export type BrandScores = Record<BrandKey, number>

export const brandSlugMap: Record<BrandKey, string> = {
  franklin: 'franklin',
  elmut: 'elmut',
  ultraPremiumDirect: 'ultra-premium-direct',
  dogChef: 'dog-chef',
}

export const brandLabels: Record<BrandKey, string> = {
  franklin: 'Franklin Pet Food',
  elmut: 'Elmut',
  ultraPremiumDirect: 'Ultra Premium Direct',
  dogChef: 'Dog Chef',
}

function problems(answers: QuizAnswers): string[] {
  const p = answers.probleme
  return Array.isArray(p) ? p : []
}

export function computeScores(answers: QuizAnswers): BrandScores {
  const scores: BrandScores = { franklin: 0, elmut: 0, ultraPremiumDirect: 0, dogChef: 0 }

  // Format
  if (answers.format === 'frais') { scores.elmut += 3; scores.dogChef += 3 }
  if (answers.format === 'croquettes') { scores.franklin += 3; scores.ultraPremiumDirect += 3 }
  if (answers.format === 'mixte') { scores.dogChef += 3; scores.elmut += 1; scores.franklin += 1 }
  if (answers.format === 'aucune') { scores.dogChef += 1 }

  // Problèmes
  const p = problems(answers)
  if (p.includes('digestion')) { scores.elmut += 2; scores.dogChef += 2; scores.ultraPremiumDirect += 1 }
  if (p.includes('allergie')) { scores.franklin += 2 }
  if (p.includes('poil')) { scores.franklin += 1 }
  if (p.includes('poids')) { scores.elmut += 1; scores.dogChef += 1 }

  // Budget
  if (answers.budget === 'petit' || answers.budget === 'moyen') {
    scores.franklin += 2; scores.ultraPremiumDirect += 2
  }
  if (answers.budget === 'grand' || answers.budget === 'premium') {
    scores.elmut += 2; scores.dogChef += 2
  }

  // Âge
  if (answers.age === 'senior') { scores.elmut += 1; scores.dogChef += 1 }
  if (answers.age === 'adulte') { scores.dogChef += 1 }
  if (answers.age === 'chiot') { scores.franklin += 1 }

  return scores
}

export function getSortedBrands(scores: BrandScores): BrandKey[] {
  return (Object.keys(scores) as BrandKey[]).sort((a, b) => scores[b] - scores[a])
}

/** La première marque devance-t-elle nettement la deuxième ? Sinon, pas de lien partenaire. */
export function hasClearWinner(scores: BrandScores, sorted: BrandKey[]): boolean {
  return sorted.length > 1 && scores[sorted[0]] > scores[sorted[1]]
}

/** Pourquoi cette marque, à partir des réponses (trois raisons au plus). */
export function brandReasons(brand: BrandKey, answers: QuizAnswers): string[] {
  const p = problems(answers)
  const lowBudget = answers.budget === 'petit' || answers.budget === 'moyen'
  const highBudget = answers.budget === 'grand' || answers.budget === 'premium'
  const r: string[] = []
  switch (brand) {
    case 'franklin':
      if (answers.format === 'croquettes') r.push('Tu préfères les croquettes\u00a0: c’est son cœur de gamme, avec des pâtées en complément.')
      if (p.includes('allergie')) r.push('Une seule source de viande par recette\u00a0: plus simple pour repérer ce qui ne lui convient pas.')
      if (lowBudget) r.push('Environ 5,20 à 9 € le kilo selon la recette et le sac.')
      break
    case 'ultraPremiumDirect':
      if (answers.format === 'croquettes') r.push('Tu préfères les croquettes\u00a0: la marque les vend en direct, sans animalerie.')
      if (p.includes('digestion')) r.push('Des prébiotiques (FOS et MOS) sont ajoutés aux recettes.')
      if (lowBudget) r.push('Environ 3 à 5 € le kilo\u00a0: le prix au kilo le plus bas de notre sélection.')
      break
    case 'elmut':
      if (answers.format === 'frais') r.push('Tu veux des repas frais\u00a0: Elmut les cuit sous vide à 90 °C et les livre au frais.')
      if (p.includes('digestion')) r.push('Sans conservateur ni colorant artificiel, cuisson douce.')
      if (p.includes('poids')) r.push('La ration est calculée sur le profil de ton chien.')
      if (highBudget) r.push('Environ 55 à 75 € par mois pour un chien de moins de 10 kg.')
      break
    case 'dogChef':
      if (answers.format === 'frais') r.push('Tu veux des repas frais\u00a0: Dog Chef les livre en camionnette réfrigérée, livraison comprise.')
      if (answers.format === 'mixte') r.push('Dog Chef propose une formule mixte, repas frais et croquettes.')
      if (p.includes('poids')) r.push('La ration est recalculée quand son poids change.')
      if (p.includes('digestion')) r.push('Un booster «\u00a0Transit\u00a0» peut s\u2019ajouter à ses repas.')
      if (answers.age === 'senior') r.push('Un booster «\u00a0Senior\u00a0» peut s\u2019ajouter à ses repas.')
      if (answers.age === 'chiot') r.push('Un booster «\u00a0Puppy\u00a0» existe pour les chiots.')
      if (highBudget) r.push('Environ 1,50 à 5,50 € par jour selon son gabarit.')
      break
  }
  return r.slice(0, 3)
}

/** Poids saisi (en kg), ou undefined s'il est absent ou hors des bornes du calcul de ration. */
export function quizWeight(answers: QuizAnswers): number | undefined {
  const raw = answers.poids
  if (typeof raw !== 'string') return undefined
  const kg = parseFloat(raw.replace(',', '.'))
  return Number.isFinite(kg) && kg >= 0.5 && kg <= 100 ? kg : undefined
}
