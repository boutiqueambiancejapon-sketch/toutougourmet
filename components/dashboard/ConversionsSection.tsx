import type { Period } from '@/lib/dashboard/period'
import { PAGE_TYPE_LABELS } from '@/lib/page-type'
import { GOALS, MAIN_GOAL, type ConversionRow, type ConversionsData, type Goal } from '@/lib/server/dashboard-conversions'
import { Empty, SectionTitle } from './Panel'

// @cdc tableau de bord — « Conversions par type de page » (docs/v2/cro-carte.md) : pour chaque type,
// pages vues puis nombre et taux de chaque objectif, l'objectif principal de la carte encadré.
// Une carte par type, trois cases côte à côte : lisible sur iPhone sans défilement horizontal.

const nf = new Intl.NumberFormat('fr-FR')
const pct = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 1, minimumFractionDigits: 1 })

const GOAL_LABELS: Record<Goal, string> = { email: 'E-mail, guide', compte: 'Compte', clic: 'Clic partenaire' }

/** Objectif principal hors des trois colonnes, en clair. */
const OTHER_MAIN: Partial<Record<ConversionRow['type'], string>> = {
  urgences: 'aucun (numéros et gestes d’abord)',
  accueil: 'le quiz',
}

function rate(n: number, views: number): string {
  return views > 0 ? pct.format(n / views) : '–'
}

function GoalCell({ goal, row }: { goal: Goal; row: ConversionRow }) {
  const main = MAIN_GOAL[row.type] === goal
  const n = row.goals[goal]
  return (
    <div className={`rounded-box border px-2 py-2 ${main ? 'border-orange bg-amber-bg' : 'border-line bg-cream'}`}>
      <dt className="text-xs leading-tight text-ink-2">
        {GOAL_LABELS[goal]}
        {main ? <span className="sr-only"> (objectif principal)</span> : null}
      </dt>
      <dd className="m-0 mt-1 font-display text-xl font-black tabular-nums text-ink">{nf.format(n)}</dd>
      <dd className="m-0 text-xs tabular-nums text-ink-2">{rate(n, row.views)}</dd>
    </div>
  )
}

function TypeCard({ row }: { row: ConversionRow }) {
  const main = MAIN_GOAL[row.type]
  return (
    <li className="rounded-card border border-line bg-paper p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="m-0 min-w-0 font-display text-lg font-bold text-ink">{PAGE_TYPE_LABELS[row.type]}</h3>
        <p className="m-0 shrink-0 text-sm text-ink-2">
          <span className="font-semibold tabular-nums text-ink">{nf.format(row.views)}</span> {row.views > 1 ? 'vues' : 'vue'}
        </p>
      </div>
      <p className="m-0 mt-1 text-xs text-ink-2">
        Objectif principal&nbsp;: {main ? GOAL_LABELS[main].toLowerCase() : (OTHER_MAIN[row.type] ?? 'aucun fixé')}
      </p>
      <dl className="m-0 mt-3 grid grid-cols-3 gap-2">
        {GOALS.map((g) => (
          <GoalCell key={g} goal={g} row={row} />
        ))}
      </dl>
    </li>
  )
}

export function ConversionsSection({ data, period }: { data: ConversionsData; period: Period }) {
  return (
    <>
      <SectionTitle
        id="conversions"
        title="Conversions par type de page"
        intro={`Sur ${period.long} : pages vues, puis chaque objectif en nombre et en part des pages vues. L’objectif principal de la carte des conversions est encadré.`}
      />
      {data.rows.length === 0 ? (
        <div className="mt-4">
          <Empty>Aucune page vue ni aucune conversion sur la période.</Empty>
        </div>
      ) : (
        <ol className="m-0 mt-4 grid list-none gap-3 p-0 md:grid-cols-2">
          {data.rows.map((row) => (
            <TypeCard key={row.type} row={row} />
          ))}
        </ol>
      )}
      <p className="m-0 mt-3 max-w-prose text-xs text-ink-2">
        Un compte est rattaché au type de page de l’invitation d’où vient le visiteur. Comptes sans type connu (bouton du
        haut, lien direct)&nbsp;: <span className="font-semibold tabular-nums text-ink">{nf.format(data.unattributedAccounts)}</span>.
      </p>
    </>
  )
}
