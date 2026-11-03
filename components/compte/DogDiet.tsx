import Link from 'next/link'
import type { Dog } from '@/db/schema'
import type { FoodSuggestion } from '@/lib/server/food-suggest'
import { linkInline } from './espace/ui'

// @cdc profil chien — ce qu'il mange (lien vers la fiche du produit et sa note quand une fiche
// est liée) et ses allergies en pastilles. Sur la carte (compact) : rien quand le profil est vide.

interface DogDietProps {
  dog: Pick<Dog, 'id' | 'food' | 'allergies'>
  link: FoodSuggestion | null
  compact?: boolean
}

function AllergyPills({ allergies, label }: { allergies: string[]; label: string }) {
  return (
    <ul role="list" aria-label={label} className="m-0 flex list-none flex-wrap gap-1.5 p-0">
      {allergies.map((a) => (
        <li key={a} className="rounded-pill bg-rose-bg px-2.5 py-0.5 text-sm font-semibold text-rose-ink">
          {a}
        </li>
      ))}
    </ul>
  )
}

export function DogDiet({ dog, link, compact = false }: DogDietProps) {
  if (!dog.food && dog.allergies.length === 0) {
    if (compact) return null
    return (
      <p className="m-0 text-base text-ink-2">
        Rien de noté pour l&apos;instant.{' '}
        <Link href={`/compte/chien/${dog.id}/modifier`} className={linkInline}>
          Ajouter ses croquettes et ses allergies
        </Link>
        , reprises par sa fiche de garde et signalées par le scanner.
      </p>
    )
  }
  const label = compact ? 'text-xs font-semibold text-ink-2' : 'text-sm font-semibold text-ink-2'
  return (
    <dl className="m-0 flex flex-col gap-3">
      {dog.food ? (
        <div className="flex min-w-0 flex-col gap-0.5">
          <dt className={label}>Ce qu&apos;il mange</dt>
          <dd className="m-0 flex flex-wrap items-baseline gap-x-2 text-base text-ink">
            {link ? (
              <Link href={`/croquettes/${link.slug}`} className={linkInline}>
                {dog.food}
              </Link>
            ) : (
              <span>{dog.food}</span>
            )}
            {link && link.score !== null ? <span className="whitespace-nowrap rounded-pill bg-cream-2 px-2 py-0.5 text-sm font-semibold text-ink">{`Note ${link.score}/100`}</span> : null}
          </dd>
        </div>
      ) : null}
      {dog.allergies.length > 0 ? (
        <div className="flex min-w-0 flex-col gap-1">
          <dt className={label}>Allergies</dt>
          <dd className="m-0">
            <AllergyPills allergies={dog.allergies} label="Allergies" />
          </dd>
        </div>
      ) : null}
    </dl>
  )
}
