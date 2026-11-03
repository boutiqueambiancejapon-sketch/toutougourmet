import { and, asc, count, desc, eq, isNull, or, sql } from 'drizzle-orm'
import { foodAnalysis, scanReport, type FoodAnalysis } from '@/db/schema'
import { scoreLabel, SCORE_VERSION } from '@/lib/scanner/score'
import type { ExtractedLabel } from '@/lib/scanner/types'
import { getDb } from './drizzle'
import { awaitingReviewWhere } from './scanner-published'

// @cdc lot 6 — relecture des fiches dans le tableau de bord privé : fiches non relues et
// signalements à traiter, correction de l'étiquette (la note est toujours recalculée par le
// barème), validation (fiche indexable) ou suppression. Appelé seulement par les actions
// serveur de /tableau-de-bord, qui vérifient l'authentification avant.

function db() {
  const d = getDb()
  if (!d) throw new Error('DATABASE_URL manquant')
  return d
}

export interface ReviewRow {
  id: string
  slug: string
  brand: string | null
  product: string | null
  score: number | null
  source: FoodAnalysis['source']
  reviewed: boolean
  createdAt: Date
  openReports: number
}

/** Fiches non relues (hors fiches importées jamais scannées), puis fiches qui ont un signalement à traiter. Les plus récentes d'abord. */
export async function listToReview(limit = 100): Promise<ReviewRow[]> {
  const open = db()
    .select({ id: scanReport.foodAnalysisId, n: count().as('n') })
    .from(scanReport)
    .where(isNull(scanReport.handledAt))
    .groupBy(scanReport.foodAnalysisId)
    .as('open_reports')
  const rows = await db()
    .select({
      id: foodAnalysis.id,
      slug: foodAnalysis.slug,
      brand: foodAnalysis.brand,
      product: foodAnalysis.product,
      score: foodAnalysis.score,
      source: foodAnalysis.source,
      reviewed: foodAnalysis.reviewed,
      createdAt: foodAnalysis.createdAt,
      openReports: sql<number>`coalesce(${open.n}, 0)::int`,
    })
    .from(foodAnalysis)
    .leftJoin(open, eq(open.id, foodAnalysis.id))
    .where(or(awaitingReviewWhere(), sql`${open.n} > 0`))
    .orderBy(asc(foodAnalysis.reviewed), desc(foodAnalysis.createdAt))
    .limit(limit)
  return rows
}

export async function getAnalysis(id: string): Promise<FoodAnalysis | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null
  const [row] = await db().select().from(foodAnalysis).where(eq(foodAnalysis.id, id)).limit(1)
  return row ?? null
}

export interface ReportRow {
  id: string
  message: string
  createdAt: Date
  handledAt: Date | null
}

export async function listReports(analysisId: string): Promise<ReportRow[]> {
  return db()
    .select({ id: scanReport.id, message: scanReport.message, createdAt: scanReport.createdAt, handledAt: scanReport.handledAt })
    .from(scanReport)
    .where(eq(scanReport.foodAnalysisId, analysisId))
    .orderBy(sql`${scanReport.handledAt} IS NOT NULL`, desc(scanReport.createdAt))
}

/** Enregistre l'étiquette corrigée et recalcule la note. `reviewed` : validée (true), retirée (false) ou inchangée. */
export async function updateAnalysis(id: string, label: ExtractedLabel, reviewed?: boolean): Promise<FoodAnalysis | null> {
  const details = scoreLabel(label)
  const [row] = await db()
    .update(foodAnalysis)
    .set({
      brand: label.marque,
      product: label.produit,
      extracted: label,
      details,
      score: details.score,
      algorithmVersion: SCORE_VERSION,
      ...(reviewed === undefined ? {} : { reviewed }),
    })
    .where(eq(foodAnalysis.id, id))
    .returning()
  return row ?? null
}

export async function deleteAnalysis(id: string): Promise<{ slug: string; brand: string | null } | null> {
  const [row] = await db().delete(foodAnalysis).where(eq(foodAnalysis.id, id)).returning({ slug: foodAnalysis.slug, brand: foodAnalysis.brand })
  return row ?? null
}

export async function markReportHandled(reportId: string, analysisId: string): Promise<void> {
  await db()
    .update(scanReport)
    .set({ handledAt: new Date() })
    .where(and(eq(scanReport.id, reportId), eq(scanReport.foodAnalysisId, analysisId)))
}
