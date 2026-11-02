import { createHmac, timingSafeEqual } from 'node:crypto'
import { SITE_URL } from '@/lib/i18n/config'

// @cdc e-mails — lien de désinscription signé : /newsletter/desinscription?e=<adresse>&t=<HMAC>.
// HMAC-SHA256 de l'adresse en minuscules, clé NEWSLETTER_SECRET (environnement, jamais dans le code).
// Fonctions pures (le secret est passé en argument) : testées par scripts/test-emails.ts.

export const UNSUBSCRIBE_PATH = '/newsletter/desinscription'

const normalize = (email: string): string => email.trim().toLowerCase()

export function unsubscribeToken(email: string, secret: string): string {
  return createHmac('sha256', secret).update(normalize(email)).digest('base64url')
}

export function verifyUnsubscribeToken(email: string, token: string, secret: string): boolean {
  if (!secret || !email || !token) return false
  const expected = Buffer.from(unsubscribeToken(email, secret))
  const given = Buffer.from(token)
  return expected.length === given.length && timingSafeEqual(expected, given)
}

export function buildUnsubscribeUrl(email: string, secret: string): string {
  const params = new URLSearchParams({ e: normalize(email), t: unsubscribeToken(email, secret) })
  return `${SITE_URL}${UNSUBSCRIBE_PATH}?${params.toString()}`
}

/** Lien signé avec NEWSLETTER_SECRET, ou null si le secret manque (aucun e-mail ne part alors). */
export function unsubscribeUrlFromEnv(email: string): string | null {
  const secret = process.env.NEWSLETTER_SECRET
  return secret ? buildUnsubscribeUrl(email, secret) : null
}
