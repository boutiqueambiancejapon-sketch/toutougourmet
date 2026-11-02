import { notFound } from 'next/navigation'
import { dashboardCredentials } from '@/lib/dashboard/auth'
import { nextFirstTuesday, parisDate, sendInstant } from '@/lib/emails/schedule'
import { brevoKey, listScheduledCampaigns, type ScheduledCampaign } from '@/lib/server/brevo-newsletter'
import { monthlyNewsletterFor } from '@/lib/server/newsletter'
import { CampaignList } from '@/components/dashboard/emails/CampaignList'
import { EmailPreview } from '@/components/dashboard/emails/EmailPreview'
import { cancelCampaign, sendTest } from '../actions'

// @cdc e-mails — aperçu privé de la prochaine lettre mensuelle (HTML exact de la campagne, balise
// Brevo de désinscription comprise) et campagnes programmées, annulables (protégé par proxy.ts).

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ test?: string | string[]; annulation?: string | string[] }>
}

const dayFmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full', timeZone: 'Europe/Paris' })
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

async function loadCampaigns(): Promise<ScheduledCampaign[] | null> {
  if (!brevoKey()) return null
  return listScheduledCampaigns().catch((err: unknown) => {
    console.error('[newsletter] campagnes', err instanceof Error ? err.message : err)
    return null
  })
}

export default async function MonthlyPreviewPage({ searchParams }: PageProps) {
  if (!dashboardCredentials()) notFound()
  const sp = await searchParams
  const send = sendInstant(nextFirstTuesday(parisDate(new Date())))
  const [mail, campaigns] = await Promise.all([monthlyNewsletterFor(send.date), loadCampaigns()])
  return (
    <EmailPreview
      title="Lettre mensuelle"
      intro={`Prochain envoi prévu le ${dayFmt.format(send.date)} à 18 h. Le lien « Se désinscrire » est la balise de Brevo, remplacée à l'envoi ; le test reçoit un lien signé.`}
      subject={mail.subject}
      previewText={mail.previewText}
      html={mail.html}
      text={mail.text}
      testAction={sendTest.bind(null, 'lettre')}
      testStatus={first(sp.test)}
    >
      <CampaignList campaigns={campaigns} cancel={(id) => cancelCampaign.bind(null, id)} notice={first(sp.annulation)} />
    </EmailPreview>
  )
}
