import { guideEmail } from '@/lib/emails/guide'
import { unsubscribeUrlFromEnv } from '@/lib/emails/unsubscribe'
import { bookSummary } from '@/lib/guide/book'
import { getPool } from './db'
import { emailHash, emailHashSecret } from './email-hash'
import { sendTransactionalEmail } from './mailer'
import { overLimit } from './rate-window'

// @cdc guide — e-mail du guide après une inscription avec la source « guide ». Part même quand
// la bienvenue générale est coupée (WELCOME_EMAIL_ENABLED), mais une seule fois par adresse :
// trace dans analytics.guide_sends (empreinte HMAC de l'adresse, jamais l'adresse elle-même ;
// en mémoire seulement sans base). Limite de débit : 3 par adresse réseau et par jour, 60 par
// heure et 300 par jour pour tout le site (borne la facture Brevo si un robot insiste).
// Ne lève jamais d'erreur : l'inscription a déjà réussi.

export type GuideMailResult = 'sent' | 'already' | 'limited' | 'error'

const PER_IP = [{ windowMs: 24 * 60 * 60_000, max: 3 }] as const
const SITE_WIDE = [
  { windowMs: 60 * 60_000, max: 60 },
  { windowMs: 24 * 60 * 60_000, max: 300 },
] as const

const sentInMemory = new Set<string>()
const inFlight = new Set<string>()

/** Réserve l'envoi pour cette adresse. false : déjà envoyé. */
async function claim(key: string): Promise<boolean> {
  const pool = getPool()
  if (!pool) {
    if (sentInMemory.has(key)) return false
    sentInMemory.add(key)
    return true
  }
  const res = await pool.query('INSERT INTO analytics.guide_sends (email_hash) VALUES ($1) ON CONFLICT DO NOTHING', [key])
  return res.rowCount === 1
}

/** Envoi raté : l'adresse pourra redemander le guide. */
async function release(key: string): Promise<void> {
  sentInMemory.delete(key)
  await getPool()?.query('DELETE FROM analytics.guide_sends WHERE email_hash = $1', [key])
}

export async function sendGuideOnce(rawEmail: string, ip: string): Promise<GuideMailResult> {
  const email = rawEmail.trim().toLowerCase()
  const key = emailHash(email, emailHashSecret())
  if (inFlight.has(key)) return 'already'
  if (overLimit(`guide-mail:${ip}`, PER_IP) || overLimit('guide-mail:site', SITE_WIDE)) {
    console.warn('[guide] e-mail non envoyé : limite de débit atteinte')
    return 'limited'
  }
  inFlight.add(key)
  let claimed = false
  try {
    claimed = await claim(key)
    if (!claimed) return 'already'
    const { foodCount, recipeCount } = bookSummary()
    const unsubscribeUrl = unsubscribeUrlFromEnv(email) ?? undefined
    const mail = guideEmail({ foodCount, recipeCount, unsubscribeUrl })
    await sendTransactionalEmail({
      to: email,
      ...mail,
      headers: unsubscribeUrl ? { 'List-Unsubscribe': `<${unsubscribeUrl}>` } : undefined,
      kind: 'guide',
      tags: ['guide'],
    })
    return 'sent'
  } catch (err) {
    console.error('[guide] e-mail non envoyé', err instanceof Error ? err.message : err)
    if (claimed) await release(key).catch(() => undefined)
    return 'error'
  } finally {
    inFlight.delete(key)
  }
}
