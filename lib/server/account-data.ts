import { asc, eq, inArray } from 'drizzle-orm'
import { dog, session, user, weightLog } from '@/db/schema'
import { getDb } from './drizzle'

// @cdc lot 4 — RGPD : export des données d'un compte (portabilité) et garde-fou de la suppression.
// L'export ne contient jamais le mot de passe haché (app.account) ni les jetons de session.

export interface AccountExport {
  format: 'toutou-gourmet-compte'
  version: 1
  exportedAt: string
  profile: { id: string; name: string; email: string; emailVerified: boolean; createdAt: string; updatedAt: string }
  sessions: { createdAt: string; expiresAt: string; ipAddress: string | null; userAgent: string | null }[]
  dogs: {
    id: string
    name: string
    breedSlug: string | null
    birthDate: string | null
    birthDateEstimated: boolean
    weightKg: number | null
    activity: string
    sterilized: boolean
    createdAt: string
    updatedAt: string
    weights: { date: string; weightKg: number; createdAt: string }[]
  }[]
}

export async function exportAccountData(userId: string): Promise<AccountExport | null> {
  const db = getDb()
  if (!db) return null
  const [profile] = await db.select().from(user).where(eq(user.id, userId)).limit(1)
  if (!profile) return null
  const sessions = await db
    .select({ createdAt: session.createdAt, expiresAt: session.expiresAt, ipAddress: session.ipAddress, userAgent: session.userAgent })
    .from(session)
    .where(eq(session.userId, userId))
    .orderBy(asc(session.createdAt))
  const dogs = await db.select().from(dog).where(eq(dog.userId, userId)).orderBy(asc(dog.createdAt))
  const weights = dogs.length
    ? await db
        .select()
        .from(weightLog)
        .where(
          inArray(
            weightLog.dogId,
            dogs.map((d) => d.id),
          ),
        )
        .orderBy(asc(weightLog.date), asc(weightLog.createdAt))
    : []
  return {
    format: 'toutou-gourmet-compte',
    version: 1,
    exportedAt: new Date().toISOString(),
    profile: {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      emailVerified: profile.emailVerified,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    },
    sessions: sessions.map((s) => ({ ...s, createdAt: s.createdAt.toISOString(), expiresAt: s.expiresAt.toISOString() })),
    dogs: dogs.map((d) => ({
      id: d.id,
      name: d.name,
      breedSlug: d.breedSlug,
      birthDate: d.birthDate,
      birthDateEstimated: d.birthDateEstimated,
      weightKg: d.weightKg,
      activity: d.activity,
      sterilized: d.sterilized,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
      weights: weights.filter((w) => w.dogId === d.id).map((w) => ({ date: w.date, weightKg: w.weightKg, createdAt: w.createdAt.toISOString() })),
    })),
  }
}

// La limite de Better Auth ne couvre que ses routes HTTP : la suppression passe par une action
// serveur, d'où ce compteur en mémoire (5 essais de mot de passe par compte et par 5 minutes).
const DELETE_WINDOW_MS = 5 * 60 * 1000
const DELETE_MAX = 5
const deleteAttempts = new Map<string, number[]>()

export function deleteAttemptsExceeded(userId: string): boolean {
  const now = Date.now()
  const recent = (deleteAttempts.get(userId) ?? []).filter((t) => now - t < DELETE_WINDOW_MS)
  recent.push(now)
  deleteAttempts.set(userId, recent)
  return recent.length > DELETE_MAX
}
