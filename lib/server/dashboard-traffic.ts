import type { Pool } from 'pg'
import { getAllArticles } from '@/lib/mdx'
import type { Pair } from '@/lib/dashboard/compare'
import type { Period } from '@/lib/dashboard/period'
import type { PageCounts, SessionRow } from '@/lib/dashboard/traffic'
import { MASKED_PAGE } from './dashboard-queries'

// @cdc tableau de bord — lectures du trafic. Requêtes paramétrées, lecture seule. Les sessions se
// calculent sur la période et celle d'avant ; seules les actions portant une empreinte (depuis le
// 2026-11-04) peuvent y entrer. L'empreinte reste sur le serveur et n'est jamais affichée.

/** $1 : la durée de la période. Une ligne par session contenant au moins une page vue. */
const SESSIONS_SQL = `
  WITH e AS (
    SELECT visitor, ts, name, ${MASKED_PAGE} AS page, ref_host, device,
           CASE WHEN lag(ts) OVER w IS NULL OR ts - lag(ts) OVER w > interval '30 minutes' THEN 1 ELSE 0 END AS starts
      FROM analytics.events
     WHERE visitor IS NOT NULL AND ts >= now() - 2 * $1::interval
    WINDOW w AS (PARTITION BY visitor ORDER BY ts)
  ), s AS (
    SELECT *, sum(starts) OVER (PARTITION BY visitor ORDER BY ts) AS sid FROM e
  )
  SELECT visitor,
         min(ts) >= now() - $1::interval AS current,
         extract(epoch FROM max(ts) - min(ts))::int AS seconds,
         count(*) FILTER (WHERE name = 'Pageview')::int AS views,
         (array_agg(page ORDER BY ts) FILTER (WHERE name = 'Pageview'))[1] AS landing,
         (array_agg(ref_host ORDER BY ts) FILTER (WHERE name = 'Pageview'))[1] AS ref,
         (array_agg(device ORDER BY ts) FILTER (WHERE name = 'Pageview'))[1] AS device,
         array_agg(DISTINCT name) AS names
    FROM s
   GROUP BY visitor, sid
  HAVING count(*) FILTER (WHERE name = 'Pageview') > 0`

export async function getSessions(pool: Pool, period: Period): Promise<SessionRow[]> {
  return (await pool.query<SessionRow>(SESSIONS_SQL, [period.interval])).rows
}

export async function getSessionCounts(pool: Pool, period: Period): Promise<Pair> {
  const res = await pool.query<{ current: number; previous: number }>(
    `SELECT count(*) FILTER (WHERE current)::int AS current, count(*) FILTER (WHERE NOT current)::int AS previous FROM (${SESSIONS_SQL}) t`,
    [period.interval],
  )
  return res.rows[0] ?? { current: 0, previous: 0 }
}

export interface TrafficTotals {
  views: Pair
  emails: Pair
  clicks: Pair
  scans: Pair
}

const ZERO: Pair = { current: 0, previous: 0 }
export const EMPTY_TOTALS: TrafficTotals = { views: ZERO, emails: ZERO, clicks: ZERO, scans: ZERO }

/** Mêmes comptes que l'accueil : toutes les actions, avec ou sans empreinte. */
export async function getTotals(pool: Pool, period: Period): Promise<TrafficTotals> {
  const pair = (k: string, names: string) =>
    `count(*) FILTER (WHERE name IN (${names}) AND ts >= now() - $1::interval)::int AS ${k}_c,
     count(*) FILTER (WHERE name IN (${names}) AND ts < now() - $1::interval)::int AS ${k}_p`
  const res = await pool.query<Record<string, number>>(
    `SELECT ${pair('views', `'Pageview'`)}, ${pair('emails', `'Newsletter Signup', 'Guide Signup'`)},
            ${pair('clicks', `'Affiliate Click'`)}, ${pair('scans', `'Scan Result'`)}
       FROM analytics.events WHERE ts >= now() - 2 * $1::interval`,
    [period.interval],
  )
  const row = res.rows[0] ?? {}
  const get = (k: string): Pair => ({ current: row[`${k}_c`] ?? 0, previous: row[`${k}_p`] ?? 0 })
  return { views: get('views'), emails: get('emails'), clicks: get('clicks'), scans: get('scans') }
}

export interface VisitorBucket {
  bucket: string
  n: number
}

/** Visiteurs par heure, jour ou semaine, heure de Paris. */
export async function getVisitorBuckets(pool: Pool, period: Period): Promise<VisitorBucket[]> {
  const res = await pool.query<VisitorBucket>(
    `WITH b AS (
       SELECT generate_series(
         date_trunc($2, (now() - $1::interval) AT TIME ZONE 'Europe/Paris'),
         date_trunc($2, now() AT TIME ZONE 'Europe/Paris'),
         ('1 ' || $2)::interval) AS bucket
     )
     SELECT to_char(b.bucket, 'YYYY-MM-DD"T"HH24:MI') AS bucket, count(DISTINCT e.visitor)::int AS n
       FROM b LEFT JOIN analytics.events e
         ON e.name = 'Pageview' AND e.ts >= now() - $1::interval
        AND date_trunc($2, e.ts AT TIME ZONE 'Europe/Paris') = b.bucket
      GROUP BY b.bucket ORDER BY b.bucket`,
    [period.interval, period.bucket],
  )
  return res.rows
}

export async function getPageCounts(pool: Pool, period: Period): Promise<PageCounts[]> {
  const res = await pool.query<PageCounts>(
    `SELECT ${MASKED_PAGE} AS page,
            count(*) FILTER (WHERE name = 'Pageview')::int AS views,
            count(*) FILTER (WHERE name = 'Affiliate Click')::int AS clicks,
            count(*) FILTER (WHERE name IN ('Newsletter Signup', 'Guide Signup'))::int AS emails
       FROM analytics.events
      WHERE ts >= now() - $1::interval AND name IN ('Pageview', 'Affiliate Click', 'Newsletter Signup', 'Guide Signup')
      GROUP BY 1 ORDER BY 2 DESC, 3 DESC, 1`,
    [period.interval],
  )
  return res.rows
}

/** Titre lisible d'une page : celui de l'article, sinon son chemin. */
export function pageTitles(): Map<string, string> {
  return new Map(
    getAllArticles()
      .filter((a) => a.frontmatter.categorySlug)
      .map((a) => [`/chien/${a.frontmatter.categorySlug}/${a.slug}`, a.frontmatter.title]),
  )
}
