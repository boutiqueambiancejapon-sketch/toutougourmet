import Link from 'next/link'
import { openTab, READ_FAILED, type TabPageProps } from '@/lib/dashboard/tab-page'
import { getNightLogs, getToneProgress, nightLogDir } from '@/lib/server/dashboard-logs'
import { loadContent } from '@/lib/server/dashboard-tabs'
import { ContentTodo, ToneCard } from '@/components/dashboard/ContentTodo'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { MessagesSection } from '@/components/dashboard/MessagesSection'
import { NightSection } from '@/components/dashboard/NightSection'
import { OpffImportSection } from '@/components/dashboard/OpffImportSection'
import { ReviewSection } from '@/components/dashboard/ReviewSection'
import { ImportedReview } from '@/components/dashboard/review/ImportedReview'
import { ScannerHealthLink } from '@/components/dashboard/scanner/ScannerHealthLink'
import { AssistantLink } from '@/components/dashboard/assistant/AssistantLink'

// @cdc tableau de bord — onglet Contenu : comptes rendus de la tâche de nuit, fiches croquettes
// à relire (avec les signalements) et fiches importées d'Open Pet Food Facts à valider ou écarter,
// copie Open Pet Food Facts, messages du formulaire de contact, accès à la santé du scanner.

export const dynamic = 'force-dynamic'

export default async function ContentTab(props: TabPageProps) {
  const period = await openTab(props)
  const [{ data, ok }, logs, tone] = await Promise.all([loadContent(), getNightLogs(7), getToneProgress()])
  const unread = data.messages.filter((m) => !m.handled).length
  return (
    <DashboardShell period={period.key} current="contenu" noPeriod notice={ok ? null : READ_FAILED}>
      <ContentTodo messages={unread} review={data.review.length} imported={data.imported?.total ?? null} checks={logs[0]?.checks.length ?? 0} />
      <ToneCard progress={tone} />
      <p className="m-0 mt-4">
        <Link href="/tableau-de-bord/fiches" className="inline-flex min-h-11 items-center rounded-box border border-line bg-paper px-3 text-sm font-semibold text-ink">Toutes les fiches produit et Google</Link>
      </p>
      {unread > 0 ? <MessagesSection messages={data.messages} /> : null}
      <NightSection logs={logs} configured={nightLogDir() !== null} />
      <div id="relecture" className="scroll-mt-20">
        <ReviewSection rows={data.review} error={data.reviewError} />
      </div>
      <ScannerHealthLink />
      <AssistantLink />
      <div id="importees" className="scroll-mt-20">
        <ImportedReview data={data.imported} />
      </div>
      <OpffImportSection status={data.opff} policy={data.opffPolicy} />
      {unread > 0 ? null : <MessagesSection messages={data.messages} />}
    </DashboardShell>
  )
}
