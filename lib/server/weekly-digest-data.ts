import type { Pool } from 'pg'
import { addDays, parisDate } from '@/lib/emails/schedule'
import { getServerHealth, type ServerHealth } from './dashboard-health'
import { readNightRun, type NightRun } from './night-logs'
import { AWAITING_REVIEW_SQL } from './scanner-published'

// @cdc e-mails — chiffres du résumé hebdomadaire (lundi 8 h 40). Semaine civile de Paris, du lundi
// 0 h au lundi suivant 0 h, comparée à la semaine d'avant. Requêtes paramétrées, aucune donnée
// personnelle : des comptes, des marques, des chemins de pages, des opérateurs de robots.

export interface Pair {
  current: number
  previous: number
}

export interface Row {
  label: string
  value: number
}

export interface WeeklyDigestData {
  /** Lundi de la semaine résumée (AAAA-MM-JJ) */
  weekStart: string
  pageViews: Pair
  newsletter: Pair
  accounts: Pair
  premium: Pair
  affiliateClicks: Pair
  scansPhoto: Pair
  scansBarcode: Pair
  clicksByBrand: Row[]
  aiByOperator: Row[]
  topPages: Row[]
  toReview: { total: number; newThisWeek: number }
  openReports: number
  nights: NightRun[]
  server: ServerHealth
}

/** Lundi de la dernière semaine complète, vue de Paris à l'instant donné. */
export function lastWeekStart(now: Date): string {
  const today = parisDate(now)
  const dow = (new Date(`${today}T12:00:00Z`).getUTCDay() + 6) % 7 // lundi = 0
  return addDays(today, -dow - 7)
}

// $1 : lundi de la semaine résumée. Bornes en instants, minuit heure de Paris.
const S = `(($1::date)::timestamp AT TIME ZONE 'Europe/Paris')`
const E = `(($1::date + 7)::timestamp AT TIME ZONE 'Europe/Paris')`
const P = `(($1::date - 7)::timestamp AT TIME ZONE 'Europe/Paris')`
const PAIR = (col: string) =>
  `count(*) FILTER (WHERE ${col} >= ${S})::int AS current, count(*) FILTER (WHERE ${col} < ${S})::int AS previous`

async function pair(pool: Pool, from: string, col: string, where: string, week: string, extra: unknown[] = []): Promise<Pair> {
  const res = await pool.query<Pair>(`SELECT ${PAIR(col)} FROM ${from} WHERE ${col} >= ${P} AND ${col} < ${E} AND ${where}`, [week, ...extra])
  return res.rows[0] ?? { current: 0, previous: 0 }
}

const event = (pool: Pool, week: string, name: string, origin?: string) =>
  pair(pool, 'analytics.events', 'ts', origin ? `name = $2 AND props->>'origin' = $3` : 'name = $2', week, origin ? [name, origin] : [name])

async function rows(pool: Pool, sql: string, week: string): Promise<Row[]> {
  return (await pool.query<Row>(sql, [week])).rows
}

export async function getWeeklyDigestData(pool: Pool, weekStart: string): Promise<WeeklyDigestData> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) throw new Error(`semaine invalide : ${weekStart}`)
  const w = weekStart
  const week = `ts >= ${S} AND ts < ${E}`
  const [pageViews, newsletter, accounts, premium, affiliateClicks, scansPhoto, scansBarcode, clicksByBrand, aiByOperator, topPages, review, reports, nights, server] =
    await Promise.all([
      event(pool, w, 'Pageview'),
      event(pool, w, 'Newsletter Signup'),
      pair(pool, 'app."user"', 'created_at', 'true', w),
      pair(pool, 'app.membership', 'activated_at', `plan = 'premium'`, w),
      event(pool, w, 'Affiliate Click'),
      event(pool, w, 'Scan Result', 'photo'),
      event(pool, w, 'Scan Barcode'),
      rows(pool, `SELECT coalesce(nullif(props->>'brand', ''), '(non précisée)') AS label, count(*)::int AS value FROM analytics.events
                  WHERE name = 'Affiliate Click' AND ${week} GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT 10`, w),
      rows(pool, `SELECT coalesce(operator, bot, '(inconnu)') AS label, count(*)::int AS value FROM analytics.hits
                  WHERE kind IN ('ai_training', 'ai_search', 'ai_user') AND ${week} GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT 10`, w),
      // Identifiants (chien, fiche) remplacés par « [id] » : aucun chemin ne renvoie à un compte.
      rows(pool, `SELECT regexp_replace(page, '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', '[id]', 'gi') AS label, count(*)::int AS value FROM analytics.events
                  WHERE name = 'Pageview' AND ${week} GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT 5`, w),
      pool.query<{ total: number; new_this_week: number }>(
        `SELECT count(*)::int AS total, count(*) FILTER (WHERE created_at >= ${S} AND created_at < ${E})::int AS new_this_week
         FROM app.food_analysis WHERE ${AWAITING_REVIEW_SQL}`,
        [w],
      ),
      pool.query<{ n: number }>(`SELECT count(*)::int AS n FROM app.scan_report WHERE handled_at IS NULL`),
      Promise.all(Array.from({ length: 7 }, (_, i) => readNightRun(addDays(w, i)))),
      getServerHealth(),
    ])
  return {
    weekStart: w,
    pageViews,
    newsletter,
    accounts,
    premium,
    affiliateClicks,
    scansPhoto,
    scansBarcode,
    clicksByBrand,
    aiByOperator,
    topPages,
    toReview: { total: review.rows[0]?.total ?? 0, newThisWeek: review.rows[0]?.new_this_week ?? 0 },
    openReports: reports.rows[0]?.n ?? 0,
    nights,
    server,
  }
}
