import { notFound } from 'next/navigation'
import { dashboardAllowed } from '@/lib/dashboard/guard'
import { weeklyDigestEmail } from '@/lib/emails/weekly'
import { getPool } from '@/lib/server/db'
import { getWeeklyDigestData, lastWeekStart } from '@/lib/server/weekly-digest-data'
import { EmailPreview } from '@/components/dashboard/emails/EmailPreview'
import { sendWeeklyTest } from '../actions'

// @cdc e-mails — aperçu privé du résumé hebdomadaire (protégé par proxy.ts) : mêmes chiffres que
// l'envoi du lundi (scripts/weekly-digest.ts), calculés à l'ouverture sur la dernière semaine complète.

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ test?: string | string[] }>
}

export default async function WeeklyPreviewPage({ searchParams }: PageProps) {
  if (!(await dashboardAllowed())) notFound()
  const pool = getPool()
  if (!pool) notFound()
  const test = (await searchParams).test
  const mail = weeklyDigestEmail(await getWeeklyDigestData(pool, lastWeekStart(new Date())))
  return (
    <EmailPreview
      title="Résumé hebdomadaire"
      intro="Envoyé chaque lundi à 8 h 40 (heure de Paris) à l'adresse de OWNER_EMAIL, par la minuterie toutou-weekly. Il résume la semaine du lundi au dimanche qui précèdent."
      subject={mail.subject}
      html={mail.html}
      text={mail.text}
      testAction={sendWeeklyTest}
      testStatus={Array.isArray(test) ? test[0] : test}
      testTarget="OWNER_EMAIL"
      testRequirements="DATABASE_URL, OWNER_EMAIL, BREVO_API_KEY ou BREVO_SENDER_EMAIL"
    />
  )
}
