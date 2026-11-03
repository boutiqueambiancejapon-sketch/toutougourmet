import { openTab, type TabPageProps } from '@/lib/dashboard/tab-page'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { EmailLinks } from '@/components/dashboard/EmailLinks'

// @cdc e-mails — onglet E-mails : un lien par aperçu privé (bienvenue, lettre, résumé hebdomadaire).

export const dynamic = 'force-dynamic'

export default async function EmailsTab(props: TabPageProps) {
  const period = await openTab(props)
  return (
    <DashboardShell
      period={period.key}
      current="emails"
      intro="Aperçu exact de chaque e-mail, en largeur ordinateur et mobile, avec un bouton d’envoi de test."
    >
      <EmailLinks />
    </DashboardShell>
  )
}
