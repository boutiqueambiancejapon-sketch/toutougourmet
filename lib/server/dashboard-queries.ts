import type { Pool } from 'pg'
import type { Period } from '@/lib/dashboard/period'

// @cdc tableau de bord — lectures du schéma analytics (db/analytics.sql). Requêtes paramétrées
// uniquement : la période arrive en $1::interval, jamais concaténée dans le SQL.
// Fuseau Europe/Paris pour les regroupements par jour ou par heure.

export interface Row {
  label: string
  value: number
}

export interface Kpi {
  current: number
  previous: number
}

export interface BucketRow {
  bucket: string
  training: number
  search: number
  user: number
}

/** Onglet Conversions : clics partenaires et inscriptions à la lettre, au détail. */
export interface PartnerData {
  clicksByBrand: Row[]
  clicksByPlace: Row[]
  clicksByPage: Row[]
  signupsByPlace: Row[]
  /** Guide PDF : inscriptions et téléchargements (bouton du site) sur la période */
  guide: Row[]
}

/** Onglet Visiteurs : pages lues, provenances et usage des outils. */
export interface AudienceData {
  pageViews: Kpi
  topPages: Row[]
  referrers: Row[]
  toolResults: Kpi
  tools: Row[]
  foodSearches: Row[]
  foodMisses: Row[]
}

export const EMPTY_PARTNERS: PartnerData = { clicksByBrand: [], clicksByPlace: [], clicksByPage: [], signupsByPlace: [], guide: [] }

const ZERO: Kpi = { current: 0, previous: 0 }
export const EMPTY_AUDIENCE: AudienceData = { pageViews: ZERO, topPages: [], referrers: [], toolResults: ZERO, tools: [], foodSearches: [], foodMisses: [] }

export interface AiData {
  byOperator: Row[]
  byKind: Row[]
  timeline: BucketRow[]
  topPages: Row[]
  aiReadPaths: string[]
  referrals: Row[]
  landingPages: Row[]
  errors: Row[]
}

const AI_KINDS = ['ai_training', 'ai_search', 'ai_user']
const LIMIT = 10

async function rows(pool: Pool, sql: string, params: unknown[]): Promise<Row[]> {
  const res = await pool.query<Row>(sql, params)
  return res.rows
}

/** Compte sur la période et sur celle d'avant, en une requête. */
async function kpi(pool: Pool, sql: string, params: unknown[]): Promise<Kpi> {
  const res = await pool.query<Kpi>(sql, params)
  return res.rows[0] ?? { current: 0, previous: 0 }
}

const KPI_COLUMNS = `
  count(*) FILTER (WHERE ts >= now() - $1::interval)::int AS current,
  count(*) FILTER (WHERE ts < now() - $1::interval)::int AS previous`

function eventKpi(pool: Pool, interval: string, name: string): Promise<Kpi> {
  return kpi(
    pool,
    `SELECT ${KPI_COLUMNS} FROM analytics.events WHERE name = $2 AND ts >= now() - 2 * $1::interval`,
    [interval, name],
  )
}

/** Événements d'un type regroupés par une propriété (props->>key) ou par page. */
function eventsBy(pool: Pool, interval: string, name: string, key: string | null): Promise<Row[]> {
  const label = key === null ? 'page' : `coalesce(nullif(props->>$3, ''), '(non précisé)')`
  const params = key === null ? [interval, name, LIMIT] : [interval, name, key, LIMIT]
  const limit = key === null ? '$3' : '$4'
  return rows(
    pool,
    `SELECT ${label} AS label, count(*)::int AS value FROM analytics.events
     WHERE name = $2 AND ts >= now() - $1::interval
     GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT ${limit}`,
    params,
  )
}

const SIGNUP_EVENTS = ['Newsletter Signup', 'Guide Signup']

/** Inscriptions à la lettre par source ; celles du guide portent le préfixe « guide · ». */
function signupsBySource(pool: Pool, interval: string): Promise<Row[]> {
  return rows(
    pool,
    `SELECT CASE WHEN name = 'Guide Signup' THEN 'guide · ' ELSE '' END || coalesce(nullif(props->>'place', ''), '(non précisé)') AS label,
            count(*)::int AS value
     FROM analytics.events WHERE name = ANY($2) AND ts >= now() - $1::interval
     GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT $3`,
    [interval, SIGNUP_EVENTS, LIMIT],
  )
}

function guideRows(pool: Pool, interval: string): Promise<Row[]> {
  return rows(
    pool,
    `SELECT CASE name WHEN 'Guide Signup' THEN 'Inscriptions au guide' ELSE 'Téléchargements du PDF' END AS label,
            count(*)::int AS value
     FROM analytics.events WHERE name IN ('Guide Signup', 'Guide Download') AND ts >= now() - $1::interval
     GROUP BY name ORDER BY name DESC`,
    [interval],
  )
}

export async function getPartners(pool: Pool, period: Period): Promise<PartnerData> {
  const i = period.interval
  const [clicksByBrand, clicksByPlace, clicksByPage, signupsByPlace, guide] = await Promise.all([
    eventsBy(pool, i, 'Affiliate Click', 'brand'),
    eventsBy(pool, i, 'Affiliate Click', 'place'),
    eventsBy(pool, i, 'Affiliate Click', null),
    signupsBySource(pool, i),
    guideRows(pool, i),
  ])
  return { clicksByBrand, clicksByPlace, clicksByPage, signupsByPlace, guide }
}

// Identifiants (chien, fiche) remplacés par « [id] » : aucun chemin ne renvoie à un compte.
export const MASKED_PAGE = `regexp_replace(page, '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', '[id]', 'gi')`

export async function getAudience(pool: Pool, period: Period): Promise<AudienceData> {
  const i = period.interval
  const [pageViews, topPages, referrers, toolResults, tools, foodSearches, foodMisses] = await Promise.all([
    // Pages vues confirmées par le navigateur (événement Pageview) : les journaux du serveur
    // comptent aussi les préchargements et les robots déguisés en navigateurs.
    eventKpi(pool, i, 'Pageview'),
    rows(
      pool,
      `SELECT ${MASKED_PAGE} AS label, count(*)::int AS value FROM analytics.events
       WHERE name = 'Pageview' AND ts >= now() - $1::interval GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT $2`,
      [i, LIMIT],
    ),
    rows(
      pool,
      `SELECT coalesce(ref_host, 'Accès direct ou inconnu') AS label, count(*)::int AS value FROM analytics.events
       WHERE name = 'Pageview' AND ts >= now() - $1::interval
         AND (ref_host IS NULL OR ref_host NOT LIKE '%toutou-gourmet.com')
       GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT $2`,
      [i, LIMIT],
    ),
    eventKpi(pool, i, 'Tool Result'),
    eventsBy(pool, i, 'Tool Result', 'tool'),
    eventsBy(pool, i, 'Food Search', 'query'),
    rows(
      pool,
      `SELECT props->>'query' AS label, count(*)::int AS value FROM analytics.events
       WHERE name = 'Food Search' AND ts >= now() - $1::interval
         AND props->>'found' = 'false' AND coalesce(props->>'query', '') <> ''
       GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT $2`,
      [i, LIMIT],
    ),
  ])
  return { pageViews, topPages, referrers, toolResults, tools, foodSearches, foodMisses }
}

export async function getAi(pool: Pool, period: Period): Promise<AiData> {
  const i = period.interval
  const [byOperator, byKind, timeline, topPages, aiRead, referrals, landingPages, errors] = await Promise.all([
    rows(
      pool,
      `SELECT coalesce(operator, bot, '(inconnu)') AS label, count(*)::int AS value FROM analytics.hits
       WHERE kind = ANY($2) AND ts >= now() - $1::interval GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT $3`,
      [i, AI_KINDS, LIMIT],
    ),
    rows(
      pool,
      `SELECT kind AS label, count(*)::int AS value FROM analytics.hits
       WHERE kind = ANY($2) AND ts >= now() - $1::interval GROUP BY 1 ORDER BY 2 DESC`,
      [i, AI_KINDS],
    ),
    pool
      .query<BucketRow>(
        `WITH b AS (
           SELECT generate_series(
             date_trunc($2, (now() - $1::interval) AT TIME ZONE 'Europe/Paris'),
             date_trunc($2, now() AT TIME ZONE 'Europe/Paris'),
             ('1 ' || $2)::interval) AS bucket
         )
         SELECT to_char(b.bucket, 'YYYY-MM-DD"T"HH24:MI') AS bucket,
           count(h.id) FILTER (WHERE h.kind = 'ai_training')::int AS training,
           count(h.id) FILTER (WHERE h.kind = 'ai_search')::int AS search,
           count(h.id) FILTER (WHERE h.kind = 'ai_user')::int AS "user"
         FROM b LEFT JOIN analytics.hits h
           ON h.kind = ANY($3) AND h.ts >= now() - $1::interval
          AND date_trunc($2, h.ts AT TIME ZONE 'Europe/Paris') = b.bucket
         GROUP BY b.bucket ORDER BY b.bucket`,
        [i, period.bucket, AI_KINDS],
      )
      .then((r) => r.rows),
    rows(
      pool,
      `SELECT path AS label, count(*)::int AS value FROM analytics.hits
       WHERE kind = ANY($2) AND status < 400 AND ts >= now() - $1::interval AND path NOT LIKE '/\\_next/%'
       GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT $3`,
      [i, AI_KINDS, LIMIT],
    ),
    // Toutes périodes confondues : une page lue une fois par un robot IA n'est plus « jamais lue ».
    pool
      .query<{ path: string }>(`SELECT DISTINCT path FROM analytics.hits WHERE kind = ANY($1) AND status < 400`, [AI_KINDS])
      .then((r) => r.rows.map((x) => x.path)),
    rows(
      pool,
      `SELECT ref_ai AS label, count(*)::int AS value FROM analytics.hits
       WHERE kind = 'human' AND ref_ai IS NOT NULL AND ts >= now() - $1::interval GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT $2`,
      [i, LIMIT],
    ),
    rows(
      pool,
      `SELECT path AS label, count(*)::int AS value FROM analytics.hits
       WHERE kind = 'human' AND ref_ai IS NOT NULL AND ts >= now() - $1::interval GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT $2`,
      [i, LIMIT],
    ),
    rows(
      pool,
      `SELECT status || ' ' || path AS label, count(*)::int AS value FROM analytics.hits
       WHERE kind = ANY($2) AND status >= 400 AND ts >= now() - $1::interval GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT $3`,
      [i, AI_KINDS, LIMIT],
    ),
  ])
  return { byOperator, byKind, timeline, topPages, aiReadPaths: aiRead, referrals, landingPages, errors }
}
