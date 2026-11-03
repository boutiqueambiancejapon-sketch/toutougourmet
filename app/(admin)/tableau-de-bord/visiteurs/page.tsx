import { openTab, READ_FAILED, type TabPageProps } from '@/lib/dashboard/tab-page'
import { loadVisitors } from '@/lib/server/dashboard-tabs'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { LiveSection } from '@/components/dashboard/LiveSection'
import { AudienceSection, ReaderToolsSection } from '@/components/dashboard/AudienceSection'

// @cdc tableau de bord — onglet Visiteurs : en direct (seul onglet qui sonde le serveur toutes
// les 10 s), puis pages, provenances et pays sur la période, puis outils et recherches.

export const dynamic = 'force-dynamic'

export default async function VisitorsTab(props: TabPageProps) {
  const period = await openTab(props)
  const { data, ok } = await loadVisitors(period)
  return (
    <DashboardShell period={period.key} current="visiteurs" notice={ok ? null : READ_FAILED}>
      <LiveSection />
      <AudienceSection data={data} period={period} />
      <ReaderToolsSection data={data} />
    </DashboardShell>
  )
}
