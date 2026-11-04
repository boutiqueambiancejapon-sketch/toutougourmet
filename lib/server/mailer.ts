// @cdc lot 4 — e-mails transactionnels (vérification d'adresse, mot de passe oublié) via l'API
// Brevo : POST /v3/smtp/email. Clé BREVO_API_KEY, expéditeur BREVO_SENDER_EMAIL / BREVO_SENDER_NAME.
// Sans clé ni expéditeur : en développement (ou avec MAIL_LOG_ONLY=1), l'e-mail est seulement
// journalisé en console ; en production, une erreur est journalisée, sans le lien.
// Chaque e-mail laisse une ligne dans analytics.email_log (empreinte, type, sujet, état), écrite en
// arrière-plan : le journal ne bloque ni ne retarde jamais l'envoi (lib/server/email-log.ts).

import type { EmailKind, EmailLogState } from '@/lib/emails/email-kinds'
import { recordEmailSend } from './email-log'

const API = 'https://api.brevo.com/v3/smtp/email'

export interface TransactionalEmail {
  to: string
  subject: string
  text: string
  html: string
  /** Type écrit dans le journal des envois */
  kind: EmailKind
  /** En-têtes supplémentaires (ex. List-Unsubscribe pour la lettre) */
  headers?: Record<string, string>
  /** Étiquettes Brevo (par défaut : « compte ») */
  tags?: string[]
}

function logOnly(): boolean {
  return process.env.NODE_ENV !== 'production' || process.env.MAIL_LOG_ONLY === '1'
}

async function deliver(mail: TransactionalEmail): Promise<EmailLogState> {
  const key = process.env.BREVO_API_KEY
  const senderEmail = process.env.BREVO_SENDER_EMAIL
  if (!key || !senderEmail || process.env.MAIL_LOG_ONLY === '1') {
    if (logOnly()) {
      console.info(`[mail] (journalisé, non envoyé) à=${mail.to} objet="${mail.subject}"\n${mail.text}`)
      return 'simulated'
    }
    console.error(`[mail] Brevo non configuré (BREVO_API_KEY / BREVO_SENDER_EMAIL) : e-mail "${mail.subject}" non envoyé`)
    throw new Error('mail-not-configured')
  }
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'api-key': key, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      sender: { email: senderEmail, name: process.env.BREVO_SENDER_NAME || 'Toutou Gourmet' },
      to: [{ email: mail.to }],
      subject: mail.subject,
      textContent: mail.text,
      htmlContent: mail.html,
      tags: mail.tags ?? ['compte'],
      ...(mail.headers ? { headers: mail.headers } : {}),
    }),
    cache: 'no-store',
  })
  if (!res.ok) {
    const body = await res.text()
    console.error(`[mail] Brevo status=${res.status} ${body.slice(0, 200)}`)
    throw new Error(`brevo-${res.status}`)
  }
  return 'sent'
}

export async function sendTransactionalEmail(mail: TransactionalEmail): Promise<void> {
  const log = { to: mail.to, kind: mail.kind, subject: mail.subject }
  try {
    recordEmailSend({ ...log, state: await deliver(mail) })
  } catch (err) {
    recordEmailSend({ ...log, state: 'failed' })
    throw err
  }
}
