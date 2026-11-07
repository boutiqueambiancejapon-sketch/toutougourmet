import { notFound } from 'next/navigation'
import { dashboardAllowed } from '@/lib/dashboard/guard'
import { buildUnsubscribeUrl } from '@/lib/emails/unsubscribe'
import { STEP_DAY, STEP_LABEL, WELCOME_STEPS, welcomeStepEmail, type WelcomeStep } from '@/lib/emails/welcome-sequence'
import { EmailPreview } from '@/components/dashboard/emails/EmailPreview'
import { sendWelcomeStepTest } from '../../actions'

// @cdc e-mails — aperçu privé d'une étape de la suite de bienvenue (J2, J5, J10). Le lien de
// désinscription de l'aperçu est signé pour une adresse fictive ; le test utilise la vraie.

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ etape: string }>
  searchParams: Promise<{ test?: string | string[] }>
}

const isStep = (v: string): v is WelcomeStep => (WELCOME_STEPS as readonly string[]).includes(v)

export default async function WelcomeStepPreviewPage({ params, searchParams }: PageProps) {
  if (!(await dashboardAllowed())) notFound()
  const { etape } = await params
  if (!isStep(etape)) notFound()
  const test = (await searchParams).test
  const mail = welcomeStepEmail(etape, buildUnsubscribeUrl('apercu@example.com', process.env.NEWSLETTER_SECRET || 'apercu'))
  const started = process.env.WELCOME_SEQUENCE_START
  return (
    <EmailPreview
      title={`Suite de bienvenue · ${STEP_LABEL[etape]}`}
      intro={`Envoyé ${STEP_DAY[etape]} jours après l’inscription, une fois par adresse (table analytics.welcome_sends), par scripts/welcome-sequence.ts chaque jour à 10 h 17. Seulement si WELCOME_EMAIL_ENABLED=1 et WELCOME_SEQUENCE_START posés, aux contacts inscrits depuis cette date${started ? ` (actuellement ${started})` : ' (non posée : rien ne part)'}.`}
      subject={mail.subject}
      html={mail.html}
      text={mail.text}
      testAction={sendWelcomeStepTest.bind(null, etape)}
      testStatus={Array.isArray(test) ? test[0] : test}
    />
  )
}
