// @cdc tableau de bord — périodes proposées par le sélecteur (?periode=24h|7j|30j).
// interval et bucket partent tels quels en paramètres SQL ($n::interval, date_trunc($n, …)).

export const PERIODS = {
  '24h': { label: 'Jour', long: 'les dernières 24 heures', interval: '24 hours', bucket: 'hour', previous: 'aux 24 heures d’avant' },
  '7j': { label: '7 j', long: 'les 7 derniers jours', interval: '7 days', bucket: 'day', previous: 'aux 7 jours d’avant' },
  '30j': { label: '30 j', long: 'les 30 derniers jours', interval: '30 days', bucket: 'day', previous: 'aux 30 jours d’avant' },
} as const

export type PeriodKey = keyof typeof PERIODS
export type Period = (typeof PERIODS)[PeriodKey] & { key: PeriodKey }

/** Paramètre ?periode= à ajouter aux liens entre onglets (rien pour la période par défaut). */
export function periodQuery(key: PeriodKey): string {
  return key === '7j' ? '' : `?periode=${key}`
}

export function parsePeriod(value: string | string[] | undefined): Period {
  const raw = Array.isArray(value) ? value[0] : value
  const key: PeriodKey = raw === '24h' || raw === '30j' ? raw : '7j'
  return { ...PERIODS[key], key }
}
