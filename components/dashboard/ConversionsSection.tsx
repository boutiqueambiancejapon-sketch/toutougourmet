import type { Period } from '@/lib/dashboard/period'
import { PAGE_TYPE_LABELS, type PageType } from '@/lib/page-type'
import { GOALS, MAIN_GOAL, type ConversionRow, type ConversionsData, type Goal } from '@/lib/server/dashboard-conversions'
import { Empty, SectionTitle } from './Panel'

// @cdc tableau de bord — « Conversions par type de page » (docs/v2/cro-carte.md, maquette du
// 2026-11-03) : un tableau compact, une ligne par type de page, pages vues puis chaque objectif
// en part des pages vues (nombre en dessous). L'objectif principal de la carte est surligné.

const nf = new Intl.NumberFormat('fr-FR')
const pct = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 1 })

const GOAL_LABELS: Record<Goal, string> = { email: 'E-mail', compte: 'Compte', clic: 'Partenaire' }
const GOAL_LONG: Record<Goal, string> = { email: 'e-mail ou guide', compte: 'compte', clic: 'clic partenaire' }

/** Libellés courts pour tenir sur iPhone ; le libellé complet reste au survol. */
const SHORT: Record<PageType, string> = {
  aliments: 'Aliments',
  urgences: 'Urgences',
  sante: 'Santé',
  'nutrition-marques': 'Marques',
  races: 'Races',
  recettes: 'Recettes',
  outils: 'Outils',
  quiz: 'Quiz',
  scanner: 'Scanner',
  accueil: 'Accueil',
  compte: 'Espace compte',
  autre: 'Autres',
}

/** Objectif principal hors des trois colonnes, en clair. */
const OTHER_MAIN: Partial<Record<PageType, string>> = {
  urgences: 'aucun (numéros et gestes d’abord)',
  accueil: 'le quiz',
}

const cell = 'px-2 py-2 text-right align-top tabular-nums'

function GoalCell({ goal, row }: { goal: Goal; row: ConversionRow }) {
  const main = MAIN_GOAL[row.type] === goal
  const n = row.goals[goal]
  const rate = n > 0 && row.views > 0 ? pct.format(n / row.views) : n > 0 ? nf.format(n) : '–'
  return (
    <td className={cell}>
      <span className={main ? 'rounded-tile bg-amber px-1 font-semibold text-ink' : 'text-ink'}>{rate}</span>
      {main ? <span className="sr-only"> (objectif principal)</span> : null}
      {n > 0 ? <span className="block text-xs text-ink-2">{nf.format(n)}</span> : null}
    </td>
  )
}

function mainGoalText(type: PageType): string {
  const goal = MAIN_GOAL[type]
  return goal ? GOAL_LONG[goal] : (OTHER_MAIN[type] ?? 'aucun fixé')
}

export function ConversionsSection({ data, period }: { data: ConversionsData; period: Period }) {
  return (
    <>
      <SectionTitle
        id="conversions"
        title="Par type de page"
        intro={`Sur ${period.long} : pages vues, puis chaque objectif en part des pages vues, avec le nombre en dessous.`}
      />
      {data.rows.length === 0 ? (
        <div className="mt-4">
          <Empty>Aucune page vue ni aucune conversion sur la période.</Empty>
        </div>
      ) : (
        <div className="relative mt-4 overflow-x-auto rounded-card border border-line bg-paper">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-cream-2 text-xs text-ink-2">
              <tr>
                <th scope="col" className="px-2 py-2 text-left font-semibold">Page</th>
                <th scope="col" className="px-2 py-2 text-right font-semibold">Vues</th>
                {GOALS.map((g) => (
                  <th key={g} scope="col" className="px-2 py-2 text-right font-semibold">{GOAL_LABELS[g]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => (
                <tr key={row.type} className="border-t border-line">
                  <th scope="row" className="px-2 py-2 text-left align-top font-normal text-ink" title={`${PAGE_TYPE_LABELS[row.type]} · objectif principal : ${mainGoalText(row.type)}`}>
                    {SHORT[row.type]}
                  </th>
                  <td className={`${cell} text-ink`}>{nf.format(row.views)}</td>
                  {GOALS.map((g) => (
                    <GoalCell key={g} goal={g} row={row} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="m-0 mt-3 max-w-prose text-xs text-ink-2">
        <span className="rounded-tile bg-amber px-1 font-semibold text-ink">Surligné</span> : l’objectif principal de ce type de page.
        Urgences et accueil n’en ont pas parmi ces trois colonnes (numéros et gestes d’abord, puis le quiz). Un compte est
        rattaché au type de page de l’invitation d’où vient le visiteur. Comptes sans type connu (bouton du haut, lien
        direct)&nbsp;: <span className="font-semibold tabular-nums text-ink">{nf.format(data.unattributedAccounts)}</span>.
      </p>
    </>
  )
}
