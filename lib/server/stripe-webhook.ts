import type Stripe from 'stripe'
import { subscriptionGivesAccess } from '@/lib/premium/access'
import { formatEuros } from '@/lib/premium/pricing'

// @cdc premium — traitement des événements Stripe (webhook /api/stripe/webhook, seule source de
// vérité de l'abonnement). Le compte se retrouve par les objets Stripe : Customer puis Subscription
// enregistrés sur app.membership ; les métadonnées (userId) et client_reference_id ne servent qu'en
// repli. L'abonnement est toujours relu chez Stripe avant d'être recopié : l'ordre d'arrivée des
// événements ne compte pas. Dépendances injectées : testé sans clé ni base
// (scripts/test-stripe-premium.ts).

export const HANDLED_EVENTS = [
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
  'invoice.payment_failed',
  'charge.refunded',
  'charge.dispute.created',
  'radar.early_fraud_warning.created',
] as const

export type PremiumServerEvent = 'Premium Subscribed' | 'Premium Canceled'

export interface SubscriptionSnapshot {
  id: string
  customerId: string
  status: string
  interval: 'month' | 'year' | null
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
  metadataUserId: string | null
}

export interface BillingTx {
  userIdByCustomer(customerId: string): Promise<string | null>
  userIdBySubscription(subscriptionId: string): Promise<string | null>
  userExists(userId: string): Promise<boolean>
  getRow(userId: string): Promise<{ source: string; status: string | null; subscriptionId: string | null } | null>
  saveSubscription(userId: string, snap: SubscriptionSnapshot, now: Date): Promise<void>
}

export interface BillingStore {
  /** Exécute fn une seule fois par identifiant d'événement ; false si déjà traité. */
  once(eventId: string, type: string, fn: (tx: BillingTx) => Promise<void>): Promise<boolean>
}

export interface WebhookDeps {
  store: BillingStore
  retrieveSubscription(id: string): Promise<Stripe.Subscription>
  retrieveCharge(id: string): Promise<Stripe.Charge>
  alert(title: string, message: string): Promise<void>
  record(name: PremiumServerEvent, props: Record<string, string>): Promise<void>
  log(message: string): void
  now(): Date
}

export type WebhookOutcome = 'processed' | 'duplicate' | 'ignored'

type Effect = () => Promise<void>

const idOf = (v: string | { id: string } | null | undefined): string | null => (v == null ? null : typeof v === 'string' ? v : v.id)

export function snapshotOf(sub: Stripe.Subscription): SubscriptionSnapshot {
  const items = sub.items?.data ?? []
  const ends = items.map((i) => i.current_period_end).filter((n): n is number => typeof n === 'number')
  const interval: string | undefined = items[0]?.price?.recurring?.interval
  return {
    id: sub.id,
    customerId: idOf(sub.customer) ?? '',
    status: sub.status,
    interval: interval === 'month' || interval === 'year' ? interval : null,
    currentPeriodEnd: ends.length > 0 ? new Date(Math.max(...ends) * 1000) : null,
    cancelAtPeriodEnd: sub.cancel_at_period_end || sub.cancel_at != null,
    metadataUserId: sub.metadata?.userId || null,
  }
}

const dashboard = (event: Stripe.Event, path: string) => `https://dashboard.stripe.com/${event.livemode ? '' : 'test/'}${path}`

async function resolveUser(tx: BillingTx, snap: SubscriptionSnapshot, fallbackUserId: string | null, deps: WebhookDeps): Promise<string | null> {
  const byObject = (await tx.userIdByCustomer(snap.customerId)) ?? (await tx.userIdBySubscription(snap.id))
  if (byObject) return byObject
  for (const candidate of [fallbackUserId, snap.metadataUserId]) {
    if (candidate && (await tx.userExists(candidate))) {
      deps.log(`compte retrouvé par repli (métadonnées) pour l'abonnement ${snap.id}`)
      return candidate
    }
  }
  return null
}

/** Relit l'abonnement chez Stripe et le recopie sur le compte. */
async function syncSubscription(tx: BillingTx, deps: WebhookDeps, subscriptionId: string, fallbackUserId: string | null, effects: Effect[]): Promise<void> {
  const snap = snapshotOf(await deps.retrieveSubscription(subscriptionId))
  const userId = await resolveUser(tx, snap, fallbackUserId, deps)
  if (!userId) {
    deps.log(`abonnement ${snap.id} sans compte correspondant (compte supprimé ?), ignoré`)
    return
  }
  const row = await tx.getRow(userId)
  const before = row?.source === 'stripe' && subscriptionGivesAccess(row.status)
  const after = subscriptionGivesAccess(snap.status)
  // Un ancien abonnement qui se termine n'écrase pas un abonnement plus récent encore actif.
  if (row?.subscriptionId && row.subscriptionId !== snap.id && before && !after) {
    deps.log(`abonnement ${snap.id} ancien, le compte a ${row.subscriptionId} actif : ignoré`)
    return
  }
  await tx.saveSubscription(userId, snap, deps.now())
  const props = { interval: snap.interval ?? 'inconnu' }
  if (!before && after) effects.push(() => deps.record('Premium Subscribed', props))
  if (before && !after) effects.push(() => deps.record('Premium Canceled', { ...props, status: snap.status }))
}

async function chargeContext(deps: WebhookDeps, chargeId: string | null): Promise<string> {
  if (!chargeId) return ''
  try {
    const charge = await deps.retrieveCharge(chargeId)
    return ` Paiement de ${formatEuros(charge.amount)}${idOf(charge.customer) ? ', client Stripe connu' : ''}.`
  } catch {
    return ''
  }
}

async function applyEvent(event: Stripe.Event, tx: BillingTx, deps: WebhookDeps, effects: Effect[]): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      const session = event.data.object
      if (session.mode !== 'subscription') return
      // Moyen de paiement différé : la session est « complétée » avant que l'argent n'arrive.
      if (session.payment_status === 'unpaid') return
      const subscriptionId = idOf(session.subscription)
      if (subscriptionId) await syncSubscription(tx, deps, subscriptionId, session.client_reference_id ?? session.metadata?.userId ?? null, effects)
      return
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await syncSubscription(tx, deps, event.data.object.id, null, effects)
      return
    case 'invoice.paid':
    case 'invoice.payment_failed': {
      const invoice = event.data.object
      const subscriptionId = idOf(invoice.parent?.subscription_details?.subscription)
      if (subscriptionId) await syncSubscription(tx, deps, subscriptionId, null, effects)
      if (event.type === 'invoice.payment_failed' && (invoice.attempt_count ?? 0) >= 2) {
        const message = `Échec n° ${invoice.attempt_count} du paiement d'une facture Premium (${formatEuros(invoice.amount_due)}). Stripe relance selon les réglages de Billing.`
        effects.push(() => deps.alert('Toutou Gourmet : paiement Premium en échec', `${message}\n${dashboard(event, `invoices/${invoice.id}`)}`))
      }
      return
    }
    case 'charge.refunded': {
      const charge = event.data.object
      deps.log(`remboursement de ${formatEuros(charge.amount_refunded)} sur ${charge.id}`)
      return
    }
    case 'charge.dispute.created': {
      const dispute = event.data.object
      const due = dispute.evidence_details?.due_by ? new Date(dispute.evidence_details.due_by * 1000).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' }) : null
      const context = await chargeContext(deps, idOf(dispute.charge))
      const message = `Litige ouvert sur ${formatEuros(dispute.amount)} (motif : ${dispute.reason}).${context}${due ? ` Réponse attendue avant le ${due}.` : ''}`
      effects.push(() => deps.alert('Toutou Gourmet : litige Stripe', `${message}\n${dashboard(event, `disputes/${dispute.id}`)}`))
      return
    }
    case 'radar.early_fraud_warning.created': {
      const warning = event.data.object
      const context = await chargeContext(deps, idOf(warning.charge))
      const message = `Alerte de fraude précoce (${warning.fraud_type}).${context} Stripe conseille de rembourser et de résilier avant un litige.`
      effects.push(() => deps.alert('Toutou Gourmet : fraude signalée', `${message}\n${dashboard(event, `radar/early-fraud-warnings/${warning.id}`)}`))
      return
    }
    default:
      return
  }
}

export async function handleStripeEvent(event: Stripe.Event, deps: WebhookDeps): Promise<WebhookOutcome> {
  if (!(HANDLED_EVENTS as readonly string[]).includes(event.type)) return 'ignored'
  const effects: Effect[] = []
  const fresh = await deps.store.once(event.id, event.type, (tx) => applyEvent(event, tx, deps, effects))
  if (!fresh) return 'duplicate'
  // Alertes et mesures après validation de la transaction : jamais pour un traitement annulé.
  for (const run of effects) {
    try {
      await run()
    } catch (err) {
      deps.log(`effet secondaire en échec : ${err instanceof Error ? err.message : 'inconnu'}`)
    }
  }
  return 'processed'
}
