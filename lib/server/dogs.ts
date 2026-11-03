import { and, asc, desc, eq, inArray } from 'drizzle-orm'
import { dog, weightLog, type Dog, type WeightEntry } from '@/db/schema'
import { getDb } from './drizzle'

// @cdc lot 4 — accès aux chiens d'un compte. Chaque lecture et écriture filtre sur user_id :
// un identifiant de chien seul ne donne jamais accès aux données d'un autre compte.

export type DogInput = Pick<Dog, 'name' | 'breedSlug' | 'birthDate' | 'birthDateEstimated' | 'weightKg' | 'activity' | 'sterilized'>

function db() {
  const d = getDb()
  if (!d) throw new Error('DATABASE_URL manquant')
  return d
}

export async function listDogs(userId: string): Promise<Dog[]> {
  return db().select().from(dog).where(eq(dog.userId, userId)).orderBy(asc(dog.createdAt))
}

export async function getDog(userId: string, dogId: string): Promise<Dog | null> {
  if (!/^[0-9a-f-]{36}$/i.test(dogId)) return null
  const rows = await db()
    .select()
    .from(dog)
    .where(and(eq(dog.id, dogId), eq(dog.userId, userId)))
    .limit(1)
  return rows[0] ?? null
}

export async function createDog(userId: string, input: DogInput, today: string): Promise<string> {
  return db().transaction(async (tx) => {
    const [row] = await tx.insert(dog).values({ ...input, userId }).returning({ id: dog.id })
    if (input.weightKg) await tx.insert(weightLog).values({ dogId: row.id, date: today, weightKg: input.weightKg })
    return row.id
  })
}

export async function updateDog(userId: string, dogId: string, input: DogInput): Promise<boolean> {
  const rows = await db()
    .update(dog)
    .set(input)
    .where(and(eq(dog.id, dogId), eq(dog.userId, userId)))
    .returning({ id: dog.id })
  return rows.length > 0
}

export async function deleteDog(userId: string, dogId: string): Promise<void> {
  await db()
    .delete(dog)
    .where(and(eq(dog.id, dogId), eq(dog.userId, userId)))
}

export async function listWeights(dogId: string): Promise<WeightEntry[]> {
  return db().select().from(weightLog).where(eq(weightLog.dogId, dogId)).orderBy(desc(weightLog.date), desc(weightLog.createdAt))
}

/** Dernière pesée de chaque chien (clé : id du chien). Les chiens sans pesée sont absents. */
export async function latestWeights(dogIds: string[]): Promise<Map<string, WeightEntry>> {
  const latest = new Map<string, WeightEntry>()
  if (dogIds.length === 0) return latest
  const rows = await db()
    .select()
    .from(weightLog)
    .where(inArray(weightLog.dogId, dogIds))
    .orderBy(desc(weightLog.date), desc(weightLog.createdAt))
  for (const row of rows) if (!latest.has(row.dogId)) latest.set(row.dogId, row)
  return latest
}

/** Ajoute une pesée ; le poids du profil suit la pesée la plus récente. */
export async function addWeight(userId: string, dogId: string, date: string, weightKg: number): Promise<boolean> {
  const owned = await getDog(userId, dogId)
  if (!owned) return false
  await db().transaction(async (tx) => {
    // Une seule pesée par jour : une nouvelle saisie le même jour remplace la précédente.
    await tx.delete(weightLog).where(and(eq(weightLog.dogId, dogId), eq(weightLog.date, date)))
    await tx.insert(weightLog).values({ dogId, date, weightKg })
    const [latest] = await tx
      .select({ weightKg: weightLog.weightKg })
      .from(weightLog)
      .where(eq(weightLog.dogId, dogId))
      .orderBy(desc(weightLog.date), desc(weightLog.createdAt))
      .limit(1)
    await tx.update(dog).set({ weightKg: latest.weightKg }).where(eq(dog.id, dogId))
  })
  return true
}
