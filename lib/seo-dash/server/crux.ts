import { SITE } from '../config'

// @cdc tableau de bord SEO — client de l'API CrUX (données réelles de Chrome, 28 jours glissants) pour l'origine du
// site, mobile et ordinateur. Clé gratuite Google dans CRUX_API_KEY (/srv/toutou/shared/.env) ; sans clé : « À connecter ».

export interface CruxMetric {
  p75: number
  good: number
  needs: number
  poor: number
}

export interface CruxResult {
  formFactor: 'PHONE' | 'DESKTOP'
  metrics: Partial<Record<'LCP' | 'INP' | 'CLS', CruxMetric>>
}

const NAMES = { largest_contentful_paint: 'LCP', interaction_to_next_paint: 'INP', cumulative_layout_shift: 'CLS' } as const

interface Raw {
  record?: { metrics?: Record<string, { percentiles?: { p75?: number | string }; histogram?: { density?: number }[] }> }
}

export const cruxConfigured = (): boolean => Boolean(process.env.CRUX_API_KEY)

export async function cruxOrigin(formFactor: CruxResult['formFactor']): Promise<CruxResult | null> {
  const key = process.env.CRUX_API_KEY
  if (!key) return null
  const res = await fetch(`https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ origin: SITE.baseUrl, formFactor, metrics: Object.keys(NAMES) }),
    next: { revalidate: 86_400 },
    signal: AbortSignal.timeout(10_000),
  })
  if (res.status === 404) return { formFactor, metrics: {} }
  if (!res.ok) throw new Error(`CrUX ${res.status}`)
  const data = (await res.json()) as Raw
  const metrics: CruxResult['metrics'] = {}
  for (const [raw, name] of Object.entries(NAMES)) {
    const m = data.record?.metrics?.[raw]
    if (!m) continue
    const h = m.histogram ?? []
    metrics[name] = { p75: Number(m.percentiles?.p75 ?? 0), good: h[0]?.density ?? 0, needs: h[1]?.density ?? 0, poor: h[2]?.density ?? 0 }
  }
  return { formFactor, metrics }
}
