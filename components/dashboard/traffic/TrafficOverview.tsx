import { bucketLabel } from '@/lib/dashboard/buckets'
import { deltaLong, deltaShort, trendOf, type Pair, type Trend } from '@/lib/dashboard/compare'
import type { Period } from '@/lib/dashboard/period'
import { durationLabel, type Overview } from '@/lib/dashboard/traffic'
import type { TrafficTotals, VisitorBucket } from '@/lib/server/dashboard-traffic'
import { Panel } from '../Panel'

// @cdc tableau de bord — Trafic, vue d'ensemble : chiffres comparés à la période d'avant, visiteurs
// dans le temps, puis ce que ces visites rapportent. Rendu serveur, sans bibliothèque de graphiques.

const nf = new Intl.NumberFormat('fr-FR')
const pct = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 1 })
const whole = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 0 })

const TREND_CLASS: Record<Trend, string> = { up: 'text-green-ink', down: 'text-rose-ink', flat: 'text-ink-2' }

function Tile({ label, pair, period }: { label: string; pair: Pair; period: Period }) {
  return (
    <div className="rounded-box border border-line bg-paper px-3 py-2.5">
      <dt className="text-sm leading-snug text-ink-2">{label}</dt>
      <dd className="m-0 font-display text-3xl font-black leading-tight tabular-nums text-ink">{nf.format(pair.current)}</dd>
      <dd className={`m-0 text-xs font-semibold ${TREND_CLASS[trendOf(pair)]}`}>
        <span aria-hidden="true">{deltaShort(pair)}</span>
        <span className="sr-only">{deltaLong(pair, period.previous)}</span>
      </dd>
    </div>
  )
}

function bounceDelta({ current, previous }: Overview['bounce']): { text: string; cls: string } {
  if (current === null || previous === null) return { text: 'Sans comparaison', cls: 'text-ink-2' }
  const points = Math.round((current - previous) * 100)
  if (points === 0) return { text: '=', cls: 'text-ink-2' }
  // Un rebond qui monte est une mauvaise nouvelle : les couleurs s'inversent.
  return points > 0 ? { text: `+${points} pts`, cls: 'text-rose-ink' } : { text: `−${-points} pts`, cls: 'text-green-ink' }
}

function TextTile({ label, value, note, noteClass = 'text-ink-2', wide = false }: { label: string; value: string; note?: string; noteClass?: string; wide?: boolean }) {
  return (
    <div className={`rounded-box border border-line bg-paper px-3 py-2.5 ${wide ? 'col-span-2 md:col-span-1' : ''}`}>
      <dt className="text-sm leading-snug text-ink-2">{label}</dt>
      <dd className="m-0 font-display text-3xl font-black leading-tight tabular-nums text-ink">{value}</dd>
      {note ? <dd className={`m-0 text-xs font-semibold ${noteClass}`}>{note}</dd> : null}
    </div>
  )
}

export function TrafficTiles({ overview, totals, period }: { overview: Overview; totals: TrafficTotals; period: Period }) {
  const bounce = bounceDelta(overview.bounce)
  return (
    <dl className="m-0 mt-4 grid grid-cols-2 gap-2.5 md:grid-cols-5">
      <Tile label="Visiteurs" pair={overview.visitors} period={period} />
      <Tile label="Sessions" pair={overview.sessions} period={period} />
      <Tile label="Pages vues" pair={totals.views} period={period} />
      <TextTile label="Rebond" value={overview.bounce.current === null ? '–' : whole.format(overview.bounce.current)} note={bounce.text} noteClass={bounce.cls} />
      <TextTile label="Durée d’une session" value={overview.seconds === null ? '–' : durationLabel(overview.seconds)} note="Estimation basse" wide />
    </dl>
  )
}

export function VisitorChart({ buckets, period }: { buckets: VisitorBucket[]; period: Period }) {
  const hourly = period.bucket === 'hour'
  const unit = hourly ? 'par heure' : period.bucket === 'week' ? 'par semaine' : 'par jour'
  const max = Math.max(1, ...buckets.map((b) => b.n))
  const summary = buckets.map((b) => `${bucketLabel(b.bucket, hourly)} : ${b.n}`).join(', ')
  return (
    <Panel title={`Visiteurs ${unit}`}>
      {buckets.length === 0 ? null : (
        <figure className="m-0">
          <div className="flex h-24 items-end gap-0.5" aria-hidden="true">
            {buckets.map((b) => (
              <span
                key={b.bucket}
                title={`${bucketLabel(b.bucket, hourly)} : ${b.n}`}
                className={`min-w-0 flex-1 rounded-t-sm ${b.n === 0 ? 'bg-line' : 'bg-orange'}`}
                style={{ height: `${Math.max((b.n / max) * 100, 3)}%` }}
              />
            ))}
          </div>
          <figcaption className="mt-1 flex justify-between text-xs tabular-nums text-ink-2">
            <span aria-hidden="true">{bucketLabel(buckets[0].bucket, hourly)}</span>
            <span className="sr-only">{`Visiteurs ${unit} : ${summary}.`}</span>
            <span aria-hidden="true">{bucketLabel(buckets[buckets.length - 1].bucket, hourly)}</span>
          </figcaption>
        </figure>
      )}
    </Panel>
  )
}

export function Earnings({ totals, overview }: { totals: TrafficTotals; overview: Overview }) {
  const lines = [
    { label: 'Nouveaux e-mails', value: totals.emails.current, rate: overview.rates.emails },
    { label: 'Clics partenaires', value: totals.clicks.current, rate: overview.rates.clicks },
    { label: 'Scans', value: totals.scans.current, rate: overview.rates.scans },
  ]
  return (
    <Panel title="Ce que ça rapporte" hint="La part indique les sessions où l’action a eu lieu au moins une fois.">
      <ul className="m-0 flex list-none flex-col divide-y divide-line p-0 text-sm">
        {lines.map((l) => (
          <li key={l.label} className="flex items-baseline justify-between gap-3 py-2 first:pt-0 last:pb-0">
            <span className="min-w-0 text-ink">{l.label}</span>
            <span className="shrink-0 tabular-nums">
              <span className="font-semibold text-ink">{nf.format(l.value)}</span>
              <span className="ml-3 inline-block min-w-12 text-right text-ink-2">{pct.format(l.rate)}</span>
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

export const TRAFFIC_LIMITS =
  'Visiteurs, sessions, rebond, durée et parts sont comptés depuis le 4 novembre ; pages vues, e-mails, clics et scans le sont depuis plus longtemps. Quelqu’un qui revient un autre jour compte comme un nouveau visiteur, faute de cookie de suivi, et un redémarrage du site peut compter un visiteur deux fois. La durée s’arrête à la dernière action : le temps passé sur la dernière page n’est pas compté.'
