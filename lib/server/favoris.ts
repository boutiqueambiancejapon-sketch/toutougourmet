import { and, desc, eq } from 'drizzle-orm'
import { foodAnalysis, foodFavorite } from '@/db/schema'
import { getDb } from '@/lib/server/drizzle'

function db() {
  const d = getDb()
  if (!d) throw new Error('Base indisponible')
  return d
}

// @cdc compte — « Mes aliments » : produits gardés par le lecteur. Toujours filtré par son identifiant.

export interface Favori {
  slug: string
  brand: string | null
  product: string | null
  score: number | null
  imageUrl: string | null
}

export async function listFavoris(userId: string, limit = 50): Promise<Favori[]> {
  return db()
    .select({ slug: foodAnalysis.slug, brand: foodAnalysis.brand, product: foodAnalysis.product, score: foodAnalysis.score, imageUrl: foodAnalysis.imageUrl })
    .from(foodFavorite)
    .innerJoin(foodAnalysis, eq(foodAnalysis.id, foodFavorite.foodAnalysisId))
    .where(eq(foodFavorite.userId, userId))
    .orderBy(desc(foodFavorite.createdAt))
    .limit(limit)
}

export async function slugsFavoris(userId: string): Promise<string[]> {
  return (await listFavoris(userId, 200)).map((f) => f.slug)
}

/** true si la fiche existe et l'opération a été faite. */
export async function changerFavori(userId: string, slug: string, garder: boolean): Promise<boolean> {
  const [fiche] = await db().select({ id: foodAnalysis.id }).from(foodAnalysis).where(eq(foodAnalysis.slug, slug)).limit(1)
  if (!fiche) return false
  if (garder) await db().insert(foodFavorite).values({ userId, foodAnalysisId: fiche.id }).onConflictDoNothing()
  else await db().delete(foodFavorite).where(and(eq(foodFavorite.userId, userId), eq(foodFavorite.foodAnalysisId, fiche.id)))
  return true
}
