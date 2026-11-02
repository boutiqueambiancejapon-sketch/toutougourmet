import { and, desc, eq, sql } from 'drizzle-orm'
import { foodAnalysis, scanHistory, scanReport, scanUsage, type FoodAnalysis } from '@/db/schema'
import { scoreLabel, SCORE_VERSION } from '@/lib/scanner/score'
import { baseSlug } from '@/lib/scanner/slug'
import type { ExtractedLabel } from '@/lib/scanner/types'
import { getDb } from './drizzle'

// @cdc lot 6 — accès base du scanner : cache par EAN, quota mensuel, historique par compte,
// derniers scans publics (jamais d'information sur le compte), signalements d'erreur.

function db() {
  const d = getDb()
  if (!d) throw new Error('DATABASE_URL manquant')
  return d
}

export const currentMonth = (now = new Date()) => now.toISOString().slice(0, 7)

/** Recalcule la note si le barème a changé depuis l'analyse (l'étiquette lue reste la même). */
async function fresh(row: FoodAnalysis): Promise<FoodAnalysis> {
  if (row.algorithmVersion === SCORE_VERSION) return row
  const details = scoreLabel(row.extracted)
  const [updated] = await db()
    .update(foodAnalysis)
    .set({ details, score: details.score, algorithmVersion: SCORE_VERSION })
    .where(eq(foodAnalysis.id, row.id))
    .returning()
  return updated ?? row
}

export async function findByEan(ean: string): Promise<FoodAnalysis | null> {
  const [row] = await db().select().from(foodAnalysis).where(eq(foodAnalysis.ean, ean)).limit(1)
  return row ? fresh(row) : null
}

export async function getBySlug(slug: string): Promise<FoodAnalysis | null> {
  if (!/^[a-z0-9-]{1,100}$/.test(slug)) return null
  const [row] = await db().select().from(foodAnalysis).where(eq(foodAnalysis.slug, slug)).limit(1)
  return row ? fresh(row) : null
}

/** Réserve une analyse sur le quota du mois (atomique). false : quota atteint. */
export async function reserveQuota(userId: string, limit: number, month = currentMonth()): Promise<boolean> {
  const rows = await db()
    .insert(scanUsage)
    .values({ userId, month, count: 1 })
    .onConflictDoUpdate({
      target: [scanUsage.userId, scanUsage.month],
      set: { count: sql`${scanUsage.count} + 1` },
      setWhere: sql`${scanUsage.count} < ${limit}`,
    })
    .returning({ count: scanUsage.count })
  return rows.length > 0 && rows[0].count <= limit
}

/** Rend l'analyse réservée quand la lecture a échoué (l'utilisateur ne paie pas une erreur). */
export async function releaseQuota(userId: string, month = currentMonth()): Promise<void> {
  await db()
    .update(scanUsage)
    .set({ count: sql`GREATEST(${scanUsage.count} - 1, 0)` })
    .where(and(eq(scanUsage.userId, userId), eq(scanUsage.month, month)))
}

export async function usedThisMonth(userId: string, month = currentMonth()): Promise<number> {
  const [row] = await db()
    .select({ count: scanUsage.count })
    .from(scanUsage)
    .where(and(eq(scanUsage.userId, userId), eq(scanUsage.month, month)))
  return row?.count ?? 0
}

const isUniqueViolation = (err: unknown, constraint: string) => {
  const e = (err as { cause?: { code?: string; constraint?: string } }).cause ?? (err as { code?: string; constraint?: string })
  return e.code === '23505' && e.constraint === constraint
}

/** Enregistre une nouvelle analyse (ou renvoie celle du même EAN si elle vient d'être créée). */
export async function saveAnalysis(label: ExtractedLabel, ean: string | null, model: string): Promise<FoodAnalysis> {
  const details = scoreLabel(label)
  const base = baseSlug(label.marque, label.produit, ean)
  for (let attempt = 0; attempt < 4; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${(ean ?? crypto.randomUUID().replace(/-/g, '')).slice(-4 - attempt)}`
    try {
      const [row] = await db()
        .insert(foodAnalysis)
        .values({ ean, slug, brand: label.marque, product: label.produit, extracted: { ...label, ean }, score: details.score, details, algorithmVersion: SCORE_VERSION, model })
        .returning()
      return row
    } catch (err) {
      if (ean && isUniqueViolation(err, 'food_analysis_ean_unique')) {
        const existing = await findByEan(ean)
        if (existing) return existing
      }
      if (!isUniqueViolation(err, 'food_analysis_slug_unique')) throw err
    }
  }
  throw new Error('slug introuvable')
}

export async function recordScan(userId: string, analysisId: string, fromCache: boolean): Promise<void> {
  await db().insert(scanHistory).values({ userId, foodAnalysisId: analysisId, fromCache })
  if (fromCache)
    await db()
      .update(foodAnalysis)
      .set({ scanCount: sql`${foodAnalysis.scanCount} + 1` })
      .where(eq(foodAnalysis.id, analysisId))
}

export interface ScanSummary {
  slug: string
  brand: string | null
  product: string | null
  score: number | null
  at: Date
}

export async function listUserScans(userId: string, limit = 50): Promise<ScanSummary[]> {
  return db()
    .select({ slug: foodAnalysis.slug, brand: foodAnalysis.brand, product: foodAnalysis.product, score: foodAnalysis.score, at: scanHistory.createdAt })
    .from(scanHistory)
    .innerJoin(foodAnalysis, eq(foodAnalysis.id, scanHistory.foodAnalysisId))
    .where(eq(scanHistory.userId, userId))
    .orderBy(desc(scanHistory.createdAt))
    .limit(limit)
}

/** Derniers produits analysés, un par produit, sans rien sur les comptes. Vide sous le seuil. */
export async function recentScans(limit: number, minDistinct: number): Promise<ScanSummary[]> {
  const d = getDb()
  if (!d) return []
  const [{ n }] = await d.select({ n: sql<number>`count(DISTINCT ${scanHistory.foodAnalysisId})::int` }).from(scanHistory)
  if (n < minDistinct) return []
  const latest = d
    .select({ id: scanHistory.foodAnalysisId, at: sql<Date>`max(${scanHistory.createdAt})`.as('at') })
    .from(scanHistory)
    .groupBy(scanHistory.foodAnalysisId)
    .as('latest')
  const rows = await d
    .select({ slug: foodAnalysis.slug, brand: foodAnalysis.brand, product: foodAnalysis.product, score: foodAnalysis.score, at: latest.at })
    .from(latest)
    .innerJoin(foodAnalysis, eq(foodAnalysis.id, latest.id))
    .orderBy(desc(latest.at))
    .limit(limit)
  return rows.map((r) => ({ ...r, at: new Date(r.at) }))
}

export async function addReport(userId: string, analysisId: string, message: string): Promise<boolean> {
  const [exists] = await db().select({ id: foodAnalysis.id }).from(foodAnalysis).where(eq(foodAnalysis.id, analysisId)).limit(1)
  if (!exists) return false
  await db().insert(scanReport).values({ userId, foodAnalysisId: analysisId, message })
  return true
}

/** Fiches relues, pour le sitemap des croquettes. */
export async function reviewedSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  const d = getDb()
  if (!d) return []
  return d.select({ slug: foodAnalysis.slug, updatedAt: foodAnalysis.updatedAt }).from(foodAnalysis).where(eq(foodAnalysis.reviewed, true))
}
