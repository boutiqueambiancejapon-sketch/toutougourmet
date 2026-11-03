import { sql } from 'drizzle-orm'
import { boolean, check, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { app } from './app'
import { user } from './auth'

// @cdc premium — formule du compte. Une ligne par compte au plus (user_id en clé primaire) ;
// pas de ligne = gratuit. Deux origines : `launch-free` (Premium offert pendant le lancement,
// valable jusqu'à PREMIUM_LAUNCH_ENDS_AT) et `stripe` (abonnement payant, état recopié par le
// webhook Stripe, seule source de vérité). Aucun numéro de carte n'est stocké ici : seulement les
// identifiants Stripe du client et de l'abonnement. Part avec le compte (ON DELETE CASCADE) et
// figure dans l'export RGPD (lib/server/account-data.ts).

export const PLAN_VALUES = ['free', 'premium'] as const
export type Plan = (typeof PLAN_VALUES)[number]

export const MEMBERSHIP_SOURCES = ['launch-free', 'stripe'] as const
export type MembershipSource = (typeof MEMBERSHIP_SOURCES)[number]

export const BILLING_INTERVALS = ['month', 'year'] as const
export type BillingInterval = (typeof BILLING_INTERVALS)[number]

export const membership = app.table(
  'membership',
  {
    userId: text('user_id')
      .primaryKey()
      .references(() => user.id, { onDelete: 'cascade' }),
    plan: text('plan', { enum: PLAN_VALUES }).notNull().default('free'),
    /** D'où vient la formule : `launch-free` = Premium offert pendant le lancement, `stripe` = abonnement */
    source: text('source', { enum: MEMBERSHIP_SOURCES }).notNull().default('launch-free'),
    activatedAt: timestamp('activated_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    // ── Abonnement Stripe (migration 0009) ──
    stripeCustomerId: text('stripe_customer_id'),
    stripeSubscriptionId: text('stripe_subscription_id'),
    /** Statut Stripe de l'abonnement (active, trialing, past_due, canceled, unpaid…) */
    status: text('status'),
    billingInterval: text('billing_interval', { enum: BILLING_INTERVALS }),
    currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
    cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
    /** Case « accès immédiat, renonciation au droit de rétractation » cochée avant le paiement */
    withdrawalWaiverAt: timestamp('withdrawal_waiver_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true }),
  },
  (t) => [
    check('membership_plan_values', sql`${t.plan} IN ('free', 'premium')`),
    check('membership_source_values', sql`${t.source} IN ('launch-free', 'stripe')`),
    check('membership_interval_values', sql`${t.billingInterval} IS NULL OR ${t.billingInterval} IN ('month', 'year')`),
    uniqueIndex('membership_stripe_customer_idx').on(t.stripeCustomerId),
    uniqueIndex('membership_stripe_subscription_idx').on(t.stripeSubscriptionId),
  ],
)

export type Membership = typeof membership.$inferSelect

// @cdc premium — événements Stripe déjà traités (idempotence du webhook : Stripe peut renvoyer
// un même événement). Aucune donnée personnelle : identifiant et type seulement.
export const stripeEvent = app.table('stripe_event', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  receivedAt: timestamp('received_at', { withTimezone: true }).notNull().defaultNow(),
})
