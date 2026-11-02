import { withDe } from '@/lib/food-verdicts'
import { FoodPortionForm } from './FoodPortionForm'

// @cdc 04-pages — mini-calculateur des articles « peut-il manger » (audit design-cro §3) :
// titre et phrase d'explication rendus côté serveur (lisibles sans JS), champ poids en îlot client.

interface FoodPortionCalcProps {
  food: string
  kcal100: number
  moderation: boolean
}

export function FoodPortionCalc({ food, kcal100, moderation }: FoodPortionCalcProps) {
  const ofFood = withDe(food)
  return (
    <section aria-labelledby="combien" className="v2 my-7 flex flex-col gap-3 rounded-card border border-line bg-paper p-5">
      <h2 id="combien" className="m-0 scroll-mt-24 font-display text-xl font-black leading-tight text-ink">
        Combien {ofFood} pour ton chien ?
      </h2>
      <p className="m-0 text-[15px] leading-relaxed text-ink-2">
        Le calcul part de son poids, réserve aux friandises 10 % de ses calories du jour et convertit ce
        budget en grammes ({kcal100} kcal pour 100 g{moderation ? ', plafond divisé par deux' : ''}).
      </p>
      <FoodPortionForm ofFood={ofFood} kcal100={kcal100} moderation={moderation} />
    </section>
  )
}
