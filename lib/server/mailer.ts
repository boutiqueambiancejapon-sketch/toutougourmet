// @cdc lot 4 — e-mails transactionnels (vérification d'adresse, mot de passe oublié) via l'API
// Brevo : POST /v3/smtp/email. Clé BREVO_API_KEY, expéditeur BREVO_SENDER_EMAIL / BREVO_SENDER_NAME.
// Sans clé ni expéditeur : en développement (ou avec MAIL_LOG_ONLY=1), l'e-mail est seulement
// journalisé en console ; en production, une erreur est journalisée, sans le lien.

const API = 'https://api.brevo.com/v3/smtp/email'

export interface TransactionalEmail {
  to: string
  subject: string
  text: string
  html: string
  /** En-têtes supplémentaires (ex. List-Unsubscribe pour la lettre) */
  headers?: Record<string, string>
  /** Étiquettes Brevo (par défaut : « compte ») */
  tags?: string[]
}

function logOnly(): boolean {
  return process.env.NODE_ENV !== 'production' || process.env.MAIL_LOG_ONLY === '1'
}

export async function sendTransactionalEmail(mail: TransactionalEmail): Promise<void> {
  const key = process.env.BREVO_API_KEY
  const senderEmail = process.env.BREVO_SENDER_EMAIL
  if (!key || !senderEmail || process.env.MAIL_LOG_ONLY === '1') {
    if (logOnly()) {
      console.info(`[mail] (journalisé, non envoyé) à=${mail.to} objet="${mail.subject}"\n${mail.text}`)
      return
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
}
