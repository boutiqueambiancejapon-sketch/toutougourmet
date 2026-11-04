import type { FicheCheckStatus } from '@/db/schema/scanner'
import { quietRead } from './dashboard-safe'

// @cdc tableau de bord — contrôle IA des fiches, en lecture seule : compte par statut, dernières
// fiches en doute ou rejetées avec leur raison. Une fiche modifiée depuis son contrôle compte comme
// « à contrôler », comme dans les listes publiques (contenu comparé par md5). Relues et écartées à part.

export type FicheCheckLabel = FicheCheckStatus | 'pending' | 'human'

export interface FicheCheckFlag {
  id: string
  brand: string | null
  product: string | null
  status: FicheCheckStatus
  reason: string
  model: string
  at: Date
}

export interface FicheChecks {
  /** false : migration 0009 pas encore appliquée, ou lecture en échec */
  ready: boolean
  counts: Record<FicheCheckLabel, number>
  flagged: FicheCheckFlag[]
  /** Statut et raison par fiche, pour les lignes « Derniers scans » */
  byFood: Map<string, { status: FicheCheckStatus; reason: string }>
}

const EMPTY: FicheChecks = { ready: false, counts: { ok: 0, doubt: 0, rejected: 0, pending: 0, human: 0 }, flagged: [], byFood: new Map() }

const CURRENT = `c.content_hash = md5(f.extracted::text)`

export async function getFicheChecks(): Promise<FicheChecks> {
  const { value } = await quietRead<FicheChecks>('scanner contrôle IA', EMPTY, async (pool) => {
    const [counts, rows] = await Promise.all([
      pool.query<{ label: FicheCheckLabel; n: number }>(
        `SELECT CASE WHEN f.reviewed OR f.discarded THEN 'human' WHEN ${CURRENT} THEN c.status ELSE 'pending' END AS label, count(*)::int AS n
         FROM app.food_analysis f LEFT JOIN app.food_check c ON c.food_analysis_id = f.id GROUP BY 1`,
      ),
      pool.query<{ id: string; brand: string | null; product: string | null; status: FicheCheckStatus; reason: string; model: string; at: Date }>(
        `SELECT f.id, f.brand, f.product, c.status, c.reason, c.model, c.checked_at AS at
         FROM app.food_check c JOIN app.food_analysis f ON f.id = c.food_analysis_id
         WHERE ${CURRENT} ORDER BY (c.status <> 'ok') DESC, c.checked_at DESC LIMIT 200`,
      ),
    ])
    return {
      ready: true,
      counts: { ...EMPTY.counts, ...Object.fromEntries(counts.rows.map((r) => [r.label, r.n])) },
      flagged: rows.rows.filter((r) => r.status !== 'ok').slice(0, 12),
      byFood: new Map(rows.rows.map((r) => [r.id, { status: r.status, reason: r.reason }])),
    }
  })
  return value
}
