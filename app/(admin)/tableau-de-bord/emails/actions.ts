'use server'

import { redirect } from 'next/navigation'
import { assertDashboardAction as assertDashboard } from '@/lib/dashboard/guard'
import { nextFirstTuesday, parisDate, sendInstant } from '@/lib/emails/schedule'
import { suspendCampaign } from '@/lib/server/brevo-newsletter'
import { sendTestEmail, type TestKind } from '@/lib/server/newsletter'

// @cdc e-mails — actions du tableau de bord : test vers NEWSLETTER_TEST_EMAIL, suspension d'une
// campagne programmée. Chaque action revérifie l'authentification HTTP Basic (point d'entrée public).


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
