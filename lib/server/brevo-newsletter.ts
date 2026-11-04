// @cdc e-mails — appels Brevo de la lettre : attribut WELCOME_SENT, retrait de la liste,
// campagnes mensuelles (création, test, suspension). Clé BREVO_API_KEY dans l'environnement.
// Utilisé par le site (route, actions du tableau de bord) et par scripts/newsletter-monthly.ts.

import { MILO_SENDER } from '@/lib/emails/email-kinds'

const API = 'https://api.brevo.com/v3'

export const WELCOME_ATTRIBUTE = 'WELCOME_SENT'
/** Préfixe du nom des campagnes créées par le script mensuel (repère pour le tableau de bord). */
export const CAMPAIGN_PREFIX = 'Lettre mensuelle'

export function brevoKey(): string | null {
  return process.env.BREVO_API_KEY || null
}

export function listId(): number | null {
  const id = Number(process.env.BREVO_LIST_ID)
  return Number.isInteger(id) && id > 0 ? id : null
}

async function brevo(path: string, init: { method?: string; body?: unknown } = {}): Promise<Response> {
  const key = brevoKey()
  if (!key) throw new Error('brevo-not-configured')
  return fetch(`${API}${path}`, {
    method: init.method ?? 'GET',
    headers: { 'api-key': key, 'content-type': 'application/json', accept: 'application/json' },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: 'no-store',
  })
}

async function fail(res: Response, what: string): Promise<never> {
  const text = await res.text().catch(() => '')
  throw new Error(`[brevo] ${what} status=${res.status} ${text.slice(0, 200)}`)
}

let attributeReady: Promise<void> | null = null

/**
 * Crée l'attribut booléen WELCOME_SENT s'il n'existe pas (idempotent : « déjà présent » est un
 * succès). Lancé une fois par processus, au premier e-mail de bienvenue.
 */
export function ensureWelcomeAttribute(): Promise<void> {
  attributeReady ??= (async () => {
    const res = await brevo(`/contacts/attributes/normal/${WELCOME_ATTRIBUTE}`, { method: 'POST', body: { type: 'boolean' } })
    if (res.ok) return
    const text = await res.text()
    if (res.status === 400 && /exist/i.test(text)) return
    throw new Error(`[brevo] attribut ${WELCOME_ATTRIBUTE} status=${res.status} ${text.slice(0, 200)}`)
  })().catch((err: unknown) => {
    attributeReady = null
    throw err
  })
  return attributeReady
}

/** Lit l'attribut WELCOME_SENT d'un contact. null : contact introuvable. */
export async function welcomeAlreadySent(email: string): Promise<boolean | null> {
  const res = await brevo(`/contacts/${encodeURIComponent(email)}`)
  if (res.status === 404) return null
  if (!res.ok) await fail(res, 'lecture contact')
  const data = (await res.json()) as { attributes?: Record<string, unknown> }
  return data.attributes?.[WELCOME_ATTRIBUTE] === true
}

export async function markWelcomeSent(email: string): Promise<void> {
  const res = await brevo(`/contacts/${encodeURIComponent(email)}`, { method: 'PUT', body: { attributes: { [WELCOME_ATTRIBUTE]: true } } })
  if (!res.ok) await fail(res, 'mise à jour contact')
}

/** Retire l'adresse de la liste de la lettre. Une adresse déjà absente compte comme un succès. */
export async function removeFromList(email: string): Promise<void> {
  // Comme subscribe() : à blanc, Brevo n'est pas appelé (tests, préversion).
  if (process.env.BREVO_DRY_RUN === '1') return
  const id = listId()
  if (!id) throw new Error('brevo-not-configured')
  const res = await brevo(`/contacts/lists/${id}/contacts/remove`, { method: 'POST', body: { emails: [email] } })
  if (res.ok) return
  const text = await res.text()
  // Brevo : « Contact already removed from list and/or does not exist » (400), ou 404.
  if (res.status === 404 || (res.status === 400 && /already removed|does not exist/i.test(text))) return
  throw new Error(`[brevo] retrait liste status=${res.status} ${text.slice(0, 200)}`)
}

export interface CampaignDraft {
  name: string
  subject: string
  previewText: string
  htmlContent: string
  /** ISO 8601 avec décalage horaire (ex. 2026-12-01T18:00:00+01:00) */
  scheduledAt: string
}

/** Crée la campagne programmée sur la liste de la lettre. Renvoie son identifiant. */
export async function createCampaign(d: CampaignDraft): Promise<number> {
  const id = listId()
  const senderEmail = process.env.BREVO_SENDER_EMAIL
  if (!id || !senderEmail) throw new Error('brevo-not-configured')
  const res = await brevo('/emailCampaigns', {
    method: 'POST',
    body: {
      name: d.name,
      subject: d.subject,
      previewText: d.previewText,
      sender: { name: MILO_SENDER, email: senderEmail },
      htmlContent: d.htmlContent,
      recipients: { listIds: [id] },
      scheduledAt: d.scheduledAt,
      tag: 'lettre-mensuelle',
      inlineImageActivation: false,
    },
  })
  if (!res.ok) await fail(res, 'création campagne')
  return ((await res.json()) as { id: number }).id
}

export async function sendCampaignTest(campaignId: number, email: string): Promise<void> {
  const res = await brevo(`/emailCampaigns/${campaignId}/sendTest`, { method: 'POST', body: { emailTo: [email] } })
  if (!res.ok) await fail(res, 'envoi de test')
}

export interface ScheduledCampaign {
  id: number
  name: string
  subject: string
  scheduledAt: string | null
}

/** Campagnes mensuelles programmées (statut « queued »), pour le tableau de bord. */
export async function listScheduledCampaigns(): Promise<ScheduledCampaign[]> {
  const res = await brevo('/emailCampaigns?type=classic&status=queued&limit=20&sort=desc')
  if (!res.ok) await fail(res, 'liste campagnes')
  const data = (await res.json()) as { campaigns?: { id: number; name: string; subject: string; scheduledAt?: string }[] }
  return (data.campaigns ?? [])
    .filter((c) => c.name.startsWith(CAMPAIGN_PREFIX))
    .map((c) => ({ id: c.id, name: c.name, subject: c.subject, scheduledAt: c.scheduledAt ?? null }))
}

/** Suspend une campagne programmée : elle ne part pas, elle reste visible dans Brevo. */
export async function suspendCampaign(campaignId: number): Promise<void> {
  const res = await brevo(`/emailCampaigns/${campaignId}/status`, { method: 'PUT', body: { status: 'suspended' } })
  if (!res.ok) await fail(res, 'suspension campagne')
}
