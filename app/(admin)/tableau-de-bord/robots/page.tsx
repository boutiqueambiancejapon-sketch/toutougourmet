import { openTab, READ_FAILED, type TabPageProps } from '@/lib/dashboard/tab-page'
import { loadRobots } from '@/lib/server/dashboard-tabs'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { AiSection } from '@/components/dashboard/AiSection'

// @cdc tableau de bord — onglet Robots IA : opérateurs, pages lues, visiteurs envoyés par une IA,
// erreurs servies et articles jamais lus.

export const dynamic = 'force-dynamic'

export default async function RobotsTab(props: TabPageProps) {
  const period = await openTab(props)
  const { data, ok } = await loadRobots(period)
  return (
    <DashboardShell period={period.key} current="robots" notice={ok ? null : READ_FAILED}>
      <AiSection data={data.ai} period={period} unread={data.unread} articleCount={data.articleCount} />
    </DashboardShell>
  )
}
