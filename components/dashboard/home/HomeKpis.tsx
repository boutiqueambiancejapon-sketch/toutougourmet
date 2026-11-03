import { deltaLong, deltaShort, trendOf, type Pair, type Trend } from '@/lib/dashboard/compare'
import type { Period } from '@/lib/dashboard/period'
import type { ClickBucket, HomeKpis as Kpis } from '@/lib/server/dashboard-home'
import { ClickBars } from './ClickBars'

// @cdc tableau de bord — « Ça progresse ? » : cinq chiffres au plus, chacun comparé à la période
// d'avant. La grande tuile (clics partenaires, le revenu) porte l'histogramme par jour ou par heure.

const nf = new Intl.NumberFormat('fr-FR')

const TREND_CLASS: Record<Trend, string> = { up: 'text-green-ink', down: 'text-rose-ink', flat: 'text-ink-2' }

const SMALL: { key: Exclude<keyof Kpis, 'clicks'>; label: string }[] = [
  { key: 'views', label: 'Visiteurs : pages vues' },
  { key: 'emails', label: 'Nouveaux e-mails' },
  { key: 'accounts', label: 'Nouveaux comptes' },
  { key: 'scans', label: 'Scans de croquettes' },
]

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

interface HomeKpisProps {
  kpis: Kpis
  buckets: ClickBucket[]
  period: Period
  insight: string
}

export function HomeKpis({ kpis, buckets, period, insight }: HomeKpisProps) {
  return (
    <section aria-labelledby="progression" className="mt-8">
      <h2 id="progression" className="m-0 font-display text-xl font-black text-ink">
        Ça progresse ?
      </h2>
      <p className="m-0 mt-1 text-sm text-ink-2">
        Sur {period.long}, chaque écart par rapport {period.previous}.
      </p>
      <dl className="m-0 mt-3 grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <div className="col-span-2 rounded-box border-2 border-ink bg-paper px-3 py-2.5 shadow-[4px_4px_0_var(--orange)] md:col-span-4">
          <dt className="text-sm leading-snug text-ink-2">Revenus potentiels : clics vers les partenaires</dt>
          <dd className="m-0 font-display text-4xl font-black leading-tight tabular-nums text-ink">{nf.format(kpis.clicks.current)}</dd>
          <dd className={`m-0 text-xs font-semibold ${TREND_CLASS[trendOf(kpis.clicks)]}`}>{deltaLong(kpis.clicks, period.previous)}</dd>
          <dd className="m-0 mt-2">
            <ClickBars buckets={buckets} hourly={period.bucket === 'hour'} />
          </dd>
        </div>
        {SMALL.map((s) => (
          <Tile key={s.key} label={s.label} pair={kpis[s.key]} period={period} />
        ))}
      </dl>
      <p className="m-0 mt-3 rounded-box bg-amber-bg px-3 py-2.5 text-sm text-ink">
        <span className="font-semibold">À retenir sur {period.long} : </span>
        {insight}
      </p>
    </section>
  )
}
