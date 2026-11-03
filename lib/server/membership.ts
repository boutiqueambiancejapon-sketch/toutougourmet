import { cache } from 'react'
import { count, eq } from 'drizzle-orm'
import { dog, membership, user, type Membership, type Plan } from '@/db/schema'
import { monthlyScanLimit } from '@/lib/scanner/config'
import { getDb } from './drizzle'

// @cdc premium — formule du compte. Premium gratuit pendant le lancement : activation par le
// titulaire depuis /compte, à deux conditions (adresse confirmée, au moins un chien enregistré).
// Aucun paiement, aucun prélèvement : si Premium devient payant, on prévient avant.

function db() {
  const d = getDb()
  if (!d) throw new Error('DATABASE_URL manquant')
  return d
}

/** Mémorisée le temps d'une requête : le gabarit de l'espace compte et la page la lisent tous deux. */
export const getMembership = cache(async (userId: string): Promise<Membership | null> => {
  const [row] = await db().select().from(membership).where(eq(membership.userId, userId)).limit(1)
  return row ?? null
})

export async function planOf(userId: string): Promise<Plan> {
  return (await getMembership(userId))?.plan ?? 'free'
}

/** Quota mensuel d'analyses par photo selon la formule du compte. */
export async function scanLimitFor(userId: string): Promise<{ plan: Plan; limit: number }> {
  const plan = await planOf(userId)
  return { plan, limit: monthlyScanLimit(plan) }
}

export type PremiumMissing = 'email' | 'dog'

/** Ce qui manque pour activer Premium (vide : le compte peut l'activer). */
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

export type ActivationResult = { ok: true; already: boolean } | { ok: false; missing: PremiumMissing[] }

export async function activatePremium(userId: string, now = new Date()): Promise<ActivationResult> {
  const missing = await premiumMissing(userId)
  if (missing.length > 0) return { ok: false, missing }
  const current = await getMembership(userId)
  if (current?.plan === 'premium') return { ok: true, already: true }
  await db()
    .insert(membership)
    .values({ userId, plan: 'premium', source: 'launch-free', activatedAt: now })
    .onConflictDoUpdate({ target: membership.userId, set: { plan: 'premium', source: 'launch-free', activatedAt: now } })
  return { ok: true, already: false }
}
