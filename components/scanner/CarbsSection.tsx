import { Formula } from '@/components/outils/ToolPage'
import { CarbsCalculator } from './CarbsCalculator'

// @cdc lot 6 — « Comment calculer le taux de glucides des croquettes ? » sur /scanner : réponse
// directe, formule et exemple chiffré dans le HTML servi, calculateur client en dessous.

export function CarbsSection() {
  return (
    <section aria-labelledby="glucides" className="flex flex-col gap-4">
      <h2 id="glucides" className="m-0 font-display text-2xl font-black text-ink">
        Comment calculer le taux de glucides des croquettes ?
      </h2>
      <div className="flex flex-col gap-3 text-base leading-relaxed text-ink-2 [&_p]:m-0">
        <p>
          Les glucides ne figurent pas sur l&apos;étiquette : le règlement (CE) n° 767/2009 ne les rend pas obligatoires. On les
          obtient par différence, en retirant de 100 les constituants analytiques déclarés, puis on ramène le résultat sur
          matière sèche (le produit sans son eau) pour comparer deux aliments.
        </p>
        <Formula>glucides = 100 − protéines − matières grasses − cendres − cellulose − humidité</Formula>
        <Formula>glucides sur matière sèche = glucides × 100 ÷ (100 − humidité)</Formula>
        <p>
          Exemple : 26 % de protéines, 15 % de matières grasses, 7 % de cendres, 3 % de cellulose et 10 % d&apos;humidité donnent 39 %
          de glucides sur le sac, soit 43,3 % sur matière sèche. Cette croquette prend 6 points sur 15 au critère des glucides de la
          note.
        </p>
      </div>
      <CarbsCalculator />
    </section>
  )
}
