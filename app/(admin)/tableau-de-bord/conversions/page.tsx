import { openTab, READ_FAILED, type TabPageProps } from '@/lib/dashboard/tab-page'
import { loadConversionsTab } from '@/lib/server/dashboard-tabs'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { ConversionsSection } from '@/components/dashboard/ConversionsSection'
import { EmailSignupPanels, PartnersSection } from '@/components/dashboard/PartnersSection'
import { SignupsSection } from '@/components/dashboard/SignupsSection'
import { SubscribersLink } from '@/components/dashboard/subscribers/SubscribersLink'

// @cdc tableau de bord — onglet Conversions : par type de page (objectif principal encadré),
// clics partenaires au détail, inscriptions (comptes, lettre, guide). Lien vers les adresses inscrites.

export const dynamic = 'force-dynamic'

export default async function ConversionsTab(props: TabPageProps) {
  const period = await openTab(props)
  const { data, ok } = await loadConversionsTab(period)
  return (
    <DashboardShell period={period.key} current="conversions" notice={ok ? null : READ_FAILED}>
      <SubscribersLink />
      <ConversionsSection data={data.conversions} period={period} />
      <PartnersSection data={data.partners} />
      <SignupsSection data={data.signups} period={period}>
        <EmailSignupPanels data={data.partners} />
      </SignupsSection>
    </DashboardShell>
  )
}
