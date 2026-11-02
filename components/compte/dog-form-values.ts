import type { Dog } from '@/db/schema'
import { BREEDS } from '@/data/breeds'
import { ageInMonths } from '@/lib/dog-profile'
import type { DogFormValues } from './DogForm'

// @cdc lot 4 — valeurs initiales du formulaire chien (côté serveur) et liste des races allégée
// (slug + nom) transmise au composant client.

export const BREED_OPTIONS = [...BREEDS].sort((a, b) => a.name.localeCompare(b.name, 'fr')).map((b) => ({ slug: b.slug, name: b.name }))

export const EMPTY_DOG: DogFormValues = {
  name: '',
  breedSlug: '',
  ageMode: 'naissance',
  birthDate: '',
  ageYears: '',
  weightKg: '',
  activity: 'normal',
  sterilized: 'non',
}

export function dogToFormValues(d: Dog): DogFormValues {
  const estimated = d.birthDateEstimated && d.birthDate
  return {
    name: d.name,
    breedSlug: d.breedSlug ?? '',
    ageMode: estimated ? 'age' : 'naissance',
    birthDate: estimated ? '' : (d.birthDate ?? ''),
    ageYears: estimated && d.birthDate ? String(Math.round((ageInMonths(d.birthDate) / 12) * 2) / 2) : '',
    weightKg: d.weightKg ? String(d.weightKg) : '',
    activity: d.activity,
    sterilized: d.sterilized ? 'oui' : 'non',
  }
}
