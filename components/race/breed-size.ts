import type { Breed } from '@/data/breeds'

// Gabarit d'une race tiré du milieu de sa fourchette de poids adulte (data/breeds.ts).
// Sert au filtre du hub race et au lien « Calculer sa ration » pré-rempli des pages race.
export type BreedSize = 'petit' | 'moyen' | 'grand'

export const BREED_SIZES: readonly (readonly [BreedSize, string, string])[] = [
  ['petit', 'Petit', 'moins de 10 kg'],
  ['moyen', 'Moyen', '10 à 25 kg'],
  ['grand', 'Grand', 'plus de 25 kg'],
]

/** Milieu de la fourchette de poids adulte, arrondi au kilo (au demi-kilo sous 10 kg). */
export function breedMidWeight({ weightKg: [min, max] }: Pick<Breed, 'weightKg'>): number | null {
  if (!min || !max) return null
  const mid = (min + max) / 2
  return mid < 10 ? Math.round(mid * 2) / 2 : Math.round(mid)
}

export function breedSize(breed: Pick<Breed, 'weightKg'>): BreedSize | null {
  const [min, max] = breed.weightKg
  if (!min || !max) return null
  const mid = (min + max) / 2
  return mid < 10 ? 'petit' : mid <= 25 ? 'moyen' : 'grand'
}
