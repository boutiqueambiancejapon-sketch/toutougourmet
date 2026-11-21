import type { Pool } from 'pg'
import { SITE } from '../config'
import { isHourly, type Filters } from '../filters'

// @cdc tableau de bord SEO — périodes. Google publie avec 2 à 3 jours de retard : ses périodes finissent au dernier
// jour relevé. Les journaux du serveur finissent aujourd'hui. La comparaison sur un an n'existe que si Google
// avait déjà des données ce jour-là (SITE.gscStart).

export interface Range {
  /** Premier et dernier jour (heure de Paris), même pour une fenêtre en heures. */
  start: string
  end: string
  /** Fenêtre en heures (24 h, aujourd'hui) : bornes exactes, instants UTC ISO, fin exclue. */
  from?: string
  to?: string
  hourly?: boolean
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

const HOUR = 3_600_000
const parisFmt = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' })

/** Clé d'heure « AAAA-MM-JJTHH » (heure de Paris), la même que bucketSql. */
export function hourKey(t: number): string {
  const s = parisFmt.format(new Date(t))
  return `${s.slice(0, 10)}T${s.slice(11, 13)}`
}

/** Jours d'une période, du premier au dernier ; heures (« AAAA-MM-JJTHH ») pour une fenêtre en heures. */
export function daysOf(r: Range): string[] {
  if (r.hourly && r.from && r.to) {
    const keys: string[] = []
    for (let t = Date.parse(r.from); t < Date.parse(r.to); t += HOUR) {
      const k = hourKey(t)
      if (keys[keys.length - 1] !== k) keys.push(k)
    }
    return keys
  }
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
  const last = await gscLastDay(pool)
  if (!isHourly(f)) return rangesFrom(last, f, SITE.gscStart)
  // Pas d'heures chez Google : le dernier jour publié, comparé au jour d'avant (ou à l'an dernier).
  return rangesFrom(last, { ...f, days: 1 }, SITE.gscStart)
}

/** Journaux du serveur : jusqu'à aujourd'hui (heure de Paris), à l'heure près pour 24 h et aujourd'hui. */
export function logRanges(f: Filters, now = Date.now()): Ranges {
  if (isHourly(f)) return hourRanges(f, now)
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Paris' }).format(new Date(now))
  return rangesFrom(today, f, SITE.logsStart)
}

const dayOfT = (t: number): string => hourKey(t).slice(0, 10)

function windowOf(from: number, to: number): Range {
  return { start: dayOfT(from), end: dayOfT(to - 1), from: new Date(from).toISOString(), to: new Date(to).toISOString(), hourly: true }
}

/** 24 h : les 24 dernières heures entamées. Aujourd'hui : depuis minuit (Paris). Avant : même durée juste avant
 * (pour aujourd'hui : hier aux mêmes heures) ; l'an dernier : 364 jours plus tôt. */
export function hourRanges(f: Filters, now = Date.now()): Ranges {
  const to = Math.floor(now / HOUR) * HOUR + HOUR
  let from = to - 24 * HOUR
  if (f.period === 'aujourdhui') {
    const k = hourKey(now)
    from = Math.floor(now / HOUR) * HOUR - Number(k.slice(11, 13)) * HOUR
  }
  const cur = windowOf(from, to)
  const firstData = SITE.logsStart
  const base = { last: cur.end, firstData, partial: false, note: null }
  if (f.compare === 'aucune') return { ...base, cur, prev: null }
  const shift = f.compare === 'annee' ? 364 * 24 * HOUR : 24 * HOUR
  const prev = windowOf(from - shift, to - shift)
  if (f.compare === 'annee' && prev.start < firstData) return { ...base, cur, prev: null, note: `Comparer à l’an dernier : pas de relevés à cette date (journaux depuis le ${frDate(firstData)}).` }
  return { ...base, cur, prev, partial: prev.start < firstData }
}

/** Conditions SQL d'une période sur une colonne horodatée (paramètres ajoutés par add). */
export function spanSql(p: { add(v: unknown): string }, r: Range, col = 'ts', padEnd = ''): string {
  const pad = padEnd ? ` + interval '${padEnd}'` : ''
  if (r.from && r.to) return `${col} >= ${p.add(r.from)}::timestamptz AND ${col} < ${p.add(r.to)}::timestamptz${pad}`
  return `${col} >= (${p.add(r.start)}::date AT TIME ZONE 'Europe/Paris') AND ${col} < ((${p.add(r.end)}::date + 1) AT TIME ZONE 'Europe/Paris')${pad}`
}

/** Clé de regroupement SQL : le jour, ou l'heure (« AAAA-MM-JJTHH ») pour une fenêtre en heures. */
export function bucketSql(r: Range, col = 'ts'): string {
  return r.hourly ? `to_char(${col} AT TIME ZONE 'Europe/Paris', 'YYYY-MM-DD"T"HH24')` : `(${col} AT TIME ZONE 'Europe/Paris')::date::text`
}

/** Vrai si la clé (jour ou heure) tombe dans la période. */
export function inRange(r: Range, key: string): boolean {
  if (!r.hourly) return key.slice(0, 10) >= r.start && key.slice(0, 10) <= r.end
  const keys = daysOf(r)
  return key >= (keys[0] ?? '') && key <= (keys[keys.length - 1] ?? '')
}

/** Google publie avec 2 à 3 jours de retard : en 24 h ou aujourd'hui, ses écrans montrent le dernier jour publié. */
export function googleDelayNote(f: Filters, last: string): string | null {
  if (!isHourly(f)) return null
  return `Google publie ses chiffres avec 2–3 jours de retard : ${f.period === '24h' ? '24 h' : 'aujourd’hui'} n’est pas disponible ici. Chiffres du dernier jour publié, le ${frDate(last)}.`
}

/** Période ramenée au premier jour des données (pas de colonnes vides avant le début des journaux). */
export function clipStart(r: Ranges): Ranges {
  return r.cur.start >= r.firstData ? r : { ...r, cur: { ...r.cur, start: r.firstData } }
}
