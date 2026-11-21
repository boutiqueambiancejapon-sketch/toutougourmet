import { SITE } from './config'

// @cdc tableau de bord SEO — barre commune (période, comparaison, type de page, appareil), lue dans l'adresse
// et partagée par toute la page : chaque bloc, chaque export CSV lisent les mêmes filtres.

export const PERIOD_DAYS = { '7j': 7, '28j': 28, '3m': 91, '6m': 182, '12m': 364 } as const
export type PeriodKey = keyof typeof PERIOD_DAYS
export const PERIOD_LABEL: Record<PeriodKey, string> = { '7j': '7 jours', '28j': '28 jours', '3m': '3 mois', '6m': '6 mois', '12m': '12 mois' }

export const COMPARE_LABEL = { avant: 'période d’avant', annee: 'l’an dernier', aucune: 'rien' } as const
export type CompareKey = keyof typeof COMPARE_LABEL

export const DEVICE_LABEL = { tous: 'Tous', mobile: 'Mobile', ordinateur: 'Ordinateur', tablette: 'Tablette' } as const
export type DeviceKey = keyof typeof DEVICE_LABEL
/** Valeurs de la Search Console et des journaux pour chaque appareil. */
export const DEVICE_GSC: Record<Exclude<DeviceKey, 'tous'>, string> = { mobile: 'MOBILE', ordinateur: 'DESKTOP', tablette: 'TABLET' }
export const DEVICE_HITS: Record<Exclude<DeviceKey, 'tous'>, string> = { mobile: 'mobile', ordinateur: 'desktop', tablette: 'tablet' }

export interface Filters {
  period: PeriodKey
  days: number
  compare: CompareKey
  /** Type de page (config.pageTypes) ou « toutes ». */
  pages: string
  device: DeviceKey
}

export type RawParams = Record<string, string | string[] | undefined>

const one = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v[0] : v)

export function parseFilters(params: RawParams): Filters {
  const p = one(params.periode)
  const period: PeriodKey = p && p in PERIOD_DAYS ? (p as PeriodKey) : '28j'
  const c = one(params.comparer)
  const compare: CompareKey = c && c in COMPARE_LABEL ? (c as CompareKey) : 'avant'
  const t = one(params.pages)
  const pages = t && SITE.pageTypes.some((x) => x.key === t) ? t : 'toutes'
  const d = one(params.appareil)
  const device: DeviceKey = d && d in DEVICE_LABEL ? (d as DeviceKey) : 'tous'
  return { period, days: PERIOD_DAYS[period], compare, pages, device }
}

/** Paramètres d'adresse des filtres (les valeurs par défaut sont omises). */
export function filterQuery(f: Filters, change: Partial<Filters> = {}, extra: Record<string, string> = {}): string {
  const n = { ...f, ...change }
  const q = new URLSearchParams()
  if (n.period !== '28j') q.set('periode', n.period)
  if (n.compare !== 'avant') q.set('comparer', n.compare)
  if (n.pages !== 'toutes') q.set('pages', n.pages)
  if (n.device !== 'tous') q.set('appareil', n.device)
  for (const [k, v] of Object.entries(extra)) q.set(k, v)
  const s = q.toString()
  return s ? `?${s}` : ''
}

export function compareLabel(f: Filters): string {
  if (f.compare === 'annee') return 'l’an dernier'
  if (f.compare === 'aucune') return ''
  return `${PERIOD_LABEL[f.period]} d’avant`
}
