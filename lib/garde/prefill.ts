import type { Dog, SitterSheet } from '@/db/schema'
import { ageGroupOf, breedName } from '@/lib/dog-profile'
import { EMPTY_DRAFT, type SheetDraft } from './draft'
import { defaultGrams } from './sheet'

// @cdc fiche de garde — formulaire pré-rempli dans l'espace compte : le profil du chien (nom,
// race, poids, âge, activité, stérilisation, donc la ration), puis la dernière fiche du chien
// (friandises, médicaments, habitudes, numéros). Croquettes et allergies : celles du profil
// d'abord, sinon celles de la dernière fiche (la fiche peut ensuite les garder dans le profil).

export function draftForDog(dog: Dog, last: SitterSheet | null): SheetDraft {
  const fromProfile: SheetDraft = {
    ...EMPTY_DRAFT,
    dogName: dog.name,
    breed: breedName(dog.breedSlug) ?? '',
    weightKg: dog.weightKg ? String(dog.weightKg).replace('.', ',') : '',
    ageGroup: ageGroupOf(dog.birthDate) ?? 'adulte',
    activity: dog.activity,
    sterilized: dog.sterilized,
    food: dog.food ?? '',
    allergies: dog.allergies.join(', '),
  }
  if (!last) return fromProfile
  const p = last.data
  // Grammes tapés à la main la dernière fois (différents du calcul) : on les garde.
  const custom = p.gramsPerDay !== defaultGrams(p)
  return {
    ...fromProfile,
    breed: fromProfile.breed || p.breed,
    weightKg: fromProfile.weightKg || String(p.weightKg).replace('.', ','),
    gramsPerDay: custom ? String(p.gramsPerDay) : '',
    meals: p.meals,
    mealTimes: p.mealTimes,
    food: fromProfile.food || p.food,
    treats: p.treats,
    allergies: fromProfile.allergies || p.allergies,
    meds: p.meds,
    notes: p.notes,
    ownerPhone: p.ownerPhone,
    vetName: p.vetName,
    vetPhone: p.vetPhone,
    country: p.country,
  }
}
