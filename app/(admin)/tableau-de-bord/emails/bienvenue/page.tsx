import { notFound } from 'next/navigation'
import { dashboardCredentials } from '@/lib/dashboard/auth'
import { buildUnsubscribeUrl } from '@/lib/emails/unsubscribe'
import { welcomeEmail } from '@/lib/emails/welcome'
import { EmailPreview } from '@/components/dashboard/emails/EmailPreview'
import { sendTest } from '../actions'

// @cdc e-mails — aperçu privé de l'e-mail de bienvenue (protégé par proxy.ts). Le lien de
// désinscription de l'aperçu est signé pour une adresse fictive ; le test utilise la vraie.

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ test?: string | string[] }>
}

export default async function WelcomePreviewPage({ searchParams }: PageProps) {
  if (!dashboardCredentials()) notFound()
  const test = (await searchParams).test
  const mail = welcomeEmail(buildUnsubscribeUrl('apercu@example.com', process.env.NEWSLETTER_SECRET || 'apercu'))
  return (
    <EmailPreview
      title="E-mail de bienvenue"
      intro="Envoyé une seule fois par adresse, juste après une inscription à la lettre (attribut Brevo WELCOME_SENT). Pas d'envoi en double opt-in ni sans BREVO_SENDER_EMAIL et NEWSLETTER_SECRET."
      subject={mail.subject}
      html={mail.html}
      text={mail.text}
      testAction={sendTest.bind(null, 'bienvenue')}
      testStatus={Array.isArray(test) ? test[0] : test}
    />
  )
}
