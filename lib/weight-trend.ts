// @cdc premium — alerte de poids : on compare les deux dernières pesées. Une variation de plus
// de 5 % en moins de 2 mois (61 jours) déclenche l'alerte (prise ou perte). Fonction pure,
// testée par scripts/test-account-offers.ts.

export const WEIGHT_ALERT_PCT = 5
export const WEIGHT_ALERT_DAYS = 61

export interface WeightPoint {
  /** AAAA-MM-JJ */
  date: string
  weightKg: number
}

export interface WeightTrend {
  kind: 'gain' | 'loss'
  from: WeightPoint
  to: WeightPoint
  /** Variation en %, arrondie au dixième (positive pour une prise) */
  pct: number
  days: number
}

const dayNumber = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return Date.UTC(y, m - 1, d) / 86_400_000
}

/** Pesées triées de la plus ancienne à la plus récente (à date égale, l'ordre reçu est gardé). */
export function sortByDate<T extends WeightPoint>(points: readonly T[]): T[] {
  return [...points].sort((a, b) => dayNumber(a.date) - dayNumber(b.date))
}

export function weightTrend(points: readonly WeightPoint[]): WeightTrend | null {
  const sorted = sortByDate(points)
  if (sorted.length < 2) return null
  const from = sorted[sorted.length - 2]
  const to = sorted[sorted.length - 1]
  const days = dayNumber(to.date) - dayNumber(from.date)
  if (days <= 0 || days > WEIGHT_ALERT_DAYS || from.weightKg <= 0) return null
  const pct = Math.round(((to.weightKg - from.weightKg) / from.weightKg) * 1000) / 10
  if (Math.abs(pct) <= WEIGHT_ALERT_PCT) return null
  return { kind: pct > 0 ? 'gain' : 'loss', from, to, pct, days }
}
