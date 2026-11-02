import Link from 'next/link'
import type { ComponentType } from 'react'
import type { Breed } from '@/data/breeds'
import { breedMidWeight } from './breed-size'
import { IconAlert, IconChevron, IconHeart, IconPaw, IconScale, type IconProps } from '@/components/icons'

// @cdc 04-pages — fiche d'identité d'une race (audit design-CRO, §3 Page race) : une bande encre,
// les 4 repères en ligne (retour à la ligne sur mobile), puis l'outil ration pré-rempli avec le
// milieu de la fourchette de poids adulte.
function range([min, max]: [number, number], unit: string): string | null {
  if (!min && !max) return null
  return min === max ? `${min} ${unit}` : `${min}–${max} ${unit}`
}

interface Fact {
  label: string
  value: string
  icon: ComponentType<IconProps>
}

export function RaceFacts({ breed }: { breed: Breed }) {
  const facts: { label: string; value: string | null | undefined; icon: ComponentType<IconProps> }[] = [
    { label: 'Poids adulte', value: range(breed.weightKg, 'kg'), icon: IconScale },
    { label: 'Espérance de vie', value: range(breed.lifeYears, 'ans'), icon: IconHeart },
    { label: 'Activité', value: breed.activity, icon: IconPaw },
    { label: 'À surveiller', value: breed.watch, icon: IconAlert },
  ]
  const shown = facts.filter((f): f is Fact => Boolean(f.value))
  const mid = breedMidWeight(breed)
  const href = mid ? `/outils/ration?poids=${mid}` : '/outils/ration'

  return (
    <div className="v2 flex flex-col gap-4">
      <dl aria-label={`Fiche d'identité, ${breed.name}`} className="m-0 flex flex-wrap gap-x-6 gap-y-3 rounded-box bg-ink px-4 py-3.5 text-cream">
        {shown.map((f) => (
          <div key={f.label} className="flex min-w-0 items-center gap-2">
            <f.icon className="size-5 text-cream" />
            <dt className="text-sm text-cream/75">{f.label}</dt>
            <dd className="m-0 text-[15px] font-semibold">{f.value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link
          href={href}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-control bg-orange px-4 text-[15px] font-semibold text-ink no-underline hover:underline"
        >
          {mid ? `Calculer sa ration (≈ ${mid.toLocaleString('fr-FR')} kg)` : 'Calculer sa ration'}
          <IconChevron className="size-4" />
        </Link>
        <span className="text-sm text-ink-2">{`Tu as un ${breed.name} ? Ses grammes par jour, à ajuster à son poids réel.`}</span>
      </div>
    </div>
  )
}
