import type { FunnelStep } from '@/lib/dashboard/traffic'
import { Empty } from '../Panel'

// @cdc tableau de bord — parcours depuis un article. Chaque barre est proportionnelle à la première
// étape ; libellé et valeur restent au-dessus de la barre pour ne jamais passer sur deux lignes.

const nf = new Intl.NumberFormat('fr-FR')
const pct = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 0 })

export function TrafficFunnel({ steps }: { steps: FunnelStep[] }) {
  const first = steps[0]?.value ?? 0
  if (first === 0) return <Empty>Aucune session arrivée par un article sur la période.</Empty>
  return (
    <ol className="m-0 flex list-none flex-col gap-3 p-0 text-sm">
      {steps.map((s, i) => (
        <li key={s.label}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 text-ink">{s.label}</span>
            <span className="shrink-0 tabular-nums">
              <span className="font-semibold text-ink">{nf.format(s.value)}</span>
              {i > 0 ? <span className="ml-2 text-ink-2">{pct.format(s.value / first)}</span> : null}
            </span>
          </div>
          <div className="mt-1 h-2 rounded-pill bg-cream-2" aria-hidden="true">
            <div className="h-2 rounded-pill bg-orange" style={{ width: `${Math.max((s.value / first) * 100, 1)}%` }} />
          </div>
        </li>
      ))}
    </ol>
  )
}
