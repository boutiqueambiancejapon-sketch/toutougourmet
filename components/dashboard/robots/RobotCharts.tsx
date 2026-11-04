import { bucketLabel } from '@/lib/dashboard/buckets'
import { ROBOT_KINDS } from '@/lib/dashboard/robots'
import { Empty } from '../Panel'

// @cdc tableau de bord — graphiques des robots IA, rendus serveur. Une seule série et une seule
// teinte pour l'heure et les mini-courbes ; le détail est au survol et en texte pour les lecteurs d'écran.

const nf = new Intl.NumberFormat('fr-FR')
const pct = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 0 })

/** Part de chaque type de visite : barre segmentée, légende et chiffres en toutes lettres dessous. */
export function KindShare({ rows }: { rows: { key: string; value: number; swatch: string }[] }) {
  const total = rows.reduce((sum, r) => sum + r.value, 0)
  if (total === 0) return <Empty>Aucune visite de robot IA sur la période.</Empty>
  return (
    <figure className="m-0">
      <div className="flex h-3 gap-0.5 overflow-hidden rounded-pill" aria-hidden="true">
        {rows.filter((r) => r.value > 0).map((r) => (
          <span key={r.key} className={r.swatch} style={{ width: `${(r.value / total) * 100}%` }} />
        ))}
      </div>
      <ul className="m-0 mt-3 flex list-none flex-col gap-2 p-0 text-sm">
        {ROBOT_KINDS.map((k) => {
          const row = rows.find((r) => r.key === k.key)
          return (
            <li key={k.key}>
              <span className="flex items-baseline justify-between gap-3">
                <span className="flex min-w-0 items-center gap-1.5 text-ink">
                  <span className={`size-2.5 shrink-0 rounded-pill ${row?.swatch ?? ''}`} aria-hidden="true" />
                  {k.label}
                </span>
                <span className="shrink-0 font-semibold tabular-nums text-ink">
                  {nf.format(row?.value ?? 0)} <span className="font-normal text-ink-2">{pct.format((row?.value ?? 0) / total)}</span>
                </span>
              </span>
              <span className="block text-xs text-ink-2">{k.hint}</span>
            </li>
          )
        })}
      </ul>
    </figure>
  )
}

/** Visites selon l'heure de Paris. */
export function HourBars({ hours }: { hours: number[] }) {
  const max = Math.max(...hours, 0)
  if (max === 0) return <Empty>Aucune visite de robot IA sur la période.</Empty>
  const peak = hours.indexOf(max)
  return (
    <figure className="m-0">
      <div className="flex h-24 items-end gap-0.5 border-b border-line-2" aria-hidden="true">
        {hours.map((n, h) => (
          <span key={h} title={`${h} h : ${nf.format(n)}`} className={`min-w-0 flex-1 rounded-t-sm ${n === 0 ? 'bg-line' : 'bg-orange'}`} style={{ height: `${Math.max((n / max) * 100, 2)}%` }} />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs tabular-nums text-ink-2" aria-hidden="true">
        <span>0 h</span>
        <span>6 h</span>
        <span>12 h</span>
        <span>18 h</span>
        <span>23 h</span>
      </div>
      <figcaption className="mt-2 text-sm text-ink-2">
        Pic à {peak} h, avec {nf.format(max)} visites.
        <span className="sr-only"> Détail : {hours.map((n, h) => `${h} h ${n}`).join(', ')}.</span>
      </figcaption>
    </figure>
  )
}

export function Spark({ values, buckets, hourly }: { values: number[]; buckets: string[]; hourly: boolean }) {
  const max = Math.max(...values, 1)
  return (
    <span className="flex h-8 items-end gap-px" aria-hidden="true">
      {values.map((n, i) => (
        <span key={buckets[i]} title={`${buckets[i] ? bucketLabel(buckets[i], hourly) : ''} : ${nf.format(n)}`} className={`min-w-0 flex-1 rounded-t-sm ${n === 0 ? 'bg-line' : 'bg-orange'}`} style={{ height: `${Math.max((n / max) * 100, 6)}%` }} />
      ))}
    </span>
  )
}
