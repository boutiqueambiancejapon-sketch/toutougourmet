import type { Pool } from 'pg'
import { EMPTY_COUNTS, FAILURE_RESULTS, summarizeEvents, type EventCountRow, type ScannerCounts } from '@/lib/scanner/scanner-events'
import { quietRead } from './dashboard-safe'
import { dailyCalls, SCANNER_DAILY_CAP } from './scanner-daily'

// @cdc tableau de bord — santé du scanner. Les chiffres viennent d'analytics.scanner_events, qui ne
// remonte pas avant sa mise en service. « Derniers scans » complète avec l'ancien historique des
// comptes (app.scan_history) pour la période d'avant le journal. Chaque bloc se lit à part.

export interface FailureRow {
  id: string
  at: Date
  scanType: string
  result: string
  userId: string | null
  email: string | null
}

export interface RecentScanRow {
  key: string
  at: Date
  eventType: string | null
  fromCache: boolean | null
  foodId: string | null
  brand: string | null
  product: string | null
  score: number | null
  source: string | null
  userId: string | null
  email: string | null
}

export interface ScannerHealth {
  /** false : table absente, db/analytics.sql pas encore appliqué */
  journal: boolean
  counts: ScannerCounts
  reports: number | null
  calls: number | null
  cap: number
  failures: FailureRow[]
  scans: RecentScanRow[]
  /** Au moins un bloc n'a pas pu être lu */
  partial: boolean
}

const TODAY_START = `(date_trunc('day', now() AT TIME ZONE 'Europe/Paris') AT TIME ZONE 'Europe/Paris')`

async function journalExists(pool: Pool): Promise<boolean> {
  const { rows } = await pool.query<{ ok: boolean }>(`SELECT to_regclass('analytics.scanner_events') IS NOT NULL AS ok`)
  return rows[0]?.ok === true
}

async function readCounts(pool: Pool): Promise<ScannerCounts> {
  const { rows } = await pool.query<EventCountRow>(
    `SELECT scan_type, result,
            count(*) FILTER (WHERE created_at >= ${TODAY_START})::int AS today,
            count(*)::int AS week
     FROM analytics.scanner_events
     WHERE created_at >= ${TODAY_START} - interval '6 days'
     GROUP BY scan_type, result`,
  )
  return summarizeEvents(rows)
}

async function readFailures(pool: Pool): Promise<FailureRow[]> {
  const { rows } = await pool.query<FailureRow>(
    `SELECT e.id::text AS id, e.created_at AS at, e.scan_type AS "scanType", e.result, e.user_id AS "userId", u.email
     FROM analytics.scanner_events e LEFT JOIN app."user" u ON u.id = e.user_id
     WHERE e.result = ANY($1::text[])
     ORDER BY e.created_at DESC LIMIT 10`,
    [FAILURE_RESULTS],
  )
  return rows
}

const SCAN_COLUMNS = `f.id AS "foodId", f.brand, f.product, f.score, f.source, u.id AS "userId", u.email`

/**
 * Journal (scans anonymes compris) et, pour la période d'avant le journal, historique des comptes.
 * Marge d'une minute : le tout premier scan journalisé a sa ligne d'historique juste avant sa ligne
 * de journal, et s'afficherait deux fois.
 */
async function readScans(pool: Pool, journal: boolean): Promise<RecentScanRow[]> {
  const history = `SELECT 'h' || h.id::text AS key, h.created_at AS at, NULL::text AS "eventType", h.from_cache AS "fromCache", ${SCAN_COLUMNS}
     FROM app.scan_history h
     JOIN app.food_analysis f ON f.id = h.food_analysis_id
     JOIN app."user" u ON u.id = h.user_id`
  const sql = journal
    ? `SELECT 'e' || e.id::text AS key, e.created_at AS at, e.scan_type AS "eventType", NULL::boolean AS "fromCache", ${SCAN_COLUMNS}
       FROM analytics.scanner_events e
       LEFT JOIN app.food_analysis f ON f.id = e.food_analysis_id
       LEFT JOIN app."user" u ON u.id = e.user_id
       WHERE e.result = 'found'
       UNION ALL
       ${history}
       WHERE h.created_at < (SELECT coalesce(min(created_at), 'infinity') FROM analytics.scanner_events) - interval '1 minute'`
    : history
  const { rows } = await pool.query<RecentScanRow>(`${sql} ORDER BY at DESC LIMIT 15`)
  return rows
}

async function readReports(pool: Pool): Promise<number> {
  const { rows } = await pool.query<{ n: number }>('SELECT count(*)::int AS n FROM app.scan_report WHERE handled_at IS NULL')
  return rows[0]?.n ?? 0
}

export async function getScannerHealth(): Promise<ScannerHealth> {
  const exists = await quietRead('scanner journal', false, journalExists)
  const journal = exists.value
  const [counts, failures, scans, reports, calls] = await Promise.all([
    journal ? quietRead('scanner chiffres', EMPTY_COUNTS, readCounts) : { value: EMPTY_COUNTS, ok: true },
    journal ? quietRead<FailureRow[]>('scanner échecs', [], readFailures) : { value: [], ok: true },
    quietRead<RecentScanRow[]>('scanner derniers scans', [], (pool) => readScans(pool, journal)),
    quietRead<number | null>('scanner signalements', null, readReports),
    quietRead<number | null>('scanner plafond', null, () => dailyCalls()),
  ])
  return {
    journal,
    counts: counts.value,
    reports: reports.value,
    calls: calls.value,
    cap: SCANNER_DAILY_CAP,
    failures: failures.value,
    scans: scans.value,
    partial: ![exists, counts, failures, scans, reports, calls].every((r) => r.ok),
  }
}
