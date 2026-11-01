import Link from 'next/link'
import type { ComponentType } from 'react'
import type { Breed } from '@/data/breeds'
import { IconAlert, IconHeart, IconPaw, IconScale, type IconProps } from '@/components/icons'

// @cdc 04-pages — fiche chiffrée d'une race (prototype V2) : 4 cartes + encart « Tu as un… ? ».
function range([min, max]: [number, number], unit: string): string | null {
  if (!min && !max) return null
  return min === max ? `${min} ${unit}` : `${min}–${max} ${unit}`
}

interface Fact {
  label: string
  value: string
  icon: ComponentType<IconProps>
  accent?: boolean
}

export function RaceFacts({ breed }: { breed: Breed }) {
  const facts: { label: string; value: string | null | undefined; icon: ComponentType<IconProps>; accent?: boolean }[] = [
    { label: 'Poids adulte', value: range(breed.weightKg, 'kg'), icon: IconScale },
    { label: 'Espérance de vie', value: range(breed.lifeYears, 'ans'), icon: IconHeart },
    { label: 'Activité', value: breed.activity, icon: IconPaw },
    { label: 'À surveiller', value: breed.watch, icon: IconAlert, accent: true },
  ]
  const shown = facts.filter((f): f is Fact => Boolean(f.value))

  return (
    <div className="v2 flex flex-col gap-3">
      <dl className="m-0 grid grid-cols-2 gap-2.5">
        {shown.map((f) => (
          <div key={f.label} className="flex flex-col gap-0.5 rounded-box border border-line bg-paper p-3.5">
            <dt className="flex items-center gap-1.5 text-[13px] font-semibold text-ink-2">
              <f.icon className="size-[18px] text-ink" />
              {f.label}
            </dt>
            <dd className={`m-0 font-display text-xl font-black leading-tight ${f.accent ? 'text-orange-ink' : 'text-ink'}`}>{f.value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-col gap-2 rounded-card bg-amber-bg p-4">
        <p className="m-0 font-semibold text-ink">Tu as un {breed.name} ?</p>
        <p className="m-0 text-sm text-ink-2">Sa ration en grammes par jour, calculée sur son poids.</p>
        <Link href="/outils/ration" className="inline-flex min-h-11 items-center self-start rounded-control bg-orange px-4 text-[15px] font-semibold text-ink no-underline">
          Calculer sa ration
        </Link>
      </div>
    </div>
  )
}
