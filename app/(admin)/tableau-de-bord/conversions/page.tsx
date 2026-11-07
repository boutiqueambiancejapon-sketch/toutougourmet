import { openTab, READ_FAILED, type TabPageProps } from '@/lib/dashboard/tab-page'
import { loadConversionsTab } from '@/lib/server/dashboard-tabs'
import { insightOf } from '@/lib/dashboard/insight'
import { pageTitles } from '@/lib/server/dashboard-traffic'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { ConversionsSection } from '@/components/dashboard/ConversionsSection'
import { EmailSignupPanels, PartnersSection } from '@/components/dashboard/PartnersSection'
import { SignupsSection } from '@/components/dashboard/SignupsSection'
import { SubscribersLink } from '@/components/dashboard/subscribers/SubscribersLink'
import { RevenusSection } from '@/components/dashboard/RevenusSection'
import { EMPTY_REVENUS, getRevenus } from '@/lib/server/dashboard-revenus'
import { safeRead } from '@/lib/server/dashboard-safe'

// @cdc tableau de bord — onglet Conversions : par type de page (objectif principal encadré),
// clics partenaires au détail, inscriptions (comptes, lettre, guide). Lien vers les adresses inscrites.

export const dynamic = 'force-dynamic'

export default async function ConversionsTab(props: TabPageProps) {
  const period = await openTab(props)
  const [{ data, ok }, revenus] = await Promise.all([loadConversionsTab(period), safeRead('revenus', EMPTY_REVENUS, (pool) => getRevenus(pool, period))])
  return (
    <DashboardShell period={period.key} current="conversions" notice={ok && revenus.ok ? null : READ_FAILED}>
      <SubscribersLink />
      <ConversionsSection data={data.conversions} period={period} insight={insightOf(data.conversions.rows)} />
      <RevenusSection data={revenus.value} titles={pageTitles()} />
      <PartnersSection data={data.partners} titles={pageTitles()} />
      <SignupsSection data={data.signups} period={period}>
        <EmailSignupPanels data={data.partners} />
      </SignupsSection>
    </DashboardShell>
  )
}
