import { marqueCanonique } from '@/lib/scanner/marque'
import { and, asc, count, desc, eq, isNotNull, isNull, or, sql } from 'drizzle-orm'
import { foodAnalysis, opffProduct, scanReport, type FoodAnalysis } from '@/db/schema'
import { analyseLabel, scoreVersionFor } from '@/lib/scanner/analyse'
import { foodNoun, type FoodNoun } from '@/lib/scanner/food-noun'
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

/**
 * Enregistre l'étiquette corrigée et recalcule la note. `reviewed` : validée (true, efface aussi
 * un « écartée »), retirée (false) ou inchangée. Le ré-import Open Pet Food Facts passe ici sans
 * `reviewed` : le drapeau `discarded` reste.
 */
export async function updateAnalysis(id: string, label: ExtractedLabel, reviewed?: boolean): Promise<FoodAnalysis | null> {
  const details = analyseLabel(label)
  const [row] = await db()
    .update(foodAnalysis)
    .set({
      brand: marqueCanonique(label.marque) ?? null,
      product: label.produit,
      extracted: label,
      details,
      score: details.score,
      algorithmVersion: scoreVersionFor(label),
      ...(reviewed === undefined ? {} : reviewed ? { reviewed, discarded: false } : { reviewed }),
    })
    .where(eq(foodAnalysis.id, id))
    .returning()
  return row ?? null
}

export interface ImportedRow {
  id: string
  slug: string
  brand: string | null
  product: string | null
  score: number | null
  noun: FoodNoun
  /** Remplit la règle d'indexation proposée (marque, nom, composition, 5 constituants) */
  indexable: boolean
}

/**
 * Fiches pré-notées par l'import Open Pet Food Facts, ni relues ni écartées : celles qui
 * remplissent la règle d'indexation d'abord, puis les meilleures notes. `total` : toutes, au-delà de `limit`.
 */
export async function listImportedToReview(limit = 60): Promise<{ rows: ImportedRow[]; total: number }> {
  const where = and(eq(foodAnalysis.source, 'openpetfoodfacts'), eq(foodAnalysis.reviewed, false), eq(foodAnalysis.discarded, false), isNotNull(foodAnalysis.score))
  const indexable = sql<boolean>`coalesce(${opffProduct.indexable}, false)`
  const [rows, [counted]] = await Promise.all([
    db()
      .select({
        id: foodAnalysis.id,
        slug: foodAnalysis.slug,
        brand: foodAnalysis.brand,
        product: foodAnalysis.product,
        score: foodAnalysis.score,
        extracted: foodAnalysis.extracted,
        details: foodAnalysis.details,
        indexable,
      })
      .from(foodAnalysis)
      .leftJoin(opffProduct, eq(opffProduct.ean, foodAnalysis.ean))
      .where(where)
      .orderBy(desc(indexable), desc(foodAnalysis.score), foodAnalysis.brand)
      .limit(limit),
    db().select({ n: count() }).from(foodAnalysis).where(where),
  ])
  return {
    rows: rows.map(({ extracted, details, ...r }) => ({ ...r, noun: foodNoun(extracted, details) })),
    total: counted?.n ?? 0,
  }
}

/** Décision sur une fiche importée : validée (relue, donc publiée) ou écartée (jamais publiée). */
export async function decideImported(id: string, decision: 'validate' | 'discard'): Promise<{ slug: string; brand: string | null } | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null
  const [row] = await db()
    .update(foodAnalysis)
    .set(decision === 'validate' ? { reviewed: true, discarded: false } : { reviewed: false, discarded: true })
    .where(and(eq(foodAnalysis.id, id), eq(foodAnalysis.source, 'openpetfoodfacts')))
    .returning({ slug: foodAnalysis.slug, brand: foodAnalysis.brand })
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
