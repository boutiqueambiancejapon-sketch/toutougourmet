import { IconCheck, IconCross } from '@/components/icons'
import { FREE_MONTHLY_SCANS, PREMIUM_MONTHLY_SCANS } from '@/lib/scanner/config'

// @cdc premium — tableau des trois formules de /premium (rendu serveur). Colonnes fixes et valeurs
// courtes (coches ou deux mots) : il tient à 390 px sans défilement horizontal.

type Cell = boolean | string
type Row = [label: string, none: Cell, free: Cell, premium: Cell]

const GROUPS: { title: string; rows: Row[] }[] = [
  {
    title: 'Scanner de croquettes et friandises',
    rows: [
      ['Code-barres et fiches produits', true, true, true],
      ["Analyse d'étiquette par photo", false, `${FREE_MONTHLY_SCANS} par mois`, `${PREMIUM_MONTHLY_SCANS} par mois`],
      ['Historique des analyses', false, '20 dernières', 'Toutes'],
      ['Alternative proposée sous 55/100 (croquettes)', false, true, true],
    ],
  },
  {
    title: 'Suivi du chien',
    rows: [
      ['Calcul de ration, poids, âge, budget', true, true, true],
      ['Outils pré-remplis avec son profil', false, true, true],
      ['Pesées et courbe de poids', false, true, true],
      ['Alerte de prise ou de perte de poids', false, false, true],
      ['Offres partenaires selon son profil', false, true, true],
    ],
  },
]

const PLANS = ['Sans compte', 'Gratuit', 'Premium']

function Value({ cell }: { cell: Cell }) {
  if (cell === true) return <IconCheck className="mx-auto size-6 text-green-ink" title="Inclus" />
  if (cell === false) return <IconCross className="mx-auto size-6 text-ink-2" title="Non inclus" />
  return <span className="block text-sm font-semibold leading-tight text-ink">{cell}</span>
}

export function PremiumCompare() {
  return (
    <section aria-labelledby="comparer" className="flex flex-col gap-4">
      <h2 id="comparer" className="m-0 font-display text-2xl font-black text-ink md:text-3xl">
        Quelle différence entre les formules ?
      </h2>
      <div className="overflow-hidden rounded-card border border-line bg-paper">
        <table className="w-full table-fixed border-collapse text-left">
          <caption className="sr-only">Fonctions incluses sans compte, avec le compte gratuit et avec Premium</caption>
          <colgroup>
            <col className="w-2/5" />
            <col />
            <col />
            <col className="bg-amber-bg" />
          </colgroup>
          <thead>
            <tr>
              <td className="p-3" />
              {PLANS.map((p) => (
                <th key={p} scope="col" className="px-1 py-3 text-center align-bottom text-sm font-semibold leading-tight text-ink md:text-base">
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          {GROUPS.map((g) => (
            <tbody key={g.title}>
              <tr>
                <th scope="colgroup" colSpan={4} className="border-t border-line bg-cream-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-2">
                  {g.title}
                </th>
              </tr>
              {g.rows.map(([label, ...cells]) => (
                <tr key={label}>
                  <th scope="row" className="border-t border-line px-3 py-3 text-sm font-normal leading-snug text-ink md:text-base">
                    {label}
                  </th>
                  {cells.map((c, i) => (
                    <td key={PLANS[i]} className="border-t border-line px-1 py-3 text-center">
                      <Value cell={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </section>
  )
}
