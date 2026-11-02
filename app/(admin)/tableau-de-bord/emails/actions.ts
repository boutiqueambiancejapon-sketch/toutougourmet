'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { dashboardCredentials, isAuthorized } from '@/lib/dashboard/auth'
import { nextFirstTuesday, parisDate, sendInstant } from '@/lib/emails/schedule'
import { weeklyDigestEmail } from '@/lib/emails/weekly'
import { suspendCampaign } from '@/lib/server/brevo-newsletter'
import { getPool } from '@/lib/server/db'
import { sendTransactionalEmail } from '@/lib/server/mailer'
import { sendTestEmail, type TestKind } from '@/lib/server/newsletter'
import { getWeeklyDigestData, lastWeekStart } from '@/lib/server/weekly-digest-data'

// @cdc e-mails — actions du tableau de bord : test vers NEWSLETTER_TEST_EMAIL, suspension d'une
// campagne programmée, résumé hebdomadaire vers OWNER_EMAIL. Chaque action revérifie l'authentification HTTP Basic (point d'entrée public).

async function assertDashboard(): Promise<void> {
  const expected = dashboardCredentials()
  if (!expected || !(await isAuthorized((await headers()).get('authorization'), expected))) throw new Error('Non autorisé')
}

export async function sendTest(kind: TestKind): Promise<void> {
  await assertDashboard()
  const result = await sendTestEmail(kind, sendInstant(nextFirstTuesday(parisDate(new Date()))).date)
  redirect(`/tableau-de-bord/emails/${kind}?test=${result}`)
}

export async function cancelCampaign(campaignId: number): Promise<void> {
  await assertDashboard()
  let result = 'ok'
  try {
    await suspendCampaign(campaignId)
  } catch (err) {
    console.error('[newsletter] annulation', err instanceof Error ? err.message : err)
    result = 'erreur'
  }
  redirect(`/tableau-de-bord/emails/lettre?annulation=${result}`)
}

export async function sendWeeklyTest(): Promise<void> {
  await assertDashboard()
  const pool = getPool()
  const to = process.env.OWNER_EMAIL
  let result = 'config'
  if (pool && to && process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL) {
    try {
      const mail = weeklyDigestEmail(await getWeeklyDigestData(pool, lastWeekStart(new Date())))
      await sendTransactionalEmail({ to, subject: `[Test] ${mail.subject}`, html: mail.html, text: mail.text, tags: ['interne'] })
      result = 'ok'
    } catch (err) {
      console.error('[hebdo] test non envoyé', err instanceof Error ? err.message : err)
      result = 'error'
    }
  }
  redirect(`/tableau-de-bord/emails/hebdo?test=${result}`)
}
