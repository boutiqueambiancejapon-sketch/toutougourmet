import { and, eq, sql, type SQL } from 'drizzle-orm'
import { foodAnalysis, opffProduct, type FoodAnalysis } from '@/db/schema'
import { getDb } from './drizzle'

// @cdc lot 6 — quelles fiches /croquettes/[slug] sont publiées (indexables, dans le sitemap, le
// classement, les pages marque, les meilleures notes de /scanner). Toujours : fiche relue.
// OPFF_INDEX_POLICY=complete ajoute les fiches Open Pet Food Facts non relues qui remplissent la
// règle d'indexation (marque, nom, composition, et 5 constituants pour un aliment complet :
// lib/scanner/opff-import.ts, colonne opff_product.indexable). Par défaut (off) : seules les
// fiches relues, comme avant.
// Une fiche écartée à la relecture (food_analysis.discarded) n'est jamais publiée.

export type OpffIndexPolicy = 'off' | 'complete'

export const opffIndexPolicy = (): OpffIndexPolicy => (process.env.OPFF_INDEX_POLICY === 'complete' ? 'complete' : 'off')

const opffIndexable = sql`(${foodAnalysis.source} = 'openpetfoodfacts' AND EXISTS (SELECT 1 FROM ${opffProduct} WHERE ${opffProduct.ean} = ${foodAnalysis.ean} AND ${opffProduct.indexable}))`

/** Condition SQL sur food_analysis : fiche publiée. */
export function publishedWhere(): SQL {
  const base = opffIndexPolicy() === 'complete' ? sql`(${foodAnalysis.reviewed} OR ${opffIndexable})` : sql`${foodAnalysis.reviewed}`
  return sql`(${base} AND NOT ${foodAnalysis.discarded})`
}

/** Même règle pour une fiche déjà lue (balise robots de la page). */
export async function isPublished(row: FoodAnalysis): Promise<boolean> {
  if (row.discarded) return false
  if (row.reviewed) return true
  if (opffIndexPolicy() !== 'complete' || row.source !== 'openpetfoodfacts' || !row.ean) return false
  const d = getDb()
  if (!d) return false
  const [hit] = await d
    .select({ ean: opffProduct.ean })
    .from(opffProduct)
    .where(and(eq(opffProduct.ean, row.ean), eq(opffProduct.indexable, true)))
    .limit(1)
    .catch(() => [])
  return !!hit
}

/**
 * Fiches à relire : non relues, sauf les fiches pré-notées par l'import que personne n'a encore
 * scannées (scan_count = 0) — sinon des milliers de fiches noieraient les vrais scans. Une fiche
 * importée entre dans la liste dès son premier scan. Une fiche écartée a déjà été jugée : hors liste
 * (ses signalements restent affichés). Version SQL brut pour les requêtes pg directes.
 */
export function awaitingReviewWhere(): SQL {
  return sql`NOT ${foodAnalysis.reviewed} AND NOT ${foodAnalysis.discarded} AND NOT (${foodAnalysis.source} IN ('openpetfoodfacts', 'maxizoo') AND ${foodAnalysis.scanCount} = 0)`
}

export const AWAITING_REVIEW_SQL = "NOT reviewed AND NOT discarded AND NOT (source IN ('openpetfoodfacts', 'maxizoo') AND scan_count = 0)"
