import type { ScannerResult, ScanType } from '@/lib/scanner/scanner-events'
import { getPool } from './db'

// @cdc scanner — journal des scans (analytics.scanner_events), échecs et introuvables compris.
// L'écriture part en arrière-plan : une base lente, une table absente ou une erreur ne bloquent ni
// ne retardent jamais la réponse du scanner. Ni IP, ni texte d'erreur, ni photo. Journal d'erreur
// réduit au code PostgreSQL, sans identifiant de compte.

export interface ScannerEvent {
  type: ScanType
  result: ScannerResult
  userId?: string | null
  foodAnalysisId?: string | null
}

/** Base bloquée : au-delà, les lignes sont abandonnées plutôt que d'empiler les requêtes en mémoire. */
const MAX_PENDING = 200

const pending = new Set<Promise<void>>()

function logFailure(err: unknown): void {
  const code = err && typeof err === 'object' && 'code' in err ? String(err.code) : 'inconnu'
  console.error('[scanner-events] écriture impossible, code', code)
}

/** Ne lève jamais d'erreur et rend la main tout de suite. */
export function recordScannerEvent(event: ScannerEvent): void {
  try {
    const pool = getPool()
    if (!pool || pending.size >= MAX_PENDING) return
    const write: Promise<void> = pool
      .query('INSERT INTO analytics.scanner_events (scan_type, result, user_id, food_analysis_id) VALUES ($1, $2, $3, $4)', [
        event.type,
        event.result,
        event.userId ?? null,
        event.foodAnalysisId ?? null,
      ])
      .then(() => undefined, logFailure)
      .finally(() => pending.delete(write))
    pending.add(write)
  } catch (err) {
    logFailure(err)
  }
}

/** Pour les tests : attend les écritures en cours, `timeoutMs` au plus. */
export async function flushScannerEvents(timeoutMs = 3_000): Promise<void> {
  let timer: NodeJS.Timeout | undefined
  const limit = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, timeoutMs)
  })
  await Promise.race([Promise.all(pending), limit])
  clearTimeout(timer)
}
