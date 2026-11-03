import { openTab, READ_FAILED, type TabPageProps } from '@/lib/dashboard/tab-page'
import { getNightLogs, nightLogDir } from '@/lib/server/dashboard-logs'
import { loadContent } from '@/lib/server/dashboard-tabs'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { MessagesSection } from '@/components/dashboard/MessagesSection'
import { NightSection } from '@/components/dashboard/NightSection'
import { OpffImportSection } from '@/components/dashboard/OpffImportSection'
import { ReviewSection } from '@/components/dashboard/ReviewSection'

// @cdc tableau de bord — onglet Contenu : comptes rendus de la tâche de nuit, fiches croquettes
// à relire (avec les signalements), copie Open Pet Food Facts, messages du formulaire de contact.

export const dynamic = 'force-dynamic'

export default async function ContentTab(props: TabPageProps) {
  const period = await openTab(props)
  const [{ data, ok }, logs] = await Promise.all([loadContent(), getNightLogs(7)])
  return (
    <DashboardShell period={period.key} current="contenu" notice={ok ? null : READ_FAILED}>
      <NightSection logs={logs} configured={nightLogDir() !== null} />
      <ReviewSection rows={data.review} error={data.reviewError} />
      <OpffImportSection status={data.opff} policy={data.opffPolicy} />
      <MessagesSection messages={data.messages} />
    </DashboardShell>
  )
}
