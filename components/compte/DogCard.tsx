import Link from 'next/link'
import type { Dog } from '@/db/schema'
import { ACTIVITY_LABELS, breedName, formatAge, formatKg } from '@/lib/dog-profile'

// @cdc lot 4 — résumé d'un chien dans le tableau de bord du compte (rendu serveur).

export function dogFacts(d: Dog): string[] {
  return [
    breedName(d.breedSlug),
    formatAge(d.birthDate, d.birthDateEstimated),
    d.weightKg ? formatKg(d.weightKg) : null,
    `activité ${ACTIVITY_LABELS[d.activity].toLowerCase()}`,
    d.sterilized ? 'stérilisé' : null,
  ].filter((f): f is string => Boolean(f))
}

export function DogCard({ dog }: { dog: Dog }) {
  return (
    <li className="m-0">
      <Link
        href={`/compte/chien/${dog.id}`}
        className="flex flex-col gap-1 rounded-card border border-line bg-paper p-4 text-ink no-underline hover:border-ink"
      >
        <span className="font-display text-xl font-black leading-tight">{dog.name}</span>
        <span className="text-[15px] leading-relaxed text-ink-2">{dogFacts(dog).join(' · ')}</span>
      </Link>
    </li>
  )
}
