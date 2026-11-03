import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm'
import { dog, weightLog, type Dog, type WeightEntry } from '@/db/schema'
import { getDb } from './drizzle'

// @cdc lot 4 — accès aux chiens d'un compte. Chaque lecture et écriture filtre sur user_id :
// un identifiant de chien seul ne donne jamais accès aux données d'un autre compte.
// Croquettes et allergies (migration 0008) : lues et écrites seulement si les colonnes existent.
// Tant que la migration n'est pas appliquée, les chiens se lisent sans elles (valeurs vides) et
// les formulaires masquent ces champs : rien ne casse entre la mise en ligne et la migration.

export type DogProfileExtras = Pick<Dog, 'food' | 'foodSlug' | 'allergies'>
export type DogInput = Pick<Dog, 'name' | 'breedSlug' | 'birthDate' | 'birthDateEstimated' | 'weightKg' | 'activity' | 'sterilized'> & Partial<DogProfileExtras>

function db() {
  const d = getDb()
  if (!d) throw new Error('DATABASE_URL manquant')
  return d
}

const BASE = {
  id: dog.id,
  userId: dog.userId,
  name: dog.name,
  breedSlug: dog.breedSlug,
  birthDate: dog.birthDate,
  birthDateEstimated: dog.birthDateEstimated,
  weightKg: dog.weightKg,
  activity: dog.activity,
  sterilized: dog.sterilized,
  createdAt: dog.createdAt,
  updatedAt: dog.updatedAt,
}
const FULL = { ...BASE, food: dog.food, foodSlug: dog.foodSlug, allergies: dog.allergies }
const NO_EXTRAS: DogProfileExtras = { food: null, foodSlug: null, allergies: [] }

const cache = globalThis as unknown as { tgDogExtras?: { ok: boolean; at: number } }

/** Colonnes de la migration 0008 présentes ? Oui : gardé pour de bon ; non : revérifié chaque minute. */
export async function dogExtrasReady(): Promise<boolean> {
  const c = cache.tgDogExtras
  if (c && (c.ok || Date.now() - c.at < 60_000)) return c.ok
  const res = await db().execute<{ n: number }>(
    sql`SELECT count(*)::int AS n FROM information_schema.columns WHERE table_schema = 'app' AND table_name = 'dog' AND column_name = 'allergies'`,
  )
  const ok = Number(res.rows[0]?.n ?? 0) > 0
  cache.tgDogExtras = { ok, at: Date.now() }
  return ok
}

/** Entrée sans les champs de la migration 0008 tant qu'elle n'est pas appliquée. */
async function writable<T extends Partial<DogProfileExtras>>(input: T): Promise<T> {
  if (await dogExtrasReady()) return input
  const rest = { ...input }
  delete rest.food
  delete rest.foodSlug
  delete rest.allergies
  return rest
}

export async function listDogs(userId: string): Promise<Dog[]> {
  const where = eq(dog.userId, userId)
  if (await dogExtrasReady()) return db().select(FULL).from(dog).where(where).orderBy(asc(dog.createdAt))
  const rows = await db().select(BASE).from(dog).where(where).orderBy(asc(dog.createdAt))
  return rows.map((r) => ({ ...r, ...NO_EXTRAS }))
}

export async function getDog(userId: string, dogId: string): Promise<Dog | null> {
  if (!/^[0-9a-f-]{36}$/i.test(dogId)) return null
  const where = and(eq(dog.id, dogId), eq(dog.userId, userId))
  if (await dogExtrasReady()) {
    const [row] = await db().select(FULL).from(dog).where(where).limit(1)
    return row ?? null
  }
  const [row] = await db().select(BASE).from(dog).where(where).limit(1)
  return row ? { ...row, ...NO_EXTRAS } : null
}

/** Complète croquettes et allergies du profil sans écraser ce qui est déjà rempli. */
export async function fillDogExtras(userId: string, dogId: string, extras: Partial<DogProfileExtras>): Promise<void> {
  if (!(await dogExtrasReady())) return
  const set: Partial<DogProfileExtras> = {}
  if (extras.food) {
    set.food = extras.food
    set.foodSlug = extras.foodSlug ?? null
  }
  if (extras.allergies?.length) set.allergies = extras.allergies
  if (Object.keys(set).length === 0) return
  const owned = await getDog(userId, dogId)
  if (!owned) return
  if (owned.food) {
    delete set.food
    delete set.foodSlug
  }
  if (owned.allergies.length > 0) delete set.allergies
  if (Object.keys(set).length === 0) return
  await db().update(dog).set(set).where(and(eq(dog.id, dogId), eq(dog.userId, userId)))
}

export async function createDog(userId: string, input: DogInput, today: string): Promise<string> {
  const values = await writable(input)
  return db().transaction(async (tx) => {
    const [row] = await tx.insert(dog).values({ ...values, userId }).returning({ id: dog.id })
    if (input.weightKg) await tx.insert(weightLog).values({ dogId: row.id, date: today, weightKg: input.weightKg })
    return row.id
  })
}

export async function updateDog(userId: string, dogId: string, input: DogInput): Promise<boolean> {
  const rows = await db()
    .update(dog)
    .set(await writable(input))
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
