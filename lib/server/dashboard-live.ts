import type { Pool } from 'pg'

// @cdc tableau de bord — données de la vue « En direct » : pages vues des 30 dernières minutes
// (événements Pageview envoyés par le site), pays du moment, fil des dernières actions, robots IA récents
// (journaux Caddy rangés chaque minute). Requêtes paramétrées, lecture seule.

export interface LiveEvent {
  ts: string
  name: string
  page: string
  detail: string | null
  device: string | null
  ref: string | null
  country: string | null
}

export interface LiveData {
  now: string
  views5: number
  perMinute: number[]
  pages: { label: string; value: number }[]
  refs: { label: string; value: number }[]
  /** Pages vues des 5 dernières minutes par pays (code ISO, vide si inconnu). */
  countries: { label: string; value: number }[]
  feed: LiveEvent[]
  bots: { ts: string; label: string; kind: string; path: string }[]
}

export async function getLive(pool: Pool): Promise<LiveData> {
  const [views, minutes, pages, refs, countries, feed, bots] = await Promise.all([
    pool.query<{ n: number }>(
      `SELECT count(*)::int AS n FROM analytics.events WHERE name = 'Pageview' AND ts >= now() - interval '5 minutes'`,
    ),
    pool.query<{ m: number; n: number }>(
      `SELECT floor(extract(epoch FROM (now() - ts)) / 60)::int AS m, count(*)::int AS n
         FROM analytics.events WHERE name = 'Pageview' AND ts >= now() - interval '30 minutes' GROUP BY 1`,
    ),
    pool.query<{ label: string; value: number }>(
      `SELECT page AS label, count(*)::int AS value FROM analytics.events
        WHERE name = 'Pageview' AND ts >= now() - interval '5 minutes' GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT 8`,
    ),
    pool.query<{ label: string; value: number }>(
      `SELECT ref_host AS label, count(*)::int AS value FROM analytics.events
        WHERE name = 'Pageview' AND ref_host IS NOT NULL AND ref_host NOT LIKE '%toutou-gourmet.com'
          AND ts >= now() - interval '30 minutes' GROUP BY 1 ORDER BY 2 DESC LIMIT 6`,
    ),
    pool.query<{ label: string; value: number }>(
      `SELECT coalesce(country, '') AS label, count(*)::int AS value FROM analytics.events
        WHERE name = 'Pageview' AND ts >= now() - interval '5 minutes' GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT 8`,
    ),
    pool.query<{ ts: Date; name: string; page: string; detail: string | null; device: string | null; ref: string | null; country: string | null }>(
      `SELECT ts, name, page, coalesce(props->>'brand', props->>'tool', props->>'query', props->>'place') AS detail,
              device, ref_host AS ref, country
         FROM analytics.events ORDER BY ts DESC LIMIT 25`,
    ),
    pool.query<{ ts: Date; label: string; kind: string; path: string }>(
      `SELECT ts, coalesce(operator, bot, '?') AS label, kind, path FROM analytics.hits
        WHERE kind LIKE 'ai\\_%' AND ts >= now() - interval '30 minutes' ORDER BY ts DESC LIMIT 12`,
    ),
  ])
  const perMinute = Array.from({ length: 30 }, () => 0)
  for (const r of minutes.rows) if (r.m >= 0 && r.m < 30) perMinute[29 - r.m] = r.n
  return {
    now: new Date().toISOString(),
    views5: views.rows[0]?.n ?? 0,
    perMinute,
    pages: pages.rows,
    refs: refs.rows,
    countries: countries.rows,
    feed: feed.rows.map((r) => ({ ...r, ts: r.ts.toISOString() })),
    bots: bots.rows.map((r) => ({ ...r, ts: r.ts.toISOString() })),
  }
}
