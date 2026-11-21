import type { Pool } from 'pg'
import { pageTypeOf } from '../config'

// @cdc tableau de bord SEO — Core Web Vitals mesurés chez nos visiteurs (événement « Web Vital » envoyé par la
// balise, bibliothèque web-vitals) : 75e centile et part bon / à améliorer / mauvais, sur mobile, 28 jours.
// Seuils de Google : LCP 2,5 s / 4 s, INP 200 / 500 ms, CLS 0,1 / 0,25.

export const VITAL_LIMITS = { LCP: [2500, 4000], INP: [200, 500], CLS: [0.1, 0.25] } as const
export type VitalName = keyof typeof VITAL_LIMITS

export interface VitalStat {
  n: number
  p75: number
  good: number
  needs: number
  poor: number
}

export interface GroupVitals {
  group: string
  metrics: Partial<Record<VitalName, VitalStat>>
}

const MIN_SAMPLES = 5

function stat(values: number[], name: VitalName): VitalStat {
  const s = [...values].sort((a, b) => a - b)
  const [g, p] = VITAL_LIMITS[name]
  return {
    n: s.length,
    p75: s[Math.min(s.length - 1, Math.floor(s.length * 0.75))],
    good: s.filter((v) => v <= g).length / s.length,
    needs: s.filter((v) => v > g && v <= p).length / s.length,
    poor: s.filter((v) => v > p).length / s.length,
  }
}

async function samples(pool: Pool, page?: string): Promise<{ page: string; m: VitalName; v: number }[]> {
  const { rows } = await pool.query<{ page: string; m: VitalName; v: number }>(
    `SELECT page, props->>'m' AS m, (props->>'v')::float AS v FROM analytics.events
      WHERE name = 'Web Vital' AND ts >= now() - interval '28 days' AND device = 'mobile' AND props->>'m' IN ('LCP', 'INP', 'CLS')
        ${page ? 'AND page = $1' : ''}`,
    page ? [page] : [],
  )
  return rows
}

export async function pageVitals(pool: Pool, page: string): Promise<{ lcp: number | null; inp: number | null }> {
  const rows = await samples(pool, page)
  const pick = (m: VitalName) => {
    const v = rows.filter((r) => r.m === m).map((r) => r.v)
    return v.length >= MIN_SAMPLES ? stat(v, m).p75 : null
  }
  return { lcp: pick('LCP'), inp: pick('INP') }
}

/** Par groupe de pages (types du site), seulement les métriques avec assez de mesures. */
export async function groupVitals(pool: Pool, label: (type: string) => string): Promise<{ groups: GroupVitals[]; samples: number }> {
  const rows = await samples(pool)
  const by = new Map<string, Map<VitalName, number[]>>()
  for (const r of rows) {
    const g = pageTypeOf(r.page)
    const m = by.get(g) ?? new Map<VitalName, number[]>()
    m.set(r.m, [...(m.get(r.m) ?? []), r.v])
    by.set(g, m)
  }
  const groups: GroupVitals[] = []
  for (const [g, m] of by) {
    const metrics: Partial<Record<VitalName, VitalStat>> = {}
    for (const [name, v] of m) if (v.length >= MIN_SAMPLES) metrics[name] = stat(v, name)
    if (Object.keys(metrics).length) groups.push({ group: label(g), metrics })
  }
  return { groups, samples: rows.length }
}
