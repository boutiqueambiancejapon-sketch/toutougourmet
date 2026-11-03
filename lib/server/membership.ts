import { cache } from 'react'
import { count, eq, sql } from 'drizzle-orm'
import { text, timestamp } from 'drizzle-orm/pg-core'
import { dog, membership, user, type Membership, type Plan } from '@/db/schema'
import { app } from '@/db/schema/app'
import { hasPremiumAccess, launchEndsAt } from '@/lib/premium/access'
import { monthlyScanLimit } from '@/lib/scanner/config'
import { getDb } from './drizzle'
import { stripeConfigured } from './stripe'

// @cdc premium — formule du compte. Deux origines : Premium gratuit du lancement (activation par le
// titulaire depuis /compte, adresse confirmée et un chien enregistré, tant que le paiement n'est pas
// en service et que PREMIUM_LAUNCH_ENDS_AT n'est pas passé), et abonnement Stripe (état écrit par le
// webhook, lib/server/stripe-webhook.ts). La règle d'accès est dans lib/premium/access.ts.
// Colonnes Stripe (migration 0009) : lues seulement si elles existent. Avant la migration, la
// formule se lit sans elles (valeurs vides) et le paiement reste fermé : rien ne casse.

function db() {
  const d = getDb()
  if (!d) throw new Error('DATABASE_URL manquant')
  return d
}

// app.membership telle qu'avant la migration 0009 (un insert Drizzle cite toutes les colonnes de
// la table). Hors de db/schema : drizzle-kit ne la voit pas. À retirer une fois 0009 appliquée.
const membershipBefore0009 = app.table('membership', {
  userId: text('user_id').primaryKey(),
  plan: text('plan').notNull(),
  source: text('source').notNull(),
  activatedAt: timestamp('activated_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

const NO_BILLING = {
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  status: null,
  billingInterval: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  withdrawalWaiverAt: null,
  updatedAt: null,
} satisfies Partial<Membership>

const readyCache = globalThis as unknown as { tgBillingReady?: { ok: boolean; at: number } }

/** Migration 0009 appliquée (colonnes Stripe et table stripe_event) ? Oui : gardé ; non : revérifié chaque minute. */
export async function billingReady(): Promise<boolean> {
  const c = readyCache.tgBillingReady
  if (c && (c.ok || Date.now() - c.at < 60_000)) return c.ok
  const res = await db().execute<{ n: number }>(
    sql`SELECT (SELECT count(*) FROM information_schema.columns WHERE table_schema = 'app' AND table_name = 'membership' AND column_name = 'stripe_customer_id')
             + (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'app' AND table_name = 'stripe_event') AS n`,
  )
  const ok = Number(res.rows[0]?.n ?? 0) >= 2
  readyCache.tgBillingReady = { ok, at: Date.now() }
  return ok
}

/** Paiement en service : les quatre variables Stripe présentes et la migration 0009 appliquée. */
export async function paymentsOpen(): Promise<boolean> {
  return stripeConfigured() && (await billingReady())
}

/** Activation gratuite du lancement encore proposée : paiement pas en service, lancement pas terminé. */
export function launchActivationOpen(now = new Date()): boolean {
  const end = launchEndsAt()
  return !stripeConfigured() && (end === null || now < end)
}

/**
 * Offre affichée : `paid` (paiement en service), `launch` (Premium gratuit du lancement encore
 * ouvert), `soon` (lancement terminé, paiement pas encore en service : « bientôt disponible »).
 * Lit seulement les variables d'environnement (utilisable par la page statique /premium).
 */
export type PremiumMode = 'paid' | 'launch' | 'soon'

export function premiumMode(now = new Date()): PremiumMode {
  if (stripeConfigured()) return 'paid'
  return launchActivationOpen(now) ? 'launch' : 'soon'
}

/** Mémorisée le temps d'une requête : le gabarit de l'espace compte et la page la lisent tous deux. */
export const getMembership = cache(async (userId: string): Promise<Membership | null> => {
  if (await billingReady()) {
    const [row] = await db().select().from(membership).where(eq(membership.userId, userId)).limit(1)
    return row ?? null
  }
  const [row] = await db().select().from(membershipBefore0009).where(eq(membershipBefore0009.userId, userId)).limit(1)
  if (!row) return null
  return { ...row, plan: row.plan as Plan, source: row.source as Membership['source'], ...NO_BILLING }
})

export interface PremiumState {
  active: boolean
  membership: Membership | null
  launchEndsAt: Date | null
}

export const getPremiumState = cache(async (userId: string): Promise<PremiumState> => {
  const m = await getMembership(userId)
  const end = launchEndsAt()
  return { active: hasPremiumAccess(m, new Date(), end), membership: m, launchEndsAt: end }
})

export async function planOf(userId: string): Promise<Plan> {
  return (await getPremiumState(userId)).active ? 'premium' : 'free'
}

/** Quota mensuel d'analyses par photo selon la formule du compte. */
export async function scanLimitFor(userId: string): Promise<{ plan: Plan; limit: number }> {
  const plan = await planOf(userId)
  return { plan, limit: monthlyScanLimit(plan) }
}

export type PremiumMissing = 'email' | 'dog'

/** Ce qui manque pour activer Premium gratuit du lancement (vide : le compte peut l'activer). */
export async function premiumMissing(userId: string): Promise<PremiumMissing[]> {
  const [[u], [dogs]] = await Promise.all([
    db().select({ verified: user.emailVerified }).from(user).where(eq(user.id, userId)).limit(1),
    db().select({ n: count() }).from(dog).where(eq(dog.userId, userId)),
  ])
  const missing: PremiumMissing[] = []
  if (!u?.verified) missing.push('email')
  if (!dogs || dogs.n === 0) missing.push('dog')
  return missing
}

export async function emailVerified(userId: string): Promise<boolean> {
  const [u] = await db().select({ verified: user.emailVerified }).from(user).where(eq(user.id, userId)).limit(1)
  return u?.verified === true
}

export type ActivationResult = { ok: true; already: boolean } | { ok: false; missing: PremiumMissing[] } | { ok: false; closed: true }

export async function activatePremium(userId: string, now = new Date()): Promise<ActivationResult> {
  if (!launchActivationOpen(now)) return { ok: false, closed: true }
  const missing = await premiumMissing(userId)
  if (missing.length > 0) return { ok: false, missing }
  const current = await getMembership(userId)
  if (current?.plan === 'premium') return { ok: true, already: true }
  // Un compte déjà passé par Stripe garde sa source : l'offre gratuite ne réécrit pas un abonnement.
  if (current?.source === 'stripe') return { ok: false, closed: true }
  const set = { plan: 'premium' as const, source: 'launch-free' as const, activatedAt: now }
  if (await billingReady()) {
    await db().insert(membership).values({ userId, ...set }).onConflictDoUpdate({ target: membership.userId, set })
  } else {
    await db().insert(membershipBefore0009).values({ userId, ...set }).onConflictDoUpdate({ target: membershipBefore0009.userId, set })
  }
  return { ok: true, already: false }
}
