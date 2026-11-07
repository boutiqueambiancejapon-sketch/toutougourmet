'use server'

import { redirect } from 'next/navigation'
import { assertDashboardAction as assertDashboard } from '@/lib/dashboard/guard'
import { REMINDER_STEPS, reminderEmail, type ReminderStep } from '@/lib/emails/account-reminders'
import { nextFirstTuesday, parisDate, sendInstant } from '@/lib/emails/schedule'
import { unsubscribeUrlFromEnv } from '@/lib/emails/unsubscribe'
import { weeklyDigestEmail } from '@/lib/emails/weekly'
import { WELCOME_STEPS, welcomeStepEmail, type WelcomeStep } from '@/lib/emails/welcome-sequence'
import { suspendCampaign } from '@/lib/server/brevo-newsletter'
import { getPool } from '@/lib/server/db'
import { sendTransactionalEmail } from '@/lib/server/mailer'
import { newsletterMailConfigured, sendTestEmail, type TestKind } from '@/lib/server/newsletter'
import { getWeeklyDigestData, lastWeekStart } from '@/lib/server/weekly-digest-data'

// @cdc e-mails — actions du tableau de bord : test vers NEWSLETTER_TEST_EMAIL, suspension d'une
// campagne programmée, résumé hebdomadaire vers OWNER_EMAIL. Chaque action revérifie l'authentification HTTP Basic (point d'entrée public).


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
      await sendTransactionalEmail({ to, subject: `[Test] ${mail.subject}`, html: mail.html, text: mail.text, kind: 'test', tags: ['interne'] })
      result = 'ok'
    } catch (err) {
      console.error('[hebdo] test non envoyé', err instanceof Error ? err.message : err)
      result = 'error'
    }
  }
  redirect(`/tableau-de-bord/emails/hebdo?test=${result}`)
}

/** Test d'une étape de la suite de bienvenue vers NEWSLETTER_TEST_EMAIL (jamais vers la liste). */
export async function sendWelcomeStepTest(step: WelcomeStep): Promise<void> {
  await assertDashboard()
  if (!WELCOME_STEPS.includes(step)) redirect('/tableau-de-bord/emails')
  const to = process.env.NEWSLETTER_TEST_EMAIL
  const unsubscribe = to ? unsubscribeUrlFromEnv(to) : null
  let result = 'config'
  if (to && unsubscribe && newsletterMailConfigured()) {
    try {
      const mail = welcomeStepEmail(step, unsubscribe)
      await sendTransactionalEmail({
        to,
        subject: `[Test] ${mail.subject}`,
        html: mail.html,
        text: mail.text,
        headers: { 'List-Unsubscribe': `<${unsubscribe}>` },
        kind: 'test',
        tags: ['lettre-test'],
      })
      result = 'ok'
    } catch (err) {
      console.error('[bienvenue] test non envoyé', err instanceof Error ? err.message : err)
      result = 'error'
    }
  }
  redirect(`/tableau-de-bord/emails/suite/${step}?test=${result}`)
}

/** Test d'un rappel de compte vers NEWSLETTER_TEST_EMAIL, possible même rappels désactivés. */
export async function sendReminderTest(step: ReminderStep): Promise<void> {
  await assertDashboard()
  if (!REMINDER_STEPS.includes(step)) redirect('/tableau-de-bord/emails')
  const to = process.env.NEWSLETTER_TEST_EMAIL
  const unsubscribe = to ? unsubscribeUrlFromEnv(to) : null
  let result = 'config'
  if (to && unsubscribe && newsletterMailConfigured()) {
    try {
      const mail = reminderEmail(step, unsubscribe)
      await sendTransactionalEmail({
        to,
        subject: `[Test] ${mail.subject}`,
        html: mail.html,
        text: mail.text,
        headers: { 'List-Unsubscribe': `<${unsubscribe}>` },
        kind: 'test',
        tags: ['lettre-test'],
      })
      result = 'ok'
    } catch (err) {
      console.error('[rappels] test non envoyé', err instanceof Error ? err.message : err)
      result = 'error'
    }
  }
  redirect(`/tableau-de-bord/emails/relances/${step}?test=${result}`)
}
