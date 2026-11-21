import type { Pool } from 'pg'
import type { Filters } from '../filters'
import { dayLabel, n0, pct } from '../format'
import { googlebotSql } from './crawl'
import { deltas, gscAgg } from './gsc-core'
import { addDays, gscRanges, logRanges } from './range'
import { Params } from './sql'
import { ctrShift } from './today'

// @cdc tableau de bord SEO — « À surveiller » : écarts inhabituels repérés par règles fixes (pic de robots d'IA,
// taux de clic qui baisse quand les affichages montent, erreurs serveur pour Googlebot, plus forte progression).

export interface Anomaly {
  status: 'good' | 'warn' | 'crit' | 'info'
  text: string
  meta: string
  href: string
  hrefLabel: string
}

export interface AnomalyLinks {
  exploration: string
  google: string
  page: (p: string) => string
}

export async function anomalies(pool: Pool, f: Filters, links: AnomalyLinks): Promise<Anomaly[]> {
  const out: Anomaly[] = []
  const logs = logRanges({ ...f, period: '28j', days: 28 })
  const { rows: ai } = await pool.query<{ day: string; n: number; op: string | null }>(
    `SELECT (ts AT TIME ZONE 'Europe/Paris')::date::text AS day, count(*)::int AS n, mode() WITHIN GROUP (ORDER BY operator) AS op
       FROM analytics.hits WHERE kind LIKE 'ai\\_%' AND ts >= $1::date GROUP BY 1 ORDER BY 1`,
    [addDays(logs.last, -27)],
  )
  if (ai.length >= 7) {
    const mean = ai.reduce((a, x) => a + x.n, 0) / ai.length
    const recent = ai.slice(-7).reduce((m, x) => (x.n > m.n ? x : m), ai[ai.length - 7])
    if (recent.n >= mean * 2.5) {
      out.push({ status: 'warn', text: `Pic de robots d’IA : ${n0(recent.n)} passages en un jour (${(recent.n / mean).toFixed(1).replace('.', ',')} fois la moyenne)${recent.op ? `, surtout ${recent.op}` : ''}.`, meta: dayLabel(recent.day), href: links.exploration, hrefLabel: 'Exploration' })
    }
  }
  const shift = await ctrShift(pool, f)
  if (shift && shift.prev.impressions > 0 && shift.cur.impressions > shift.prev.impressions * 1.1 && shift.cur.ctr < shift.prev.ctr * 0.9) {
    out.push({
      status: 'warn',
      text: `Le taux de clic baisse (${pct(shift.prev.ctr)} → ${pct(shift.cur.ctr)}) alors que les affichages montent (+${n0(Math.round(((shift.cur.impressions - shift.prev.impressions) / shift.prev.impressions) * 100))} %) : de nouvelles pages apparaissent, encore bas dans Google.`,
      meta: `${f.days} jours`,
      href: links.google,
      hrefLabel: 'Google',
    })
  }
  const q = new Params()
  const g2 = await googlebotSql(q)
  const { rows: e5 } = await pool.query<{ day: string; n: number }>(
    `SELECT (ts AT TIME ZONE 'Europe/Paris')::date::text AS day, count(*)::int AS n FROM analytics.hits
      WHERE ${g2} AND status >= 500 AND ts >= ${q.add(addDays(logs.last, -27))}::date GROUP BY 1 ORDER BY 2 DESC LIMIT 1`,
    q.values,
  )
  if (e5[0] && e5[0].n >= 5) {
    const old = e5[0].day < addDays(logs.last, -2)
    out.push({ status: old ? 'info' : 'crit', text: `${n0(e5[0].n)} erreurs serveur (5xx) pour Googlebot en une journée (le pire jour des 4 dernières semaines).`, meta: dayLabel(e5[0].day), href: links.exploration, hrefLabel: 'Exploration' })
  }
  const r = await gscRanges(pool, f)
  if (r.prev) {
    const [a, b] = await Promise.all([gscAgg(pool, f, r.cur, 'page'), gscAgg(pool, f, r.prev, 'page')])
    const best = deltas(a, b, 1).up[0]
    if (best && best.diff >= 10) {
      out.push({ status: 'good', text: `« ${best.key.split('/').pop()} » : +${n0(best.diff)} clics, meilleure progression du site.`, meta: `${f.days} jours`, href: links.page(best.key), hrefLabel: 'Page' })
    }
  }
  return out
}
