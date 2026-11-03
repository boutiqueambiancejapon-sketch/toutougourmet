// @cdc tableau de bord — écart avec la période d'avant, en texte court. En pourcentage quand la
// période d'avant compte au moins 20 (assez pour qu'un % veuille dire quelque chose), sinon en nombre.

export interface Pair {
  current: number
  previous: number
}

export type Trend = 'up' | 'down' | 'flat'

const nf = new Intl.NumberFormat('fr-FR')
const MIN_FOR_PERCENT = 20

export function trendOf({ current, previous }: Pair): Trend {
  if (current === previous) return 'flat'
  return current > previous ? 'up' : 'down'
}

/** « +5 », « −2 », « +12 % », « = » */
export function deltaShort(pair: Pair): string {
  const diff = pair.current - pair.previous
  if (diff === 0) return '='
  const sign = diff > 0 ? '+' : '−'
  if (pair.previous >= MIN_FOR_PERCENT) {
    const pct = Math.round((Math.abs(diff) / pair.previous) * 100)
    if (pct > 0) return `${sign}${pct} %`
  }
  return `${sign}${nf.format(Math.abs(diff))}`
}

/** Variante lue par un lecteur d'écran ou sous la grande tuile. */
export function deltaLong(pair: Pair, previousLabel: string): string {
  if (pair.current === pair.previous) return `Autant que ${previousLabel.replace(/^aux /, 'les ')}`
  return `${deltaShort(pair)} par rapport ${previousLabel}`
}
