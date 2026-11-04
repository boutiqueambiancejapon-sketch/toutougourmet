'use server'

import { redirect } from 'next/navigation'
import { UNSUBSCRIBE_PATH, verifyUnsubscribeToken } from '@/lib/emails/unsubscribe'
import { removeFromList } from '@/lib/server/brevo-newsletter'
import { recordOptOut } from '@/lib/server/email-optouts'

// @cdc e-mails — désinscription : le jeton signé est revérifié ici (une action serveur est un
// point d'entrée public), puis l'adresse est retirée de la liste Brevo de la lettre et notée dans
// analytics.email_optouts (rappels de compte, y compris pour une adresse absente de la liste).

export async function unsubscribe(form: FormData): Promise<void> {
  const email = String(form.get('e') ?? '')
  const token = String(form.get('t') ?? '')
  const params = new URLSearchParams({ e: email, t: token })
  if (!verifyUnsubscribeToken(email, token, process.env.NEWSLETTER_SECRET ?? '')) redirect(`${UNSUBSCRIBE_PATH}?${params.toString()}`)
  let status = (await recordOptOut(email)) ? 'fait' : 'erreur'
  try {
    await removeFromList(email)
  } catch (err) {
    console.error('[newsletter] désinscription', err instanceof Error ? err.message : err)
    status = 'erreur'
  }
  params.set('etat', status)
  redirect(`${UNSUBSCRIBE_PATH}?${params.toString()}`)
}
