import type { Pool } from 'pg'
import type { Pair } from '@/lib/dashboard/compare'
import type { Period } from '@/lib/dashboard/period'
import type { RobotFilter } from '@/lib/dashboard/robots'
import { pageTypeOf, PAGE_TYPE_LABELS } from '@/lib/page-type'
import type { BucketRow, Row } from './dashboard-queries'

// @cdc tableau de bord — robots IA en détail. Journaux Caddy rangés chaque minute (analytics.hits),
// requêtes paramétrées, lecture seule. Le filtre (opérateur, type de visite) s'applique à tout ce
// qui décrit les visites des robots ; les visiteurs envoyés par une IA restent à part.

const AI_KINDS = ['ai_training', 'ai_search', 'ai_user']
const OP = `coalesce(operator, bot, '(inconnu)')`
/** $1 période, $2 types IA, $3 opérateur ou null, $4 type ou null. */
const WHERE = `kind = ANY($2) AND ($3::text IS NULL OR ${OP} = $3) AND ($4::text IS NULL OR kind = $4)`
const TECHNICAL = `(path LIKE '/\\_next/%' OR path LIKE '/tableau-de-bord%')`

export interface RobotLine {
  operator: string
  visits: number
  pages: number
  lastSeen: Date
  bots: { bot: string; kind: string; visits: number }[]
  /** Visites par seau, dans l'ordre du graphique */
  spark: number[]
}

export interface RobotsData {
  visits: Pair
  direct: Pair
  pages: number
  errors: number
  technicalErrors: number
  timeline: BucketRow[]
  hours: number[]
  robots: RobotLine[]
  operators: string[]
  types: Row[]
  paths: Row[]
  directPaths: Row[]
  errorPaths: Row[]
}

const ZERO: Pair = { current: 0, previous: 0 }
export const EMPTY_ROBOTS: RobotsData = { visits: ZERO, direct: ZERO, pages: 0, errors: 0, technicalErrors: 0, timeline: [], hours: Array.from({ length: 24 }, () => 0), robots: [], operators: [], types: [], paths: [], directPaths: [], errorPaths: [] }

export async function getRobots(pool: Pool, period: Period, filter: RobotFilter): Promise<RobotsData> {
  const args = [period.interval, AI_KINDS, filter.robot, filter.kind]
  const [totals, timeline, hours, bots, sparks, operators, paths, direct, errors] = await Promise.all([
    pool.query<Record<string, number>>(
      `SELECT count(*) FILTER (WHERE ts >= now() - $1::interval)::int AS v_c, count(*) FILTER (WHERE ts < now() - $1::interval)::int AS v_p,
              count(*) FILTER (WHERE kind = 'ai_user' AND ts >= now() - $1::interval)::int AS d_c, count(*) FILTER (WHERE kind = 'ai_user' AND ts < now() - $1::interval)::int AS d_p,
              count(DISTINCT path) FILTER (WHERE status < 400 AND NOT ${TECHNICAL} AND ts >= now() - $1::interval)::int AS pages,
              count(*) FILTER (WHERE status >= 400 AND NOT ${TECHNICAL} AND ts >= now() - $1::interval)::int AS errors,
              count(*) FILTER (WHERE status >= 400 AND ${TECHNICAL} AND ts >= now() - $1::interval)::int AS technical
         FROM analytics.hits WHERE ${WHERE} AND ts >= now() - 2 * $1::interval`,
      args,
    ),
    pool.query<BucketRow>(
      `WITH b AS (SELECT generate_series(date_trunc($5, (now() - $1::interval) AT TIME ZONE 'Europe/Paris'), date_trunc($5, now() AT TIME ZONE 'Europe/Paris'), ('1 ' || $5)::interval) AS bucket)
       SELECT to_char(b.bucket, 'YYYY-MM-DD"T"HH24:MI') AS bucket,
              count(h.id) FILTER (WHERE h.kind = 'ai_training')::int AS training,
              count(h.id) FILTER (WHERE h.kind = 'ai_search')::int AS search,
              count(h.id) FILTER (WHERE h.kind = 'ai_user')::int AS "user"
         FROM b LEFT JOIN (SELECT id, kind, ts FROM analytics.hits WHERE ${WHERE} AND ts >= now() - $1::interval) h
           ON date_trunc($5, h.ts AT TIME ZONE 'Europe/Paris') = b.bucket
        GROUP BY b.bucket ORDER BY b.bucket`,
      [...args, period.bucket],
    ),
    pool.query<{ h: number; n: number }>(
      `SELECT extract(hour FROM ts AT TIME ZONE 'Europe/Paris')::int AS h, count(*)::int AS n FROM analytics.hits WHERE ${WHERE} AND ts >= now() - $1::interval GROUP BY 1`,
      args,
    ),
    pool.query<{ operator: string; bot: string; kind: string; visits: number; pages: number; last: Date }>(
      `SELECT ${OP} AS operator, coalesce(bot, '(inconnu)') AS bot, kind, count(*)::int AS visits, count(DISTINCT path)::int AS pages, max(ts) AS last
         FROM analytics.hits WHERE ${WHERE} AND ts >= now() - $1::interval GROUP BY 1, 2, 3`,
      args,
    ),
    pool.query<{ operator: string; bucket: string; n: number }>(
      `SELECT ${OP} AS operator, to_char(date_trunc($5, ts AT TIME ZONE 'Europe/Paris'), 'YYYY-MM-DD"T"HH24:MI') AS bucket, count(*)::int AS n
         FROM analytics.hits WHERE ${WHERE} AND ts >= now() - $1::interval GROUP BY 1, 2`,
      [...args, period.bucket],
    ),
    pool.query<{ operator: string }>(`SELECT DISTINCT ${OP} AS operator FROM analytics.hits WHERE kind = ANY($2) AND ts >= now() - $1::interval ORDER BY 1`, [period.interval, AI_KINDS]),
    pool.query<Row>(`SELECT path AS label, count(*)::int AS value FROM analytics.hits WHERE ${WHERE} AND status < 400 AND NOT ${TECHNICAL} AND ts >= now() - $1::interval GROUP BY 1 ORDER BY 2 DESC, 1`, args),
    pool.query<Row>(
      `SELECT path AS label, count(*)::int AS value FROM analytics.hits WHERE kind = 'ai_user' AND ($2::text IS NULL OR ${OP} = $2) AND status < 400 AND NOT ${TECHNICAL} AND ts >= now() - $1::interval GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT 10`,
      [period.interval, filter.robot],
    ),
    pool.query<Row>(`SELECT status || ' ' || path AS label, count(*)::int AS value FROM analytics.hits WHERE ${WHERE} AND status >= 400 AND NOT ${TECHNICAL} AND ts >= now() - $1::interval GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT 10`, args),
  ])
  const t = totals.rows[0] ?? {}
  const buckets = timeline.rows.map((r) => r.bucket)
  const hourCounts = Array.from({ length: 24 }, () => 0)
  for (const r of hours.rows) hourCounts[r.h] = r.n
  const lines = new Map<string, RobotLine>()
  for (const r of bots.rows) {
    const line = lines.get(r.operator) ?? { operator: r.operator, visits: 0, pages: 0, lastSeen: r.last, bots: [], spark: buckets.map(() => 0) }
    line.visits += r.visits
    line.pages = Math.max(line.pages, r.pages)
    if (r.last > line.lastSeen) line.lastSeen = r.last
    line.bots.push({ bot: r.bot, kind: r.kind, visits: r.visits })
    lines.set(r.operator, line)
  }
  for (const r of sparks.rows) {
    const i = buckets.indexOf(r.bucket)
    const line = lines.get(r.operator)
    if (line && i >= 0) line.spark[i] = r.n
  }
  const types = new Map<string, number>()
  for (const p of paths.rows) {
    const label = PAGE_TYPE_LABELS[pageTypeOf(p.label)]
    types.set(label, (types.get(label) ?? 0) + p.value)
  }
  return {
    visits: { current: t.v_c ?? 0, previous: t.v_p ?? 0 },
    direct: { current: t.d_c ?? 0, previous: t.d_p ?? 0 },
    pages: t.pages ?? 0,
    errors: t.errors ?? 0,
    technicalErrors: t.technical ?? 0,
    timeline: timeline.rows,
    hours: hourCounts,
    robots: [...lines.values()].sort((a, b) => b.visits - a.visits),
    operators: operators.rows.map((o) => o.operator),
    types: [...types.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value),
    paths: paths.rows,
    directPaths: direct.rows,
    errorPaths: errors.rows,
  }
}
