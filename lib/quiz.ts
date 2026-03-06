export type QuizAnswers = Record<string, string | string[]>
export type BrandKey = 'franklin' | 'elmut' | 'pettyWell' | 'dogChef'
export type BrandScores = Record<BrandKey, number>

export const brandSlugMap: Record<BrandKey, string> = {
  franklin: 'franklin',
  elmut: 'elmut',
  pettyWell: 'petty-well',
  dogChef: 'dog-chef',
}

export function computeScores(answers: QuizAnswers): BrandScores {
  const scores: BrandScores = { franklin: 0, elmut: 0, pettyWell: 0, dogChef: 0 }

  // Format
  if (answers.format === 'frais') { scores.elmut += 3; scores.dogChef += 3 }
  if (answers.format === 'croquettes') { scores.franklin += 3; scores.pettyWell += 3 }
  if (answers.format === 'mixte') { scores.dogChef += 2; scores.elmut += 1; scores.franklin += 1 }

  // Chat → Dog Chef non disponible
  if (answers.animal === 'chat') { scores.dogChef -= 10 }

  // Problèmes
  const problemes = answers.probleme as string[]
  if (problemes?.includes('digestion')) { scores.elmut += 2; scores.dogChef += 2 }
  if (problemes?.includes('allergie')) { scores.franklin += 2; scores.pettyWell += 2 }
  if (problemes?.includes('poil')) { scores.franklin += 1; scores.pettyWell += 1 }
  if (problemes?.includes('poids')) { scores.elmut += 1; scores.dogChef += 1 }

  // Budget
  if (answers.budget === 'petit' || answers.budget === 'moyen') {
    scores.franklin += 2; scores.pettyWell += 2
  }
  if (answers.budget === 'grand' || answers.budget === 'premium') {
    scores.elmut += 2; scores.dogChef += 2
  }

  // Age
  if (answers.age === 'senior') { scores.elmut += 1; scores.dogChef += 1 }
  if (answers.age === 'chiot') { scores.franklin += 1; scores.pettyWell += 1 }

  return scores
}

export function getSortedBrands(scores: BrandScores): BrandKey[] {
  return (Object.keys(scores) as BrandKey[]).sort((a, b) => scores[b] - scores[a])
}

export const brandLabels: Record<BrandKey, string> = {
  franklin: 'Franklin Pet Food',
  elmut: 'Elmut',
  pettyWell: 'Petty Well',
  dogChef: 'Dog Chef',
}
