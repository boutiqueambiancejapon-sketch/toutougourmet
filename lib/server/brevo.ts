// @cdc mesure — inscription à la newsletter via l'API Brevo (contacts).
// Avec BREVO_DOI_TEMPLATE_ID : double opt-in (e-mail de confirmation envoyé par Brevo).
// Sans : ajout direct à la liste BREVO_LIST_ID. Clé dans l'environnement, jamais dans le code.

const API = 'https://api.brevo.com/v3'
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/i

export function isBrevoConfigured(): boolean {
  return Boolean(process.env.BREVO_API_KEY && process.env.BREVO_LIST_ID)
}

export function isValidEmail(email: unknown): email is string {
  return typeof email === 'string' && email.length <= 254 && EMAIL.test(email)
}

export type SubscribeResult = 'ok' | 'invalid' | 'error'

export async function subscribe(email: string, source: string): Promise<SubscribeResult> {
  if (!isValidEmail(email)) return 'invalid'
  const key = process.env.BREVO_API_KEY ?? ''
  const listId = Number(process.env.BREVO_LIST_ID)
  const doiTemplate = Number(process.env.BREVO_DOI_TEMPLATE_ID || 0)
  const attributes = { SOURCE: source.slice(0, 80) }
  const body = doiTemplate
    ? {
        email,
        attributes,
        includeListIds: [listId],
        templateId: doiTemplate,
        redirectionUrl: process.env.BREVO_DOI_REDIRECT || 'https://www.toutou-gourmet.com/merci',
      }
    : { email, attributes, listIds: [listId], updateEnabled: true }
  try {
    const res = await fetch(`${API}/contacts${doiTemplate ? '/doubleConfirmation' : ''}`, {
      method: 'POST',
      headers: { 'api-key': key, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    })
    if (res.ok) return 'ok'
    // Contact déjà présent : on considère l'inscription comme réussie.
    const text = await res.text()
    if (res.status === 400 && /duplicate/i.test(text)) return 'ok'
    console.error(`[brevo] status=${res.status} ${text.slice(0, 200)}`)
    return 'error'
  } catch (err) {
    console.error('[brevo] fetch failed', err instanceof Error ? err.message : err)
    return 'error'
  }
}
