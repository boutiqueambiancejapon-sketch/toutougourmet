import { desc, eq, sql } from 'drizzle-orm'
import { opffImportRun, opffProduct, type OpffImportRun } from '@/db/schema'
import type { OpffProduct } from '@/lib/scanner/opff'
import { recordToProduct } from '@/lib/scanner/opff-import'
import { getDb } from './drizzle'

// @cdc lot 6 — lecture de la copie locale d'Open Pet Food Facts (app.opff_product) et des
// passages de l'import (app.opff_import_run). Écriture : scripts/opff-import.ts.

/** Un import réussi depuis plus longtemps que ça : alerte (lib/server/alerts/checks.ts). */
export const OPFF_IMPORT_MAX_AGE_DAYS = 8

/** Fiche de la copie locale au format de l'API, ou null (absente, ou base non reliée). */
export async function findLocalProduct(ean: string): Promise<OpffProduct | null> {
  const d = getDb()
  if (!d) return null
  const [row] = await d.select().from(opffProduct).where(eq(opffProduct.ean, ean)).limit(1)
  return row ? recordToProduct(row) : null
}

export interface OpffImportStatusData {
  last: OpffImportRun | null
  lastOk: OpffImportRun | null
  products: number
  scorable: number
  indexable: number
}

/** Dernier passage, dernier passage réussi et contenu de la table (tableau de bord, alertes). */
export async function getOpffImportStatus(): Promise<OpffImportStatusData | null> {
  const d = getDb()
  if (!d) return null
  const [[last], [lastOk], [counts]] = await Promise.all([
    d.select().from(opffImportRun).orderBy(desc(opffImportRun.startedAt)).limit(1),
    d.select().from(opffImportRun).where(eq(opffImportRun.status, 'ok')).orderBy(desc(opffImportRun.startedAt)).limit(1),
    d
      .select({
        products: sql<number>`count(*)::int`,
        scorable: sql<number>`count(*) FILTER (WHERE ${opffProduct.scorable})::int`,
        indexable: sql<number>`count(*) FILTER (WHERE ${opffProduct.indexable})::int`,
      })
      .from(opffProduct),
  ])
  return { last: last ?? null, lastOk: lastOk ?? null, products: counts?.products ?? 0, scorable: counts?.scorable ?? 0, indexable: counts?.indexable ?? 0 }
}
