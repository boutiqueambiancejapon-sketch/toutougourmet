import type { ChannelRow } from '@/lib/dashboard/traffic'
import { Empty } from '../Panel'

// @cdc tableau de bord — Trafic, Acquisition : sessions par canal, avec la part qui a cliqué vers un partenaire.

const nf = new Intl.NumberFormat('fr-FR')
const pct = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 1 })

export function ChannelList({ rows }: { rows: ChannelRow[] }) {
  if (rows.length === 0) return <Empty>Aucune session sur la période.</Empty>
  const max = Math.max(1, ...rows.map((r) => r.sessions))
  return (
    <ol className="m-0 flex list-none flex-col gap-3 p-0 text-sm">
      {rows.map((r) => (
        <li key={r.channel}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 text-ink">{r.label}</span>
            <span className="shrink-0 tabular-nums">
              <span className="font-semibold text-ink">{nf.format(r.sessions)}</span>
              <span className="ml-2 text-ink-2">{pct.format(r.clickRate)} clics</span>
            </span>
          </div>
          <div className="mt-1 h-2 rounded-pill bg-cream-2" aria-hidden="true">
            <div className="h-2 rounded-pill bg-orange" style={{ width: `${Math.max((r.sessions / max) * 100, 2)}%` }} />
          </div>
        </li>
      ))}
    </ol>
  )
}
