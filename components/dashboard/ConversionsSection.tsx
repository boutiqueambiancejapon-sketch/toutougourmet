import type { Period } from '@/lib/dashboard/period'
import { PAGE_TYPE_LABELS, type PageType } from '@/lib/page-type'
import { GOALS, MAIN_GOAL, type ConversionRow, type ConversionsData, type Goal } from '@/lib/server/dashboard-conversions'
import { Empty, SectionTitle } from './Panel'

// @cdc tableau de bord — « Conversions par type de page » (docs/v2/cro-carte.md) : une ligne par
// type de page, lisible sur iPhone, résultat principal à droite et détail dessous.

const nf = new Intl.NumberFormat('fr-FR')
const pct = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 1 })

const GOAL_LABELS: Record<Goal, string> = { email: 'e-mail', compte: 'compte', clic: 'clic' }
const GOAL_PLURAL: Record<Goal, string> = { email: 'e-mails', compte: 'comptes', clic: 'clics' }
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

function mainGoalText(type: PageType): string {
  const goal = MAIN_GOAL[type]
  return goal ? GOAL_LONG[goal] : (OTHER_MAIN[type] ?? 'aucun fixé')
}

function headline(row: ConversionRow): string {
  const main = MAIN_GOAL[row.type]
  const n = main ? row.goals[main] : 0
  if (main && n > 0) return `${nf.format(n)} ${n > 1 ? GOAL_PLURAL[main] : GOAL_LABELS[main]}`
  const best = GOALS.find((g) => row.goals[g] > 0)
  return best ? `${nf.format(row.goals[best])} ${row.goals[best] > 1 ? GOAL_PLURAL[best] : GOAL_LABELS[best]}` : 'Rien'
}

function detail(row: ConversionRow): string {
  const main = MAIN_GOAL[row.type]
  const others = GOALS.filter((g) => row.goals[g] > 0).map((g) => `${nf.format(row.goals[g])} ${row.goals[g] > 1 ? GOAL_PLURAL[g] : GOAL_LABELS[g]}`)
  const rate = main && row.goals[main] > 0 && row.views > 0 ? `taux ${pct.format(row.goals[main] / row.views)}` : null
  return [`${nf.format(row.views)} vues`, ...others, rate, `objectif : ${mainGoalText(row.type)}`].filter(Boolean).join(' · ')
}

export function ConversionsSection({ data, period, insight }: { data: ConversionsData; period: Period; insight: string }) {
  return (
    <>
      <p className="m-0 mt-4 rounded-box bg-amber-bg px-3 py-2.5 text-sm text-ink">
        <span className="font-semibold">À retenir sur {period.long} : </span>
        {insight}
      </p>
      <SectionTitle id="conversions" title="Par type de page" intro={`Sur ${period.long}, classé par pages vues. Le chiffre à droite est le résultat principal de chaque type.`} />
      {data.rows.length === 0 ? (
        <div className="mt-4">
          <Empty>Aucune page vue ni aucune conversion sur la période.</Empty>
        </div>
      ) : (
        <ol className="m-0 mt-4 flex list-none flex-col divide-y divide-line rounded-card border border-line bg-paper px-4 py-1 text-sm">
          {data.rows.map((row) => (
            <li key={row.type} className="py-2.5" title={PAGE_TYPE_LABELS[row.type]}>
              <span className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 text-ink">{SHORT[row.type]}</span>
                <span className="shrink-0 font-semibold tabular-nums text-ink">{headline(row)}</span>
              </span>
              <span className="block text-xs text-ink-2">{detail(row)}</span>
            </li>
          ))}
        </ol>
      )}
      <p className="m-0 mt-3 max-w-prose text-xs text-ink-2">
        Un compte est rattaché au type de page de l’invitation d’où vient le visiteur. Comptes sans type connu (bouton du haut, lien direct)&nbsp;: <span className="font-semibold tabular-nums text-ink">{nf.format(data.unattributedAccounts)}</span>.
      </p>
    </>
  )
}
