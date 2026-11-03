import Stripe from 'stripe'

// @cdc premium — client Stripe côté serveur (règles du plugin Stripe : une instance, jamais de clé
// globale, version d'API figée). Clé restreinte `rk_…` rangée dans /srv/toutou/shared/.env, jamais
// dans le dépôt ni dans un journal. Sans l'une des quatre variables, le paiement est désactivé :
// stripeConfig() renvoie null, les boutons de paiement sont masqués, aucune erreur.

export const STRIPE_API_VERSION = '2026-10-28.endive' as const

/** Étiquette des sessions Checkout dans le Dashboard (suffixe de 8 lettres, règle Stripe). */
export const CHECKOUT_INTEGRATION_ID = 'toutou-premium-qkvbrwze'

export interface StripeConfig {
  secretKey: string
  webhookSecret: string
  prices: { month: string; year: string }
}

/** Les quatre variables, ou null si l'une manque ou n'a pas la bonne forme. */
export function stripeConfig(env: Record<string, string | undefined> = process.env): StripeConfig | null {
  const secretKey = env.STRIPE_SECRET_KEY?.trim()
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET?.trim()
  const month = env.STRIPE_PRICE_MONTHLY?.trim()
  const year = env.STRIPE_PRICE_YEARLY?.trim()
  if (!secretKey || !webhookSecret || !month || !year) return null
  if (!/^(rk|sk)_(test|live)_/.test(secretKey) || !webhookSecret.startsWith('whsec_')) return null
  if (!month.startsWith('price_') || !year.startsWith('price_')) return null
  return { secretKey, webhookSecret, prices: { month, year } }
}

export function stripeConfigured(): boolean {
  return stripeConfig() !== null
}

const globalForStripe = globalThis as unknown as { tgStripe?: { key: string; client: Stripe } }

/** Instance partagée, créée à la première utilisation ; null si le paiement n'est pas configuré. */
export function getStripe(): Stripe | null {
  const cfg = stripeConfig()
  if (!cfg) return null
  const cached = globalForStripe.tgStripe
  if (cached && cached.key === cfg.secretKey) return cached.client
  const client = new Stripe(cfg.secretKey, {
    apiVersion: STRIPE_API_VERSION,
    appInfo: { name: 'Toutou Gourmet', url: 'https://www.toutou-gourmet.com' },
    maxNetworkRetries: 2,
    timeout: 20_000,
  })
  globalForStripe.tgStripe = { key: cfg.secretKey, client }
  return client
}

/** Message d'erreur Stripe sans donnée sensible (type et code seulement) pour le journal. */
export function stripeErrorSummary(err: unknown): string {
  if (err instanceof Stripe.errors.StripeError) return `${err.type}${err.code ? ` (${err.code})` : ''}${err.statusCode ? ` HTTP ${err.statusCode}` : ''}`
  return err instanceof Error ? err.name : 'erreur inconnue'
}
