import { FREE_MONTHLY_SCANS, PREMIUM_MONTHLY_SCANS } from '@/lib/scanner/config'

// @cdc premium — tableau compte gratuit / Premium de /premium (rendu serveur).

const ROWS: [string, string, string][] = [
  ['Analyses par photo', `${FREE_MONTHLY_SCANS} par mois`, `${PREMIUM_MONTHLY_SCANS} par mois`],
  ["Code-barres d'un produit déjà connu", 'Non décompté', 'Non décompté'],
  ['Courbe de poids', 'Oui', 'Oui'],
  ['Alertes de prise ou de perte de poids', 'Non', 'Oui'],
  ['Historique des scans', '20 dernières analyses', 'Complet'],
  ['Alternative à une croquette notée sous 55', 'Non', 'Oui'],
  ['Offres partenaires selon son profil', 'Oui', 'Oui'],
  ['Outils pré-remplis avec son profil', 'Oui', 'Oui'],
]

export function PremiumCompare() {
  return (
    <section aria-labelledby="comparer" className="flex flex-col gap-3">
      <h2 id="comparer" className="m-0 font-display text-2xl font-black text-ink">Quelle différence avec le compte gratuit ?</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-[15px]">
          <thead>
            <tr>
              <th scope="col" className="border-b-2 border-ink py-2 pr-3 font-semibold text-ink">
                <span className="sr-only">Fonction</span>
              </th>
              <th scope="col" className="border-b-2 border-ink px-2 py-2 font-semibold text-ink">Compte gratuit</th>
              <th scope="col" className="border-b-2 border-ink px-2 py-2 font-semibold text-ink">Premium</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([label, free, premium]) => (
              <tr key={label}>
                <th scope="row" className="border-b border-line py-2 pr-3 font-normal text-ink">{label}</th>
                <td className="border-b border-line px-2 py-2 text-ink-2">{free}</td>
                <td className="border-b border-line px-2 py-2 font-semibold text-ink">{premium}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
