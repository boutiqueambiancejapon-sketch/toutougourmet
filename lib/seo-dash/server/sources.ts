import type { Pool } from 'pg'
import { pageTypeOf } from '../config'
import { DEVICE_HITS, type Filters } from '../filters'
import { classify, FAMILIES, type Family, parseSourceKey, sourceKey } from '../source'
import { addDays, clipStart, daysOf, inRange, logRanges, type Range, type Ranges } from './range'
import { visitRows, type VisitRow } from './visits'

// @cdc tableau de bord SEO — écran Sources (même fichier sur les trois sites) : visites classées par famille et par
// source, sur la période et celle d'avant, avec pages par visite et conversions pour 100 visites. Filtres communs :
// appareil de la première page, type de la page d'arrivée. La navigation interne n'est pas une entrée : comptée à part.

export interface Visit extends VisitRow {
  family: Family
  name: string
  key: string
}

export interface Metrics {
  visits: number
  views: number
  clicks: number
  signups: number
}

export interface SourceRow extends Metrics {
  key: string
  family: Family
  name: string
  /** Visites sur la période d'avant ; null sans comparaison. */
  prev: number | null
  /** Visites par jour (ou par semaine). */
  spark: number[]
  /** Page d'arrivée la plus fréquente et nombre de pages d'arrivée différentes (28/11/2026 : « je ne vois pas quelle page »). */
  top?: string
  pages?: number
  /** Campagne (utm_source / utm_campaign) la plus fréquente, quand le lien en porte une. */
  utm?: string
}

export type DeviceKind = 'mobile' | 'desktop' | 'tablet'
export const DEVICE_KINDS: { key: DeviceKind; label: string; color: string }[] = [
  { key: 'mobile', label: 'Mobile', color: 'var(--sd-f2)' },
  { key: 'desktop', label: 'Ordinateur', color: 'var(--sd-f1)' },
  { key: 'tablet', label: 'Tablette', color: 'var(--sd-f3)' },
]

export interface FamilyRow extends SourceRow {
  label: string
  color: string
  rows: SourceRow[]
  devices: Record<DeviceKind, number>
  countries: { code: string; n: number }[]
}

export interface Bucket {
  label: string
  title: string
}

export interface Loaded {
  ranges: Ranges
  /** Écarts à montrer (comparaison choisie et période d'avant complète). */
  compare: boolean
  week: boolean
  /** Pas des colonnes : « heure », « jour » ou « semaine ». */
  step: string
  buckets: Bucket[]
  bucketOf: (day: string) => number
  cur: Visit[]
  prev: Visit[]
}

export interface SourcesData {
  ranges: Ranges
  compare: boolean
  week: boolean
  step: string
  buckets: Bucket[]
  total: Metrics & { prev: number | null }
  /** Visites commencées par une page du site (onglet laissé ouvert plus de 30 min). */
  internal: number
  families: FamilyRow[]
}

const dayFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const longFmt = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', timeZone: 'UTC' })
const at = (day: string) => new Date(`${day}T00:00:00Z`)

/** Lundi de la semaine d'un jour. */
const monday = (day: string): string => addDays(day, -((at(day).getUTCDay() + 6) % 7))

function bucketsOf(r: Range, week: boolean): { buckets: Bucket[]; bucketOf: (day: string) => number } {
  const days = daysOf(r)
  if (r.hourly) {
    const idx = new Map(days.map((d, i) => [d, i]))
    const h = (k: string) => `${Number(k.slice(11, 13))} h`
    return { buckets: days.map((k) => ({ label: h(k), title: `${longFmt.format(at(k.slice(0, 10)))}, ${h(k)}` })), bucketOf: (k) => idx.get(k) ?? -1 }
  }
  if (!week) {
    const idx = new Map(days.map((d, i) => [d, i]))
    return { buckets: days.map((d) => ({ label: dayFmt.format(at(d)), title: longFmt.format(at(d)) })), bucketOf: (d) => idx.get(d) ?? -1 }
  }
  const starts = [...new Set(days.map(monday))]
  const idx = new Map(starts.map((d, i) => [d, i]))
  return {
    buckets: starts.map((d) => ({ label: dayFmt.format(at(d)), title: `semaine du ${dayFmt.format(at(d))}` })),
    bucketOf: (d) => idx.get(monday(d)) ?? -1,
  }
}

function keep(f: Filters) {
  const device = f.device === 'tous' ? null : DEVICE_HITS[f.device]
  return (v: VisitRow) => (!device || v.device === device) && (f.pages === 'toutes' || pageTypeOf(v.landing.split('?')[0] ?? v.landing) === f.pages)
}

function classified(rows: VisitRow[], f: Filters): Visit[] {
  return rows.filter(keep(f)).map((r) => {
    const c = classify({ host: r.ref, ai: r.ai, utmSource: r.utm, utmMedium: r.medium, from: r.from })
    return { ...r, family: c.family, name: c.name, key: sourceKey(c) }
  })
}

/** Visites de la période et de celle d'avant, classées (une lecture pour les deux). */
export async function loadVisits(pool: Pool, f: Filters): Promise<Loaded> {
  const ranges = clipStart(logRanges(f))
  const compare = Boolean(ranges.prev) && !ranges.partial
  const span: Range = compare && ranges.prev ? { ...ranges.cur, start: ranges.prev.start, from: ranges.prev.from } : ranges.cur
  const rows = await visitRows(pool, span)
  const week = f.days > 28
  const { buckets, bucketOf } = bucketsOf(ranges.cur, week)
  const inCur = (d: string) => inRange(ranges.cur, d)
  const inPrev = (d: string) => Boolean(compare && ranges.prev && inRange(ranges.prev, d))
  return {
    ranges,
    compare,
    week,
    step: ranges.cur.hourly ? 'heure' : week ? 'semaine' : 'jour',
    buckets,
    bucketOf,
    cur: classified(rows.filter((r) => inCur(r.day)), f),
    prev: classified(rows.filter((r) => inPrev(r.day)), f),
  }
}

const zero = (): Metrics => ({ visits: 0, views: 0, clicks: 0, signups: 0 })

function add(m: Metrics, v: Visit): void {
  m.visits += 1
  m.views += v.views
  m.clicks += v.clicks
  m.signups += v.signups
}

/** Lignes par clé (source, page…), triées par visites. */
export function groupBy(l: Loaded, keyOf: (v: Visit) => string | null, match: (v: Visit) => boolean = () => true): SourceRow[] {
  const by = new Map<string, SourceRow>()
  const land = new Map<string, Map<string, number>>(), utms = new Map<string, Map<string, number>>()
  const best = (m?: Map<string, number>) => (m ? [...m.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] : undefined)
  for (const v of l.cur) {
    if (!match(v)) continue
    const k = keyOf(v)
    if (k === null) continue
    let row = by.get(k)
    if (!row) {
      row = { key: k, family: v.family, name: v.name, ...zero(), prev: l.compare ? 0 : null, spark: l.buckets.map(() => 0) }
      by.set(k, row)
    }
    add(row, v)
    const lc = (land.get(k) ?? land.set(k, new Map()).get(k))!
    lc.set(v.landing, (lc.get(v.landing) ?? 0) + 1)
    if (v.utm) { const uc = (utms.get(k) ?? utms.set(k, new Map()).get(k))!; uc.set(v.utm, (uc.get(v.utm) ?? 0) + 1) }
    const b = l.bucketOf(v.day)
    if (b >= 0) row.spark[b] = (row.spark[b] ?? 0) + 1
  }
  if (l.compare) {
    for (const v of l.prev) {
      if (!match(v)) continue
      const k = keyOf(v)
      if (k === null) continue
      const row = by.get(k)
      if (row) row.prev = (row.prev ?? 0) + 1
      else by.set(k, { key: k, family: v.family, name: v.name, ...zero(), prev: 1, spark: l.buckets.map(() => 0) })
    }
  }
  for (const [k, row] of by) { row.top = best(land.get(k)); row.pages = land.get(k)?.size ?? 0; row.utm = best(utms.get(k)) }
  return [...by.values()].sort((a, b) => b.visits - a.visits || (b.prev ?? 0) - (a.prev ?? 0) || a.key.localeCompare(b.key))
}

export function deviceOf(v: Visit): DeviceKind {
  return v.device === 'mobile' || v.device === 'tablet' ? v.device : 'desktop'
}

export function devicesOf(visits: Visit[]): Record<DeviceKind, number> {
  const out: Record<DeviceKind, number> = { mobile: 0, desktop: 0, tablet: 0 }
  for (const v of visits) out[deviceOf(v)] += 1
  return out
}

export function countriesOf(visits: Visit[]): { code: string; n: number }[] {
  const by = new Map<string, number>()
  for (const v of visits) {
    const c = v.country?.trim().toUpperCase() || '??'
    by.set(c, (by.get(c) ?? 0) + 1)
  }
  return [...by].map(([code, n]) => ({ code, n })).sort((a, b) => b.n - a.n || a.code.localeCompare(b.code))
}

export function sourcesData(l: Loaded): SourcesData {
  const entries = l.cur.filter((v) => v.family !== 'internal')
  const total = zero()
  for (const v of entries) add(total, v)
  const families: FamilyRow[] = FAMILIES.map((fam) => {
    const own = entries.filter((v) => v.family === fam.key)
    const [row] = groupBy(l, (v) => (v.family === fam.key ? fam.key : null))
    const base: SourceRow = row ?? { key: fam.key, family: fam.key, name: fam.label, ...zero(), prev: l.compare ? 0 : null, spark: l.buckets.map(() => 0) }
    return {
      ...base,
      label: fam.label,
      color: fam.color,
      rows: groupBy(l, (v) => (v.family === fam.key ? v.key : null)),
      devices: devicesOf(own),
      countries: countriesOf(own),
    }
  })
  return {
    ranges: l.ranges,
    compare: l.compare,
    week: l.week,
    step: l.step,
    buckets: l.buckets,
    total: { ...total, prev: l.compare ? l.prev.filter((v) => v.family !== 'internal').length : null },
    internal: l.cur.length - entries.length,
    families,
  }
}

/** Moteurs de recherche hors Google, même tout petits. */
export function otherEngines(d: SourcesData): SourceRow[] {
  return d.families.find((f) => f.family === 'search')?.rows.filter((r) => r.name !== 'Google') ?? []
}

/** Filtre d'une clé d'adresse : famille seule (« ai ») ou source (« search:Bing »). */
export function matchKey(key: string): ((v: Visit) => boolean) | null {
  const k = parseSourceKey(key)
  if (!k) return null
  return (v) => v.family === k.family && (k.name === null || v.name === k.name)
}

/** Pages d'arrivée d'une source ou d'une famille. */
export function landingsOf(l: Loaded, match: (v: Visit) => boolean): SourceRow[] {
  return groupBy(l, (v) => v.landing.split('?')[0] ?? v.landing, match)
}

/** Pour 100 visites (null sans visite). */
export const per100 = (n: number, visits: number): number | null => (visits > 0 ? (n / visits) * 100 : null)
export const perVisit = (m: Metrics): number | null => (m.visits > 0 ? m.views / m.visits : null)
