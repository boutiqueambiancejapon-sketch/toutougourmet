import { count, eq, sql } from 'drizzle-orm'
import { foodAnalysis, foodCheck } from '@/db/schema'
import { ficheCheckInput } from '@/lib/scanner/fiche-check'
import type { FicheCheckRow, FicheCheckStore, PendingFiche } from '@/lib/scanner/fiche-check-run'
import type { Db } from './drizzle'

// @cdc scanner — magasin du contrôle IA. Lecture de food_analysis, écriture dans food_check
// seulement : ni reviewed, ni discarded, ni updated_at ne bougent (indexation et sitemap inchangés).
// Une fiche relue ou écartée a déjà un jugement humain : le modèle n'est pas appelé.

const HASH = sql<string>`md5(${foodAnalysis.extracted}::text)`

export function ficheCheckStore(db: Db, { recheckDoubt = false }: { recheckDoubt?: boolean } = {}): FicheCheckStore {
  // Fiches Maxi Zoo : recopiées sans IA d'une page structurée, pas de contrôle payant.
  const where = sql`NOT ${foodAnalysis.reviewed} AND NOT ${foodAnalysis.discarded} AND ${foodAnalysis.source} <> 'maxizoo'
    AND (${foodCheck.foodAnalysisId} IS NULL OR ${foodCheck.contentHash} <> ${HASH}${recheckDoubt ? sql` OR ${foodCheck.status} = 'doubt'` : sql``})`
  const onCheck = eq(foodCheck.foodAnalysisId, foodAnalysis.id)
  return {
    async pendingCount() {
      const [row] = await db.select({ n: count() }).from(foodAnalysis).leftJoin(foodCheck, onCheck).where(where)
      return row?.n ?? 0
    },
    async pending(limit): Promise<PendingFiche[]> {
      const rows = await db
        .select({ id: foodAnalysis.id, extracted: foodAnalysis.extracted, details: foodAnalysis.details, contentHash: HASH })
        .from(foodAnalysis)
        .leftJoin(foodCheck, onCheck)
        .where(where)
        .orderBy(sql`(${foodAnalysis.scanCount} > 0) DESC`, sql`${foodAnalysis.createdAt} DESC`, foodAnalysis.id)
        .limit(limit)
      return rows.map((r) => ({ id: r.id, contentHash: r.contentHash, input: ficheCheckInput(r.extracted, r.details) }))
    },
    async save({ foodAnalysisId, ...row }: FicheCheckRow) {
      const values = { ...row, checkedAt: new Date() }
      await db
        .insert(foodCheck)
        .values({ foodAnalysisId, ...values })
        .onConflictDoUpdate({ target: foodCheck.foodAnalysisId, set: values })
    },
  }
}
