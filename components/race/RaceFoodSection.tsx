import Link from 'next/link'
import type { Breed } from '@/data/breeds'
import type { FoodVerdict } from '@/lib/food-verdicts'

// @cdc seo-geo §6.4 niveau 2 — « Que peut manger un [race] et que doit-il éviter ? » :
// la remarque propre à la race, puis les aliments classés, chacun renvoyant vers sa page générique.

export const RACE_FOOD_ID = 'que-peut-manger'

const GROUPS: { verdict: FoodVerdict['verdict']; title: string; max: number; tone: string; mark: string }[] = [
  { verdict: 'danger', title: 'Dangereux pour lui', max: 18, tone: 'bg-rose-bg', mark: '✕' },
  { verdict: 'moderation', title: 'Avec modération', max: 10, tone: 'bg-amber-bg', mark: '!' },
  { verdict: 'oui', title: 'Autorisés', max: 14, tone: 'bg-green-bg', mark: '✓' },
]

export function raceFoodHeading(breed: Breed): string {
  return `Que peut manger un ${breed.name} et que doit-il éviter ?`
}

export function RaceFoodSection({ breed, foods }: { breed: Breed; foods: FoodVerdict[] }) {
  return (
    <section aria-labelledby={RACE_FOOD_ID} className="v2 mt-12 flex flex-col gap-4">
      <h2 id={RACE_FOOD_ID} className="m-0 scroll-mt-24 font-display text-2xl font-black text-ink">
        {raceFoodHeading(breed)}
      </h2>
      {breed.foodNote ? <p className="m-0 leading-relaxed text-ink">{breed.foodNote}</p> : null}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {GROUPS.map((g) => {
          const items = foods.filter((f) => f.verdict === g.verdict).slice(0, g.max)
          if (items.length === 0) return null
          return (
            <div key={g.verdict} className={`flex flex-col gap-2 rounded-box p-4 ${g.tone}`}>
              <h3 className="m-0 text-sm font-semibold uppercase tracking-wider text-ink">
                <span aria-hidden="true">{g.mark} </span>
                {g.title}
              </h3>
              <ul role="list" className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                {items.map((f) => (
                  <li key={f.href}>
                    <Link href={f.href} className="inline-block rounded-pill bg-paper px-3 py-1 text-sm text-ink no-underline hover:underline">
                      {f.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
      <p className="m-0 text-sm text-ink-2">
        {"Chaque aliment renvoie vers son guide : quantités par gabarit, préparation et que faire en cas d'ingestion."}
      </p>
    </section>
  )
}
