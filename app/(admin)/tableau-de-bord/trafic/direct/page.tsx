import { openTab, type TabPageProps } from '@/lib/dashboard/tab-page'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { LiveSection } from '@/components/dashboard/LiveSection'
import { TrafficNav } from '@/components/dashboard/traffic/TrafficNav'

// @cdc tableau de bord — Trafic, en direct : seule vue qui sonde le serveur, toutes les 10 s.

export const dynamic = 'force-dynamic'

export default async function TrafficLive(props: TabPageProps) {
  const period = await openTab(props)
  return (
    <DashboardShell period={period.key} current="trafic" sub="/direct">
      <TrafficNav period={period.key} current="/direct" />
      <LiveSection />
    </DashboardShell>
  )
}
