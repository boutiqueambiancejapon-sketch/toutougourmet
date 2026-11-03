import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { sendNtfy } from '@/lib/server/alerts/notify'
import { pgBillingStore } from '@/lib/server/billing-store'
import { billingReady } from '@/lib/server/membership'
import { recordPremiumEvent } from '@/lib/server/premium-events'
import { getStripe, stripeConfig, stripeErrorSummary } from '@/lib/server/stripe'
import { handleStripeEvent, type WebhookDeps } from '@/lib/server/stripe-webhook'

// @cdc premium — point d'entrée du webhook Stripe. Corps brut lu tel quel puis signature vérifiée
// (constructEvent avec STRIPE_WEBHOOK_SECRET) avant tout traitement. Réponses : 200 traité ou déjà
// traité, 400 signature absente ou fausse, 503 paiement pas configuré ou migration 0009 absente,
// 500 erreur de traitement (Stripe renvoie l'événement plus tard). Rien de secret dans le journal.

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const log = (message: string) => console.log(`[stripe] ${message}`)

function deps(stripe: Stripe): WebhookDeps {
  return {
    store: pgBillingStore,
    retrieveSubscription: (id) => stripe.subscriptions.retrieve(id),
    retrieveCharge: (id) => stripe.charges.retrieve(id),
    async alert(title, message) {
      if (!process.env.NTFY_TOPIC) return log(`alerte non envoyée (NTFY_TOPIC absent) : ${title}`)
      await sendNtfy({ title, message, priority: 4, tags: ['credit_card'], click: 'https://dashboard.stripe.com' })
    },
    record: recordPremiumEvent,
    log,
    now: () => new Date(),
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const cfg = stripeConfig()
  const stripe = getStripe()
  if (!cfg || !stripe) return NextResponse.json({ error: 'payments_disabled' }, { status: 503 })
  if (!(await billingReady())) return NextResponse.json({ error: 'migration_missing' }, { status: 503 })

  const signature = request.headers.get('stripe-signature')
  if (!signature) return NextResponse.json({ error: 'missing_signature' }, { status: 400 })
  const body = await request.text()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, cfg.webhookSecret)
  } catch {
    log('signature refusée')
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 })
  }

  try {
    const outcome = await handleStripeEvent(event, deps(stripe))
    if (outcome !== 'ignored') log(`${event.type} ${event.id} : ${outcome === 'processed' ? 'traité' : 'déjà traité'}`)
    return NextResponse.json({ received: true })
  } catch (err) {
    console.error(`[stripe] ${event.type} ${event.id} en échec : ${stripeErrorSummary(err)}`)
    return NextResponse.json({ error: 'processing_failed' }, { status: 500 })
  }
}
