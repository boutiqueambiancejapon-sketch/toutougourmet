import type { Dog } from '@/db/schema'
import { ACTIVITY_LABELS, breedName, formatAge, formatKg } from '@/lib/dog-profile'

// @cdc lot 4 — résumé d'un chien en une ligne (chapô de sa fiche). La carte de l'espace compte
// est components/compte/espace/DogSummaryCard.tsx.

export function dogFacts(d: Dog): string[] {
  return [
    breedName(d.breedSlug),
    formatAge(d.birthDate, d.birthDateEstimated),
    d.weightKg ? formatKg(d.weightKg) : null,
    `activité ${ACTIVITY_LABELS[d.activity].toLowerCase()}`,
    d.sterilized ? 'stérilisé' : null,
  ].filter((f): f is string => Boolean(f))
}
