import type { Pool } from 'pg'
import type { Period } from '@/lib/dashboard/period'
import type { Row } from '@/lib/server/dashboard-queries'

// @cdc tableau de bord — section « Pays » : pages vues (hits humains des journaux Caddy) et
// actions (analytics.events) regroupées par pays. Pays absent → libellé vide, affiché « Inconnu ».
// Requêtes paramétrées, période en $1::interval.

export interface GeoData {
  viewsTotal: number
  views: Row[]
  clicks: Row[]
  signups: Row[]
  tools: Row[]
}

export const EMPTY_GEO: GeoData = { viewsTotal: 0, views: [], clicks: [], signups: [], tools: [] }

const VIEW_LIMIT = 15
const EVENT_LIMIT = 10

async function eventsByCountry(pool: Pool, interval: string, names: string[]): Promise<Row[]> {
  const res = await pool.query<Row>(
    `SELECT coalesce(country, '') AS label, count(*)::int AS value FROM analytics.events
     WHERE name = ANY($2) AND ts >= now() - $1::interval
     GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT $3`,
    [interval, names, EVENT_LIMIT],
  )
  return res.rows
}

export async function getGeo(pool: Pool, period: Period): Promise<GeoData> {
  const i = period.interval
  const [total, views, clicks, signups, tools] = await Promise.all([
    pool.query<{ n: number }>(
      `SELECT count(*)::int AS n FROM analytics.events
       WHERE name = 'Pageview' AND ts >= now() - $1::interval`,
      [i],
    ),
    pool.query<Row>(
      `SELECT coalesce(country, '') AS label, count(*)::int AS value FROM analytics.events
       WHERE name = 'Pageview' AND ts >= now() - $1::interval
       GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT $2`,
      [i, VIEW_LIMIT],
    ),
    eventsByCountry(pool, i, ['Affiliate Click']),
    eventsByCountry(pool, i, ['Newsletter Signup']),
    eventsByCountry(pool, i, ['Tool Result']),
  ])
  return { viewsTotal: total.rows[0]?.n ?? 0, views: views.rows, clicks, signups, tools }
}
