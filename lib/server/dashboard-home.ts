import type { Pool } from 'pg'
import type { Period } from '@/lib/dashboard/period'
import type { Pair } from '@/lib/dashboard/compare'
import { checkNight } from './alerts/checks'
import { getServerHealth } from './dashboard-health'
import { AWAITING_REVIEW_SQL } from './scanner-published'

// @cdc tableau de bord — données de l'accueil, choisies pour être légères : une requête pour les
// cinq chiffres (période + période d'avant), une pour l'histogramme des clics, trois comptes
// pour « À faire », l'état du serveur et de la dernière nuit. Le reste vit dans les onglets.

export interface HomeKpis {
  clicks: Pair
  /** Visiteurs distincts par jour, cumulés : l'empreinte change chaque jour (lib/server/visitor-id.ts). Compté depuis le 2026-11-04. */
  visitors: Pair
  views: Pair
  emails: Pair
  accounts: Pair
  scans: Pair
}

export interface ClickBucket {
  bucket: string
  n: number
}

const ZERO: Pair = { current: 0, previous: 0 }
export const EMPTY_KPIS: HomeKpis = { clicks: ZERO, visitors: ZERO, views: ZERO, emails: ZERO, accounts: ZERO, scans: ZERO }

/** Événement(s) compté(s) par chiffre. Une inscription au guide inscrit aussi à la lettre. */
const METRICS: Record<Exclude<keyof HomeKpis, 'visitors'>, string[]> = {
  clicks: ['Affiliate Click'],
  views: ['Pageview'],
  emails: ['Newsletter Signup', 'Guide Signup'],
  accounts: ['Account Created'],
  scans: ['Scan Result'],
}

export async function getHomeKpis(pool: Pool, period: Period): Promise<HomeKpis> {
  const keys = Object.keys(METRICS) as (keyof typeof METRICS)[]
  const names = keys.flatMap((k) => METRICS[k])
  const cols = keys
    .map((k, i) => {
      const p = `$${i + 3}`
      return `count(*) FILTER (WHERE name = ANY(${p}) AND ts >= now() - $1::interval)::int AS "${k}_c",
              count(*) FILTER (WHERE name = ANY(${p}) AND ts < now() - $1::interval)::int AS "${k}_p"`
    })
    .join(',\n')
  const visitorCols = `count(DISTINCT visitor) FILTER (WHERE name = 'Pageview' AND ts >= now() - $1::interval)::int AS "visitors_c",
              count(DISTINCT visitor) FILTER (WHERE name = 'Pageview' AND ts < now() - $1::interval)::int AS "visitors_p"`
  const res = await pool.query<Record<string, number>>(
    `SELECT ${cols}, ${visitorCols} FROM analytics.events WHERE name = ANY($2) AND ts >= now() - 2 * $1::interval`,
    [period.interval, names, ...keys.map((k) => METRICS[k])],
  )
  const row = res.rows[0] ?? {}
  const pair = (k: keyof HomeKpis): Pair => ({ current: row[`${k}_c`] ?? 0, previous: row[`${k}_p`] ?? 0 })
  return { clicks: pair('clicks'), visitors: pair('visitors'), views: pair('views'), emails: pair('emails'), accounts: pair('accounts'), scans: pair('scans') }
}

/** Clics partenaires par heure (période « Jour ») ou par jour, heure de Paris. Le premier seau,
 * entamé, garde la somme des barres égale au total de la tuile. */
export async function getClickBuckets(pool: Pool, period: Period): Promise<ClickBucket[]> {
  const res = await pool.query<ClickBucket>(
    `WITH b AS (
       SELECT generate_series(
         date_trunc($2, (now() - $1::interval) AT TIME ZONE 'Europe/Paris'),
         date_trunc($2, now() AT TIME ZONE 'Europe/Paris'),
         ('1 ' || $2)::interval) AS bucket
     )
     SELECT to_char(b.bucket, 'YYYY-MM-DD"T"HH24:MI') AS bucket, count(e.id)::int AS n
     FROM b LEFT JOIN analytics.events e
       ON e.name = 'Affiliate Click' AND e.ts >= now() - $1::interval
      AND date_trunc($2, e.ts AT TIME ZONE 'Europe/Paris') = b.bucket
     GROUP BY b.bucket ORDER BY b.bucket`,
    [period.interval, period.bucket],
  )
  return res.rows
}

export interface TodoCounts {
  /** null : compte illisible (table absente, droits manquants) */
  messages: number | null
  toReview: number | null
  reports: number | null
}

export async function getTodoCounts(pool: Pool): Promise<TodoCounts> {
  const one = (sql: string) =>
    pool
      .query<{ n: number }>(sql)
      .then((r) => r.rows[0]?.n ?? 0)
      .catch((err: unknown) => {
        console.error('[tableau-de-bord] à faire', err instanceof Error ? err.message : err)
        return null
      })
  const [messages, toReview, reports] = await Promise.all([
    one('SELECT count(*)::int AS n FROM analytics.contact_messages WHERE NOT handled'),
    one(`SELECT count(*)::int AS n FROM app.food_analysis WHERE ${AWAITING_REVIEW_SQL}`),
    one('SELECT count(*)::int AS n FROM app.scan_report WHERE handled_at IS NULL'),
  ])
  return { messages, toReview, reports }
}

export interface StatusLine {
  text: string
  tab: 'serveur' | 'contenu'
}

/** Problèmes en cours : serveur, tâches, sauvegarde (dashboard-health) et dernière nuit (alertes). */
export async function getStatusLines(now = new Date()): Promise<StatusLine[]> {
  const [health, night] = await Promise.all([getServerHealth(), checkNight(now).catch(() => [])])
  const lines: StatusLine[] = night.map((n) => ({ text: n.line, tab: 'contenu' }))
  // Une nuit en échec est déjà dite par le compte rendu : pas de seconde ligne pour la même tâche.
  for (const a of health.alertItems) if (!(lines.length > 0 && a.tab === 'contenu')) lines.push(a)
  return lines
}
