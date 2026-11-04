import { notFound } from 'next/navigation'
import { dashboardAllowed } from '@/lib/dashboard/guard'
import { accountRemindersEnabled, REMINDER_DAY, REMINDER_LABEL, REMINDER_STEPS, reminderEmail, type ReminderStep } from '@/lib/emails/account-reminders'
import { buildUnsubscribeUrl } from '@/lib/emails/unsubscribe'
import { EmailPreview } from '@/components/dashboard/emails/EmailPreview'
import { sendReminderTest } from '../../actions'

// @cdc e-mails — aperçu privé d'un rappel de compte, à valider par le propriétaire avant toute
// activation. Le lien de désinscription de l'aperçu est signé pour une adresse fictive.

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ etape: string }>
  searchParams: Promise<{ test?: string | string[] }>
}

const isStep = (v: string): v is ReminderStep => (REMINDER_STEPS as readonly string[]).includes(v)

const WHO: Record<ReminderStep, string> = {
  'compte-j4': 'Envoyé 4 jours après l’inscription à la lettre, sauté si l’adresse a déjà un compte.',
  'chien-j1': `Envoyé ${REMINDER_DAY['chien-j1']} jour après la création d’un compte confirmé, sauté dès qu’un chien est ajouté.`,
  'chien-j4': `Envoyé ${REMINDER_DAY['chien-j4']} jours après la création d’un compte confirmé, sauté dès qu’un chien est ajouté. Dernier rappel sur ce sujet.`,
}

export default async function ReminderPreviewPage({ params, searchParams }: PageProps) {
  if (!(await dashboardAllowed())) notFound()
  const { etape } = await params
  if (!isStep(etape)) notFound()
  const test = (await searchParams).test
  const mail = reminderEmail(etape, buildUnsubscribeUrl('apercu@example.com', process.env.NEWSLETTER_SECRET || 'apercu'))
  const state = accountRemindersEnabled() ? 'Activé (ACCOUNT_REMINDERS_ENABLED=1).' : 'Désactivé : rien ne part tant que ACCOUNT_REMINDERS_ENABLED=1 n’est pas posée.'
  return (
    <EmailPreview
      title={`Rappel · ${REMINDER_LABEL[etape]}`}
      intro={`${WHO[etape]} ${state}`}
      subject={mail.subject}
      html={mail.html}
      text={mail.text}
      testAction={sendReminderTest.bind(null, etape)}
      testStatus={Array.isArray(test) ? test[0] : test}
    />
  )
}
