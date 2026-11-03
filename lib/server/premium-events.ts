import type { ServerEvent } from '@/lib/analytics-events'
import { getPool } from './db'

// @cdc premium — mesure maison des paiements (tableau de bord, onglet Conversions) : début de
// paiement (route Checkout), abonnement actif et fin d'abonnement (webhook Stripe). Propriétés
// limitées à la formule (month/year) et au statut : ni compte, ni e-mail, ni montant individuel.

export type PremiumEventName = Extract<ServerEvent, `Premium ${string}`>

export async function recordPremiumEvent(name: PremiumEventName, props: Record<string, string>): Promise<void> {
  const pool = getPool()
  if (!pool) return
  try {
    await pool.query('INSERT INTO analytics.events (name, page, props, device) VALUES ($1, $2, $3, NULL)', [name, '/premium', JSON.stringify(props)])
  } catch (err) {
    // La mesure ne bloque jamais le paiement.
    console.error('[premium] mesure', err instanceof Error ? err.message : err)
  }
}
