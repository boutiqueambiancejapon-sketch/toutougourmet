import { createHmac } from 'node:crypto'

// @cdc e-mails — empreinte d'une adresse, la seule trace gardée dans analytics.guide_sends,
// welcome_sends, email_log et email_optouts : HMAC-SHA256 de l'adresse en minuscules, jamais
// l'adresse. Le tableau de bord la retrouve en recalculant l'empreinte des adresses connues.

export function emailHash(email: string, secret: string): string {
  return createHmac('sha256', secret).update(email.trim().toLowerCase()).digest('hex')
}

/** Clé de l'empreinte, dans le même ordre que les traces déjà écrites par l'e-mail du guide. */
export function emailHashSecret(): string {
  return process.env.NEWSLETTER_SECRET || process.env.BETTER_AUTH_SECRET || 'toutou-guide'
}
