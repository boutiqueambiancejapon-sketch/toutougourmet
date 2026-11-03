import Link from 'next/link'
import type { Dog, WeightEntry } from '@/db/schema'
import { IconDog, IconPlus } from '@/components/icons'
import { rationHref } from '@/components/outils/ration-params'
import { computeRation, KIBBLE_KCAL_100G } from '@/lib/calculators'
import { ageGroupOf, breedName, formatAge, formatKg } from '@/lib/dog-profile'
import { shortDateFr } from './dates'
import { btnOutline, linkAction } from './ui'

// @cdc compte — carte d'un chien dans l'espace compte : race, âge, dernier poids, ration du jour
// (même calcul que /outils/ration, croquettes à 360 kcal pour 100 g), lien vers sa fiche.

interface DogSummaryCardProps {
  dog: Dog
  last?: WeightEntry
  heading?: 'h2' | 'h3'
}

function Fact({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="flex min-w-0 flex-col rounded-box bg-cream-2 p-3">
      <dt className="text-xs font-semibold text-ink-2">{label}</dt>
      <dd className="m-0 whitespace-nowrap font-display text-xl font-black leading-tight text-ink">{value}</dd>
      <dd className="m-0 text-xs text-ink-2">{detail}</dd>
    </div>
  )
}

export function DogSummaryCard({ dog, last, heading: H = 'h3' }: DogSummaryCardProps) {
  const ageGroup = ageGroupOf(dog.birthDate) ?? 'adulte'
  const weight = last?.weightKg ?? dog.weightKg
  const ration = weight ? computeRation({ animal: 'chien', weightKg: weight, ageGroup, activityLevel: dog.activity, sterilized: dog.sterilized }) : null
  const facts = [breedName(dog.breedSlug) ?? 'Race non précisée', formatAge(dog.birthDate, dog.birthDateEstimated)].filter(Boolean).join(' · ')
  return (
    <article className="flex h-full flex-col gap-4 rounded-card border border-line bg-paper p-4 md:p-5">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-pill bg-amber text-ink">
          <IconDog className="size-6" />
        </span>
        <div className="flex min-w-0 flex-col">
          <H className="m-0 truncate font-display text-xl font-black leading-tight text-ink">{dog.name}</H>
          <p className="m-0 text-sm text-ink-2">{facts}</p>
        </div>
      </div>
      <dl className="m-0 grid grid-cols-1 gap-2 xs:grid-cols-2">
        <Fact label="Dernier poids" value={weight ? formatKg(weight) : 'À peser'} detail={last ? `le ${shortDateFr(last.date)}` : 'aucune pesée'} />
        <Fact
          label="Ration du jour"
          value={ration ? `${ration.gKibble} g` : '—'}
          detail={ration ? `croquettes à ${KIBBLE_KCAL_100G} kcal/100 g` : 'il faut son poids'}
        />
      </dl>
      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link href={`/compte/chien/${dog.id}`} className={btnOutline}>
          Ouvrir sa fiche
          <span className="sr-only">{` (${dog.name})`}</span>
        </Link>
        {weight ? (
          <Link
            href={rationHref({ weightKg: weight, ageGroup, activityLevel: dog.activity, sterilized: dog.sterilized, food: 'croquettes' })}
            className={linkAction}
          >
            Détailler sa ration
          </Link>
        ) : null}
      </div>
    </article>
  )
}

export function AddDogCard({ first }: { first: boolean }) {
  return (
    <Link
      href="/compte/chien/nouveau"
      className="flex h-full min-h-32 flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-line-2 bg-cream p-4 text-center font-semibold text-ink no-underline hover:border-ink"
    >
      <IconPlus className="size-6" />
      {first ? 'Ajouter mon chien' : 'Ajouter un autre chien'}
    </Link>
  )
}
