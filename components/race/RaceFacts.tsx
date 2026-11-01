import Link from 'next/link'
import type { Breed } from '@/data/breeds'

// @cdc 04-pages — fiche chiffrée d'une race (prototype V2) : 4 cartes + encart « Tu as un… ? ».
function range([min, max]: [number, number], unit: string): string | null {
  if (!min && !max) return null
  return min === max ? `${min} ${unit}` : `${min}–${max} ${unit}`
}

export function RaceFacts({ breed }: { breed: Breed }) {
  const facts = [
    { label: 'Poids adulte', value: range(breed.weightKg, 'kg') },
    { label: 'Espérance de vie', value: range(breed.lifeYears, 'ans') },
    { label: 'Activité', value: breed.activity },
    { label: 'À surveiller', value: breed.watch, accent: true },
  ].filter((f): f is { label: string; value: string; accent?: boolean } => Boolean(f.value))

  return (
    <div className="v2 flex flex-col gap-3">
      <dl className="m-0 grid grid-cols-2 gap-2.5">
        {facts.map((f) => (
          <div key={f.label} className="flex flex-col gap-0.5 rounded-box border border-line bg-paper p-3.5">
            <dt className="text-xs font-semibold uppercase tracking-wider text-ink-2">{f.label}</dt>
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
