import { marqueCanonique } from '@/lib/scanner/marque'
import { and, desc, eq, sql } from 'drizzle-orm'
import { foodAnalysis, scanHistory, scanReport, scanUsage, type FoodAnalysis } from '@/db/schema'
import type { AnalysisSource } from '@/db/schema/scanner'
import { analyseLabel, scoreVersionFor } from '@/lib/scanner/analyse'
import { baseSlug } from '@/lib/scanner/slug'
import type { ProductKind } from '@/lib/scanner/score'
import type { ExtractedLabel } from '@/lib/scanner/types'
import { getDb } from './drizzle'

// @cdc lot 6 — accès base du scanner : cache par EAN, quota mensuel, historique par compte,
// signalements d'erreur.

function db() {
  const d = getDb()
  if (!d) throw new Error('DATABASE_URL manquant')
  return d
}

export const currentMonth = (now = new Date()) => now.toISOString().slice(0, 7)

/** Recalcule la note si le barème (aliment complet ou friandise) a changé depuis l'analyse (l'étiquette lue reste la même). */
async function fresh(row: FoodAnalysis): Promise<FoodAnalysis> {
  const version = scoreVersionFor(row.extracted)
  if (row.algorithmVersion === version) return row
  const details = analyseLabel(row.extracted)
  const [updated] = await db()
    .update(foodAnalysis)
    .set({ details, score: details.score, algorithmVersion: version })
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

/**
 * Enregistre une nouvelle analyse (ou renvoie celle du même EAN si elle vient d'être créée).
 * scanCount 0 : fiche pré-notée par l'import Open Pet Food Facts, que personne n'a encore scannée.
 */
export async function saveAnalysis(
  label: ExtractedLabel,
  ean: string | null,
  model: string,
  source: AnalysisSource = 'photo',
  { scanCount = 1 }: { scanCount?: number } = {},
): Promise<FoodAnalysis> {
  const details = analyseLabel(label)
  const base = baseSlug(label.marque, label.produit, ean)
  for (let attempt = 0; attempt < 4; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${(ean ?? crypto.randomUUID().replace(/-/g, '')).slice(-4 - attempt)}`
    try {
      const [row] = await db()
        .insert(foodAnalysis)
        .values({ ean, slug, brand: marqueCanonique(label.marque) ?? null, product: label.produit, extracted: { ...label, ean }, score: details.score, details, algorithmVersion: scoreVersionFor(label), model, source, scanCount })
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

/** Historique du compte (si connecté) et compteur de consultations du produit. */
export async function recordScan(userId: string | null, analysisId: string, fromCache: boolean): Promise<void> {
  if (userId) await db().insert(scanHistory).values({ userId, foodAnalysisId: analysisId, fromCache })
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
  /** Friandise (barème à part) ou aliment complet, pour le signaler à côté de la note */
  kind?: ProductKind
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

export async function addReport(userId: string, analysisId: string, message: string): Promise<boolean> {
  const [exists] = await db().select({ id: foodAnalysis.id }).from(foodAnalysis).where(eq(foodAnalysis.id, analysisId)).limit(1)
  if (!exists) return false
  await db().insert(scanReport).values({ userId, foodAnalysisId: analysisId, message })
  return true
}
