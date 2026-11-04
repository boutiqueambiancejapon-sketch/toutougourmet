import { cache } from 'react'
import { eq, sql } from 'drizzle-orm'
import { foodAnalysis, foodCheck, opffProduct, type FicheCheckStatus } from '@/db/schema'
import { foodNoun } from '@/lib/scanner/food-noun'
import { isFicheComplete, type ListFiche } from '@/lib/scanner/fiche-lists'
import { getDb, type Db } from './drizzle'

// @cdc scanner — fiches des listes publiques. Le statut du contrôle IA ne compte que s'il porte sur
// le contenu actuel de la fiche (md5 de extracted). Toute panne (table pas encore migrée, journal
// absent) donne une liste vide ou sans date de scan, jamais une page en erreur.

/** Statut du contrôle, seulement s'il porte sur le contenu actuel (partagé avec le tableau de bord). */
export const currentCheckStatus = sql<FicheCheckStatus | null>`CASE WHEN ${foodCheck.contentHash} = md5(${foodAnalysis.extracted}::text) THEN ${foodCheck.status} END`

async function readJournal(d: Db): Promise<Map<string, Date>> {
  const res = await d
    .execute<{ id: string; at: Date }>(sql`SELECT food_analysis_id AS id, max(created_at) AS at FROM analytics.scanner_events WHERE result = 'found' AND food_analysis_id IS NOT NULL GROUP BY 1`)
    .catch((err: unknown) => {
      console.error('[scanner] journal des scans illisible', err && typeof err === 'object' && 'code' in err ? String(err.code) : 'inconnu')
      return { rows: [] as { id: string; at: Date }[] }
    })
  return new Map(res.rows.map((r) => [r.id, new Date(r.at)]))
}

export const listFiches = cache(async (): Promise<ListFiche[]> => {
  const d = getDb()
  if (!d) return []
  try {
    const [rows, journal] = await Promise.all([
      d
        .select({
          id: foodAnalysis.id,
          slug: foodAnalysis.slug,
          brand: foodAnalysis.brand,
          product: foodAnalysis.product,
          score: foodAnalysis.score,
          imageUrl: foodAnalysis.imageUrl,
          extracted: foodAnalysis.extracted,
          details: foodAnalysis.details,
          reviewed: foodAnalysis.reviewed,
          source: foodAnalysis.source,
          discarded: foodAnalysis.discarded,
          scanCount: foodAnalysis.scanCount,
          createdAt: foodAnalysis.createdAt,
          check: currentCheckStatus,
          countries: opffProduct.countries,
          lastHistory: sql<Date | null>`(SELECT max(h.created_at) FROM app.scan_history h WHERE h.food_analysis_id = ${foodAnalysis.id})`,
        })
        .from(foodAnalysis)
        .leftJoin(foodCheck, eq(foodCheck.foodAnalysisId, foodAnalysis.id))
        .leftJoin(opffProduct, eq(opffProduct.ean, foodAnalysis.ean))
        .where(sql`NOT ${foodAnalysis.discarded} AND (${foodAnalysis.reviewed} OR ${foodAnalysis.scanCount} > 0 OR ${currentCheckStatus} = 'ok' OR ${foodAnalysis.source} = 'maxizoo')`),
      readJournal(d),
    ])
    return rows.map(({ id, extracted, details, lastHistory, source, ...r }) => {
      const scans = [journal.get(id), lastHistory ? new Date(lastHistory) : null].filter((v): v is Date => !!v)
      return {
        ...r,
        fromMaxiZoo: source === 'maxizoo',
        kind: details.kind === 'treat' ? 'treat' : 'complete',
        noun: foodNoun(extracted, details),
        lastScanAt: scans.length ? new Date(Math.max(...scans.map((v) => v.getTime()))) : null,
        complete: isFicheComplete(extracted, r.score),
      } satisfies ListFiche
    })
  } catch (err) {
    console.error('[scanner] listes de fiches indisponibles', err instanceof Error ? err.message : err)
    return []
  }
})
