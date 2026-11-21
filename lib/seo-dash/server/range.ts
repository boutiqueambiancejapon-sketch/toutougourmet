import type { Pool } from 'pg'
import { SITE } from '../config'
import type { Filters } from '../filters'

// @cdc tableau de bord SEO — périodes. Google publie avec 2 à 3 jours de retard : ses périodes finissent au dernier
// jour relevé. Les journaux du serveur finissent aujourd'hui. La comparaison sur un an n'existe que si Google
// avait déjà des données ce jour-là (SITE.gscStart).

export interface Range {
  start: string
  end: string
}

export interface Ranges {
  cur: Range
  prev: Range | null
  /** Pourquoi il n'y a pas de comparaison (an dernier indisponible). */
  note: string | null
  last: string
  /** La période d'avant commence avant les premières données : pas d'écart à montrer. */
  partial: boolean
  firstData: string
}

const DAY = 86_400_000
export const iso = (d: Date): string => d.toISOString().slice(0, 10)
export const addDays = (day: string, n: number): string => iso(new Date(new Date(`${day}T00:00:00Z`).getTime() + n * DAY))
export const daysBetween = (a: string, b: string): number => Math.round((new Date(`${b}T00:00:00Z`).getTime() - new Date(`${a}T00:00:00Z`).getTime()) / DAY)

/** Jours d'une période, du premier au dernier. */
export function daysOf(r: Range): string[] {
  const out: string[] = []
  for (let d = r.start; d <= r.end; d = addDays(d, 1)) out.push(d)
  return out
}

export function rangesFrom(last: string, f: Filters, firstData: string): Ranges {
  const cur = { start: addDays(last, -(f.days - 1)), end: last }
  const base = { last, firstData, partial: false }
  if (f.compare === 'aucune') return { ...base, cur, prev: null, note: null }
  if (f.compare === 'annee') {
    const prev = { start: addDays(cur.start, -364), end: addDays(cur.end, -364) }
    if (prev.start < firstData) {
      return { ...base, cur, prev: null, note: `Comparer à l’an dernier : disponible à partir du ${frDate(addDays(firstData, 364 + f.days - 1))} (données depuis le ${frDate(firstData)}).` }
    }
    return { ...base, cur, prev, note: null }
  }
  const prev = { start: addDays(cur.start, -f.days), end: addDays(cur.start, -1) }
  return { ...base, cur, prev, note: null, partial: prev.start < firstData }
}

const frFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
export const frDate = (day: string): string => frFmt.format(new Date(`${day}T00:00:00Z`))

let cachedLast: { at: number; day: string } | null = null

/** Dernier jour relevé dans la Search Console (cache d'une minute). */
export async function gscLastDay(pool: Pool): Promise<string> {
  if (cachedLast && Date.now() - cachedLast.at < 60_000) return cachedLast.day
  const { rows } = await pool.query<{ d: string | null }>(`SELECT max(day)::text AS d FROM analytics.gsc_site_daily`)
  const day = rows[0]?.d ?? iso(new Date(Date.now() - 3 * DAY))
  cachedLast = { at: Date.now(), day }
  return day
}

export async function gscRanges(pool: Pool, f: Filters): Promise<Ranges> {
  return rangesFrom(await gscLastDay(pool), f, SITE.gscStart)
}

/** Journaux du serveur : jusqu'à aujourd'hui (heure de Paris). */
export function logRanges(f: Filters): Ranges {
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Paris' }).format(new Date())
  return rangesFrom(today, f, SITE.logsStart)
}

/** Période ramenée au premier jour des données (pas de colonnes vides avant le début des journaux). */
export function clipStart(r: Ranges): Ranges {
  return r.cur.start >= r.firstData ? r : { ...r, cur: { ...r.cur, start: r.firstData } }
}
