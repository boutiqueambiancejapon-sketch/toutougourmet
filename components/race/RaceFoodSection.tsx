import { VerdictBoard } from '@/components/article/VerdictBoard'
import type { Breed } from '@/data/breeds'
import type { FoodVerdict } from '@/lib/food-verdicts'

// @cdc seo-geo §6.4 niveau 2 — « Que peut manger un [race] et que doit-il éviter ? » :
// la remarque propre à la race, puis les aliments classés, chacun renvoyant vers sa page générique.

export const RACE_FOOD_ID = 'que-peut-manger'

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
      <VerdictBoard foods={foods} />
      <p className="m-0 text-sm text-ink-2">
        Chaque aliment mène à son guide, avec les quantités par gabarit.
      </p>
    </section>
  )
}
