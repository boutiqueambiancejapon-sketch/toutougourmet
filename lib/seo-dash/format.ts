// @cdc tableau de bord SEO — nombres et dates à la française, une seule fois pour toutes les vues.

const nf0 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const nf2 = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const dayFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const longFmt = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Paris' })

export const n0 = (v: number): string => nf0.format(v)
export const n1 = (v: number): string => nf1.format(v)
export const n2 = (v: number): string => nf2.format(v)
export const eur = (v: number): string => `${nf0.format(Math.round(v))} €`
/** Taux (0,0123) → « 1,23 % » ; au-dessus de 10 %, une décimale. */
export const pct = (ratio: number): string => `${ratio >= 0.1 ? nf1.format(ratio * 100) : nf2.format(ratio * 100)} %`
export const pct0 = (ratio: number): string => `${nf0.format(ratio * 100)} %`

/** « 21 nov. » pour une date AAAA-MM-JJ. */
export function dayLabel(iso: string): string {
  return dayFmt.format(new Date(`${iso.slice(0, 10)}T00:00:00Z`))
}

export function todayLong(now = new Date()): string {
  return longFmt.format(now)
}

/** Compte court pour un axe : 0, 500, 1 000, 10 k. */
export function axisNum(v: number): string {
  if (Math.abs(v) >= 10_000) return `${nf0.format(v / 1000)} k`
  return Number.isInteger(v) ? nf0.format(v) : nf1.format(v)
}

export interface DeltaText {
  text: string
  /** good : dans le bon sens, bad : dans le mauvais, flat : pas de changement. */
  tone: 'good' | 'bad' | 'flat'
  dir: 'up' | 'down' | 'flat'
}

/** Écart en % (ou en points pour un taux, en rangs pour une position). upIsGood : sens favorable. */
export function deltaOf(cur: number, prev: number, kind: 'count' | 'rate' | 'position' = 'count', upIsGood = true): DeltaText {
  const diff = cur - prev
  const dir = Math.abs(diff) < 1e-9 ? 'flat' : diff > 0 ? 'up' : 'down'
  const good = dir === 'flat' ? 'flat' : (dir === 'up') === upIsGood ? 'good' : 'bad'
  const sign = diff > 0 ? '+' : diff < 0 ? '−' : '+'
  if (kind === 'rate') return { text: `${sign}${nf2.format(Math.abs(diff) * 100)} pt`, tone: good, dir }
  if (kind === 'position') {
    const word = diff < 0 ? 'gagne' : diff > 0 ? 'recule' : 'stable'
    return { text: dir === 'flat' ? 'stable' : `${word} de ${nf1.format(Math.abs(diff))}`, tone: good, dir }
  }
  if (prev === 0) return { text: cur === 0 ? '=' : `+${nf0.format(cur)}`, tone: good, dir }
  return { text: `${sign}${nf1.format((Math.abs(diff) / prev) * 100)} %`, tone: good, dir }
}

/** Chemin raccourci pour une cellule : « /…/avis-croquettes-orlando-lidl ». */
export function shortPath(path: string, max = 46): string {
  if (path.length <= max) return path
  const parts = path.split('/').filter(Boolean)
  const last = `/…/${parts[parts.length - 1] ?? ''}`
  return last.length <= max ? last : `${last.slice(0, max - 1)}…`
}

/** Arrondi pour un export (2 décimales par défaut). */
export const round = (v: number, digits = 2): number => Math.round(v * 10 ** digits) / 10 ** digits
