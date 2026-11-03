import { eq, sql } from 'drizzle-orm'
import { membership, stripeEvent, user } from '@/db/schema'
import { subscriptionGivesAccess } from '@/lib/premium/access'
import type { BillingStore, BillingTx, SubscriptionSnapshot } from './stripe-webhook'
import { getDb, type Db } from './drizzle'

// @cdc premium — écritures Stripe dans app.membership et app.stripe_event (migration 0009).
// Un événement = une transaction : l'identifiant est inséré d'abord ; s'il existe déjà, rien
// n'est refait (idempotence). Si le traitement échoue, la transaction est annulée et Stripe
// renverra l'événement plus tard.

type Tx = Parameters<Parameters<Db['transaction']>[0]>[0]

function db(): Db {
  const d = getDb()
  if (!d) throw new Error('DATABASE_URL manquant')
  return d
}

function txApi(tx: Tx): BillingTx {
  return {
    async userIdByCustomer(customerId) {
      const [row] = await tx.select({ id: membership.userId }).from(membership).where(eq(membership.stripeCustomerId, customerId)).limit(1)
      return row?.id ?? null
    },
    async userIdBySubscription(subscriptionId) {
      const [row] = await tx.select({ id: membership.userId }).from(membership).where(eq(membership.stripeSubscriptionId, subscriptionId)).limit(1)
      return row?.id ?? null
    },
    async userExists(userId) {
      const [row] = await tx.select({ id: user.id }).from(user).where(eq(user.id, userId)).limit(1)
      return !!row
    },
    async getRow(userId) {
      const [row] = await tx
        .select({ source: membership.source, status: membership.status, subscriptionId: membership.stripeSubscriptionId })
        .from(membership)
        .where(eq(membership.userId, userId))
        .limit(1)
      return row ?? null
    },
    async saveSubscription(userId, snap, now) {
      const access = subscriptionGivesAccess(snap.status)
      const set = {
        source: 'stripe' as const,
        plan: access ? ('premium' as const) : ('free' as const),
        stripeCustomerId: snap.customerId,
        stripeSubscriptionId: snap.id,
        status: snap.status,
        billingInterval: snap.interval,
        currentPeriodEnd: snap.currentPeriodEnd,
        cancelAtPeriodEnd: snap.cancelAtPeriodEnd,
        updatedAt: now,
      }
      await tx
        .insert(membership)
        .values({ userId, ...set, activatedAt: access ? now : null })
        .onConflictDoUpdate({
          target: membership.userId,
          set: {
            ...set,
            // Date d'activation gardée tant que l'accès continue ; remise à jour à un nouveau départ.
            activatedAt: access
              ? sql`CASE WHEN ${membership.source} = 'stripe' AND ${membership.status} IN ('active', 'trialing', 'past_due') THEN ${membership.activatedAt} ELSE ${now} END`
              : membership.activatedAt,
          },
        })
    },
  }
}

export const pgBillingStore: BillingStore = {
  async once(eventId, type, fn) {
    return db().transaction(async (tx) => {
      const inserted = await tx.insert(stripeEvent).values({ id: eventId, type }).onConflictDoNothing().returning({ id: stripeEvent.id })
      if (inserted.length === 0) return false
      await fn(txApi(tx))
      return true
    })
  },
}

/** Rattache le client Stripe au compte avant le paiement (ligne créée si besoin, formule inchangée). */
export async function attachCustomer(userId: string, customerId: string, waiverAt: Date): Promise<void> {
  await db()
    .insert(membership)
    .values({ userId, plan: 'free', source: 'stripe', stripeCustomerId: customerId, withdrawalWaiverAt: waiverAt })
    .onConflictDoUpdate({
      target: membership.userId,
      set: { stripeCustomerId: sql`coalesce(${membership.stripeCustomerId}, ${customerId})`, withdrawalWaiverAt: waiverAt },
    })
}

export type { SubscriptionSnapshot }
