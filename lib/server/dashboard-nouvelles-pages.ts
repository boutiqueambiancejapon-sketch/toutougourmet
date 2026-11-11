import { safeRead } from './dashboard-safe'

// @cdc tableau de bord — « Nouvelles pages dans Google » (demande du propriétaire, 2026-11-11) : pages vues pour la
// première fois par Google dans les 45 derniers jours (analytics.gsc_pages_daily, rempli chaque nuit), avec leurs
// clics et affichages des 7 derniers jours, des 7 jours d'avant, et la courbe des affichages par semaine.

export interface NouvellePage {
  page: string
  premiere: string
  clics: number
  affichages: number
  clics7: number
  affichages7: number
  affichagesAvant: number
  position7: number | null
  semaines: number[]
}

export async function getNouvellesPages(): Promise<{ ok: boolean; pages: NouvellePage[] }> {
  const r = await safeRead('nouvelles pages GSC', [] as NouvellePage[], async (pool) => {
    const { rows } = await pool.query<NouvellePage>(
      `WITH premiere AS (
         SELECT page, min(day) AS premiere FROM analytics.gsc_pages_daily WHERE impressions > 0 GROUP BY page
       ), recentes AS (
         SELECT * FROM premiere WHERE premiere >= (SELECT max(day) FROM analytics.gsc_pages_daily) - 45
           AND premiere > (SELECT min(day) FROM analytics.gsc_pages_daily) + 3
       ), fin AS (SELECT max(day) AS d FROM analytics.gsc_pages_daily)
       SELECT r.page, to_char(r.premiere, 'DD/MM') AS premiere,
              sum(g.clicks)::int AS clics, sum(g.impressions)::int AS affichages,
              coalesce(sum(g.clicks) FILTER (WHERE g.day > fin.d - 7), 0)::int AS clics7,
              coalesce(sum(g.impressions) FILTER (WHERE g.day > fin.d - 7), 0)::int AS "affichages7",
              coalesce(sum(g.impressions) FILTER (WHERE g.day > fin.d - 14 AND g.day <= fin.d - 7), 0)::int AS "affichagesAvant",
              (sum(g.position * g.impressions) FILTER (WHERE g.day > fin.d - 7) / nullif(sum(g.impressions) FILTER (WHERE g.day > fin.d - 7), 0))::real AS "position7",
              ARRAY(SELECT coalesce(sum(x.impressions), 0)::int FROM generate_series(5, 0, -1) AS w(n)
                      LEFT JOIN analytics.gsc_pages_daily x ON x.page = r.page AND x.day > fin.d - 7 * (w.n + 1) AND x.day <= fin.d - 7 * w.n
                     GROUP BY w.n ORDER BY w.n DESC) AS semaines
         FROM recentes r JOIN analytics.gsc_pages_daily g ON g.page = r.page CROSS JOIN fin
        GROUP BY r.page, r.premiere, fin.d
        ORDER BY r.premiere DESC, affichages DESC
        LIMIT 100`,
    )
    return rows
  })
  return { ok: r.ok, pages: r.value }
}
