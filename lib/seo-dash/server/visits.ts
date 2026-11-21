import type { Pool } from 'pg'

// @cdc tableau de bord SEO — visites de l'écran Sources, propres à Toutou Gourmet (seul fichier qui change d'un site à
// l'autre). Une visite : les actions d'une même empreinte du jour sans pause de plus de 30 minutes, comme les
// sessions du trafic. Pages vues = balise JS (« Pageview » : les robots qui lancent le JS sont à part dans
// « Pageview (robot) », le propriétaire n'est jamais écrit). Source = celle de la première page vue.

export interface VisitRow {
  /** Jour de la première page vue (heure de Paris). */
  day: string
  landing: string
  ref: string | null
  ai: string | null
  utm: string | null
  medium: string | null
  from: string | null
  device: string | null
  country: string | null
  views: number
  clicks: number
  signups: number
}

/** Libellés des deux conversions comptées par visite. */
export const CONVERSIONS = { clicks: 'clics partenaires', signups: 'inscriptions' } as const

const CLICK_EVENTS = ['Affiliate Click']
const SIGNUP_EVENTS = ['Account Created', 'Newsletter Signup', 'Guide Signup']

export async function visitRows(pool: Pool, start: string, end: string): Promise<VisitRow[]> {
  const { rows } = await pool.query<VisitRow>(
    `WITH a AS (
       SELECT coalesce(visitor, 'e' || id) AS vk, ts, 1 AS pv, page, ref_host, props->>'utm_source' AS utm,
              props->>'utm_medium' AS medium, props->>'from' AS from_path, device, country, 0 AS click, 0 AS signup
         FROM analytics.events
        WHERE name = 'Pageview' AND ts >= ($1::date AT TIME ZONE 'Europe/Paris') AND ts < (($2::date + 1) AT TIME ZONE 'Europe/Paris')
       UNION ALL
       SELECT coalesce(visitor, 'e' || id), ts, 0, page, NULL, NULL, NULL, NULL, device, country,
              (name = ANY($3::text[]))::int, (name = ANY($4::text[]))::int
         FROM analytics.events
        WHERE name = ANY($3::text[] || $4::text[]) AND ts >= ($1::date AT TIME ZONE 'Europe/Paris') AND ts < (($2::date + 1) AT TIME ZONE 'Europe/Paris' + interval '30 minutes')
     ), b AS (
       SELECT *, CASE WHEN lag(ts) OVER w IS NULL OR ts - lag(ts) OVER w > interval '30 minutes' THEN 1 ELSE 0 END AS starts
         FROM a WINDOW w AS (PARTITION BY vk ORDER BY ts, pv DESC)
     ), s AS (
       SELECT *, sum(starts) OVER (PARTITION BY vk ORDER BY ts, pv DESC ROWS UNBOUNDED PRECEDING) AS sid FROM b
     )
     SELECT ((array_agg(ts ORDER BY ts) FILTER (WHERE pv = 1))[1] AT TIME ZONE 'Europe/Paris')::date::text AS day,
            regexp_replace((array_agg(page ORDER BY ts) FILTER (WHERE pv = 1))[1], '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', '[id]', 'gi') AS landing,
            (array_agg(ref_host ORDER BY ts) FILTER (WHERE pv = 1))[1] AS ref,
            NULL::text AS ai,
            (array_agg(utm ORDER BY ts) FILTER (WHERE pv = 1))[1] AS utm,
            (array_agg(medium ORDER BY ts) FILTER (WHERE pv = 1))[1] AS medium,
            (array_agg(from_path ORDER BY ts) FILTER (WHERE pv = 1))[1] AS "from",
            (array_agg(device ORDER BY ts) FILTER (WHERE pv = 1))[1] AS device,
            (array_agg(country ORDER BY ts) FILTER (WHERE pv = 1))[1] AS country,
            sum(pv)::int AS views, sum(click)::int AS clicks, sum(signup)::int AS signups
       FROM s
      GROUP BY vk, sid
     HAVING sum(pv) > 0`,
    [start, end, CLICK_EVENTS, SIGNUP_EVENTS],
  )
  return rows
}
