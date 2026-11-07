import type { Pool } from 'pg'
import type { Period } from '@/lib/dashboard/period'
import { OTHER_PLACE } from '@/lib/signup-places'
import type { Kpi } from './dashboard-queries'

// @cdc tableau de bord — section « Inscriptions » (CRO compte) : comptes créés sur la période
// et parcours par emplacement, de l'invitation vue jusqu'à l'e-mail confirmé. Vues et clics
// viennent du navigateur (/api/e), créations et confirmations du serveur (lib/server/signup-source).
// Une confirmation est comptée le jour où elle arrive, pas le jour de l'inscription. Chien ajouté et retour
// un autre jour : mêmes emplacements (signup_sources garde l'emplacement de chaque compte).

export interface SignupFunnelRow {
  place: string
  views: number
  clicks: number
  created: number
  verified: number
  dogs: number
  returns: number
}

export interface SignupsData {
  total: Kpi
  byPlace: SignupFunnelRow[]
}

export const EMPTY_SIGNUPS: SignupsData = { total: { current: 0, previous: 0 }, byPlace: [] }

const NAMES = ['Account Invite View', 'Account Invite Click', 'Account Created', 'Account Verified', 'Dog Added', 'Account Return']

export async function getSignups(pool: Pool, period: Period): Promise<SignupsData> {
  const [total, byPlace] = await Promise.all([
    pool.query<Kpi>(
      `SELECT count(*) FILTER (WHERE ts >= now() - $1::interval)::int AS current,
              count(*) FILTER (WHERE ts < now() - $1::interval)::int AS previous
       FROM analytics.events WHERE name = 'Account Created' AND ts >= now() - 2 * $1::interval`,
      [period.interval],
    ),
    pool.query<SignupFunnelRow>(
      `SELECT coalesce(nullif(props->>'place', ''), $3) AS place,
              count(*) FILTER (WHERE name = 'Account Invite View')::int AS views,
              count(*) FILTER (WHERE name = 'Account Invite Click')::int AS clicks,
              count(*) FILTER (WHERE name = 'Account Created')::int AS created,
              count(*) FILTER (WHERE name = 'Account Verified')::int AS verified,
              count(*) FILTER (WHERE name = 'Dog Added')::int AS dogs,
              count(*) FILTER (WHERE name = 'Account Return')::int AS returns
       FROM analytics.events
       WHERE name = ANY($2) AND ts >= now() - $1::interval
       GROUP BY 1 ORDER BY created DESC, clicks DESC, views DESC, 1`,
      [period.interval, NAMES, OTHER_PLACE],
    ),
  ])
  return { total: total.rows[0] ?? EMPTY_SIGNUPS.total, byPlace: byPlace.rows }
}
