import { withDe } from '@/lib/food-verdicts'
import { FoodPortionForm } from './FoodPortionForm'
import type { SizeBand } from '@/lib/size-bands'

// @cdc 04-pages — mini-calculateur des articles « peut-il manger » (audit design-cro §3) :
// titre et phrase d'explication rendus côté serveur (lisibles sans JS), champ poids en îlot client.

interface FoodPortionCalcProps {
  food: string
  kcal100: number
  moderation: boolean
  bands: SizeBand[]
}

export function FoodPortionCalc({ food, kcal100, moderation, bands }: FoodPortionCalcProps) {
  const ofFood = withDe(food)
  return (
    <section aria-labelledby="combien" className="v2 my-7 flex flex-col gap-3 rounded-card border border-line bg-paper p-5">
      <h2 id="combien" className="m-0 scroll-mt-24 font-display text-xl font-black leading-tight text-ink">
        Combien {ofFood} pour ton chien ?
      </h2>
      <p className="m-0 text-[15px] leading-relaxed text-ink-2">
        {bands.length > 0
          ? `La portion vient du tableau par gabarit de ce guide. Le plafond de 10 % des calories du jour, toutes friandises confondues, sert de garde-fou (${kcal100} kcal pour 100 g).`
          : `Le calcul donne la limite à ne pas dépasser : 10 % de ses calories du jour, convertis en grammes (${kcal100} kcal pour 100 g). La portion courante est plus basse.`}
      </p>
      <FoodPortionForm ofFood={ofFood} kcal100={kcal100} moderation={moderation} bands={bands} />
    </section>
  )
}
