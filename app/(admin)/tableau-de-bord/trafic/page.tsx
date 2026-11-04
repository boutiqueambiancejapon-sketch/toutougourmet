import { openTab, READ_FAILED, type TabPageProps } from '@/lib/dashboard/tab-page'
import { overviewOf } from '@/lib/dashboard/traffic'
import { safeRead } from '@/lib/server/dashboard-safe'
import { EMPTY_TOTALS, getSessions, getTotals, getVisitorBuckets } from '@/lib/server/dashboard-traffic'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { TrafficNav } from '@/components/dashboard/traffic/TrafficNav'
import { Earnings, TRAFFIC_LIMITS, TrafficTiles, VisitorChart } from '@/components/dashboard/traffic/TrafficOverview'

// @cdc tableau de bord — Trafic, vue d'ensemble.

export const dynamic = 'force-dynamic'

export default async function TrafficTab(props: TabPageProps) {
  const period = await openTab(props)
  const [sessions, totals, buckets] = await Promise.all([
    safeRead('sessions', [], (pool) => getSessions(pool, period)),
    safeRead('totaux', EMPTY_TOTALS, (pool) => getTotals(pool, period)),
    safeRead('visiteurs dans le temps', [], (pool) => getVisitorBuckets(pool, period)),
  ])
  const overview = overviewOf(sessions.value)
  return (
    <DashboardShell period={period.key} current="trafic" notice={sessions.ok && totals.ok && buckets.ok ? null : READ_FAILED}>
      <TrafficNav period={period.key} current="" />
      <TrafficTiles overview={overview} totals={totals.value} period={period} />
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <VisitorChart buckets={buckets.value} period={period} />
        <Earnings totals={totals.value} overview={overview} />
      </div>
      <p className="m-0 mt-4 max-w-prose text-xs text-ink-2">{TRAFFIC_LIMITS}</p>
    </DashboardShell>
  )
}
