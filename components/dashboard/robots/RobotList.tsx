import Link from 'next/link'
import { periodQuery, type PeriodKey } from '@/lib/dashboard/period'
import { ROBOT_KINDS, robotHref, type CoverageRow, type RobotFilter } from '@/lib/dashboard/robots'
import { tabHref } from '@/lib/dashboard/tabs'
import type { RobotLine } from '@/lib/server/dashboard-robots'
import { Empty } from '../Panel'
import { Spark } from './RobotCharts'

// @cdc tableau de bord — une ligne par opérateur : volume, évolution, robots qui le composent,
// dernière visite. Toucher une ligne filtre tout l'onglet sur cet opérateur.

const nf = new Intl.NumberFormat('fr-FR')
const dateFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' })
const kindShort = (key: string): string => ROBOT_KINDS.find((k) => k.key === key)?.short ?? key

interface RobotListProps {
  robots: RobotLine[]
  buckets: string[]
  hourly: boolean
  period: PeriodKey
  filter: RobotFilter
}

export function RobotList({ robots, buckets, hourly, period, filter }: RobotListProps) {
  if (robots.length === 0) return <Empty>Aucun robot IA pour ce filtre.</Empty>
  return (
    <ol className="m-0 flex list-none flex-col divide-y divide-line p-0 text-sm">
      {robots.map((r) => (
        <li key={r.operator} className="py-3 first:pt-0 last:pb-0">
          <Link href={robotHref(tabHref('robots', '7j'), periodQuery(period), { ...filter, robot: r.operator })} scroll={false} className="block text-ink no-underline">
            <span className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 font-semibold">{r.operator}</span>
              <span className="shrink-0 font-semibold tabular-nums">{nf.format(r.visits)}</span>
            </span>
            <span className="mt-1 block">
              <Spark values={r.spark} buckets={buckets} hourly={hourly} />
            </span>
            <span className="mt-1 block text-xs text-ink-2 [overflow-wrap:anywhere]">
              {[...r.bots].sort((a, b) => b.visits - a.visits).map((b) => `${b.bot} (${kindShort(b.kind)}) ${nf.format(b.visits)}`).join(' · ')}
            </span>
            <span className="block text-xs text-ink-2">Dernière visite : {dateFmt.format(r.lastSeen)}</span>
          </Link>
        </li>
      ))}
    </ol>
  )
}

export function CoverageList({ rows }: { rows: CoverageRow[] }) {
  if (rows.length === 0) return <Empty>Aucun article à classer.</Empty>
  return (
    <ol className="m-0 flex list-none flex-col gap-3 p-0 text-sm">
      {rows.map((r) => (
        <li key={r.label}>
          <span className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 text-ink">{r.label}</span>
            <span className="shrink-0 font-semibold tabular-nums text-ink">{nf.format(r.read)} / {nf.format(r.total)}</span>
          </span>
          <span className="mt-1 block h-2 rounded-pill bg-cream-2" aria-hidden="true">
            <span className="block h-2 rounded-pill bg-orange" style={{ width: `${Math.max((r.read / r.total) * 100, r.read ? 2 : 0)}%` }} />
          </span>
        </li>
      ))}
    </ol>
  )
}
