import { pageTypeOf, PAGE_TYPE_LABELS, type PageType } from '@/lib/page-type'
import type { Pair } from './compare'

// @cdc tableau de bord — calculs du trafic, sans base ni affichage. Une session : les actions d'une
// même empreinte du jour, sans pause de plus de 30 minutes (requête dans lib/server/dashboard-traffic.ts).

export type Channel = 'google' | 'search' | 'direct' | 'ai' | 'email' | 'social' | 'other'

export const CHANNEL_LABELS: Record<Channel, string> = {
  google: 'Google',
  search: 'Autres moteurs',
  direct: 'Accès direct',
  ai: 'IA (ChatGPT, Perplexity…)',
  email: 'E-mails',
  social: 'Réseaux sociaux',
  other: 'Autres sites',
}

const AI_HOST = /(^|\.)(chatgpt\.com|openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com|copilot\.microsoft\.com|mistral\.ai|grok\.com|deepseek\.com|you\.com|phind\.com)$/
const EMAIL_HOST = /^(com\.google\.android\.gm|com\.microsoft\.office\.outlook|mail\.google\.com|outlook\.(live|office)\.com)$|(^|\.)(webmail|mail)\./
const GOOGLE_HOST = /(^|\.)google\.[a-z.]+$|^com\.google\.android\.googlequicksearchbox$/
const SEARCH_HOST = /(^|\.)(bing\.com|duckduckgo\.com|ecosia\.org|qwant\.com|yahoo\.[a-z.]+|brave\.com|lilo\.org|yandex\.[a-z.]+|baidu\.com|startpage\.com)$/
const SOCIAL_HOST = /(^|\.)(facebook\.com|instagram\.com|pinterest\.[a-z.]+|tiktok\.com|youtube\.com|x\.com|t\.co|twitter\.com|reddit\.com|linkedin\.com|whatsapp\.com|snapchat\.com|threads\.net)$/

export function isOwnHost(host: string): boolean {
  return /(^|\.)toutou-gourmet\.com$/.test(host)
}

/** L'ordre compte : Gemini est sur un domaine Google, et doit rester avec les IA. */
export function channelOf(host: string | null): Channel {
  if (!host || isOwnHost(host)) return 'direct'
  if (AI_HOST.test(host)) return 'ai'
  if (EMAIL_HOST.test(host)) return 'email'
  if (GOOGLE_HOST.test(host)) return 'google'
  if (SEARCH_HOST.test(host)) return 'search'
  if (SOCIAL_HOST.test(host)) return 'social'
  return 'other'
}

export interface SessionRow {
  /** Vrai pour la période choisie, faux pour la période d'avant. */
  current: boolean
  visitor: string
  seconds: number
  views: number
  landing: string
  ref: string | null
  device: string | null
  names: string[]
}

/** Affichés sans geste du visiteur : ils ne l'empêchent pas de compter comme un rebond. */
const PASSIVE_EVENTS = new Set(['Pageview', 'Guide Popup View', 'Account Invite View'])
const SIGNUP_EVENTS = ['Newsletter Signup', 'Guide Signup']
const TOOL_EVENTS = ['Tool Result', 'Quiz Complete', 'Scan Result']
const CLICK_EVENT = 'Affiliate Click'

export function isBounce(s: Pick<SessionRow, 'views' | 'names'>): boolean {
  return s.views <= 1 && s.names.every((n) => PASSIVE_EVENTS.has(n))
}

const hasAny = (s: SessionRow, names: string[]) => s.names.some((n) => names.includes(n))
const clicked = (s: SessionRow) => s.names.includes(CLICK_EVENT)
const share = (part: number, total: number) => (total > 0 ? part / total : 0)

export interface Rates {
  emails: number
  clicks: number
  scans: number
}

export interface Overview {
  visitors: Pair
  sessions: Pair
  /** Part de sessions sans deuxième page ni action, de 0 à 1 ; null sans session. */
  bounce: { current: number | null; previous: number | null }
  /** Durée moyenne en secondes ; null sans session. */
  seconds: number | null
  rates: Rates
}

function bounceRate(rows: SessionRow[]): number | null {
  return rows.length === 0 ? null : share(rows.filter(isBounce).length, rows.length)
}

export function overviewOf(rows: SessionRow[]): Overview {
  const cur = rows.filter((r) => r.current)
  const prev = rows.filter((r) => !r.current)
  const distinct = (list: SessionRow[]) => new Set(list.map((r) => r.visitor)).size
  return {
    visitors: { current: distinct(cur), previous: distinct(prev) },
    sessions: { current: cur.length, previous: prev.length },
    bounce: { current: bounceRate(cur), previous: bounceRate(prev) },
    seconds: cur.length === 0 ? null : cur.reduce((sum, r) => sum + r.seconds, 0) / cur.length,
    rates: {
      emails: share(cur.filter((s) => hasAny(s, SIGNUP_EVENTS)).length, cur.length),
      clicks: share(cur.filter(clicked).length, cur.length),
      scans: share(cur.filter((s) => s.names.includes('Scan Result')).length, cur.length),
    },
  }
}

export interface ChannelRow {
  channel: Channel
  label: string
  sessions: number
  clickRate: number
}

export function channelsOf(rows: SessionRow[]): ChannelRow[] {
  const byChannel = new Map<Channel, SessionRow[]>()
  for (const r of rows) {
    if (!r.current) continue
    const c = channelOf(r.ref)
    byChannel.set(c, [...(byChannel.get(c) ?? []), r])
  }
  return [...byChannel.entries()]
    .map(([channel, list]) => ({ channel, label: CHANNEL_LABELS[channel], sessions: list.length, clickRate: share(list.filter(clicked).length, list.length) }))
    .sort((a, b) => b.sessions - a.sessions)
}

export function countBy<T extends string>(rows: SessionRow[], keyOf: (r: SessionRow) => T | null): { label: T; value: number }[] {
  const counts = new Map<T, number>()
  for (const r of rows) {
    const key = r.current ? keyOf(r) : null
    if (key) counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return [...counts.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
}

export function sitesOf(rows: SessionRow[]): { label: string; value: number }[] {
  return countBy(rows, (r) => (r.ref && !isOwnHost(r.ref) ? r.ref : null))
}

export interface PageCounts {
  page: string
  views: number
  clicks: number
  emails: number
}

export interface EntryRow {
  page: string
  sessions: number
  bounce: number
}

export function entriesOf(rows: SessionRow[]): EntryRow[] {
  const byPage = new Map<string, { sessions: number; bounces: number }>()
  for (const r of rows) {
    if (!r.current) continue
    const e = byPage.get(r.landing) ?? { sessions: 0, bounces: 0 }
    e.sessions += 1
    if (isBounce(r)) e.bounces += 1
    byPage.set(r.landing, e)
  }
  return [...byPage.entries()]
    .map(([page, e]) => ({ page, sessions: e.sessions, bounce: share(e.bounces, e.sessions) }))
    .sort((a, b) => b.sessions - a.sessions || a.page.localeCompare(b.page))
}

export interface TypeRow {
  type: PageType
  label: string
  views: number
  clicks: number
  emails: number
}

export function typesOf(pages: PageCounts[]): TypeRow[] {
  const byType = new Map<PageType, TypeRow>()
  for (const p of pages) {
    const type = pageTypeOf(p.page)
    const t = byType.get(type) ?? { type, label: PAGE_TYPE_LABELS[type], views: 0, clicks: 0, emails: 0 }
    t.views += p.views
    t.clicks += p.clicks
    t.emails += p.emails
    byType.set(type, t)
  }
  return [...byType.values()].sort((a, b) => b.views - a.views)
}

export interface FunnelStep {
  label: string
  value: number
}

/** Sessions entrées par un article, puis parmi elles : chaque étape se compte à part, un clic n'exige pas d'outil. */
export function funnelOf(rows: SessionRow[]): FunnelStep[] {
  const base = rows.filter((r) => r.current && /^\/(chien|blog)\//.test(r.landing))
  return [
    { label: 'Arrive sur un article', value: base.length },
    { label: 'Lit une 2e page', value: base.filter((s) => s.views >= 2).length },
    { label: 'Utilise un outil', value: base.filter((s) => hasAny(s, TOOL_EVENTS)).length },
    { label: 'Clic partenaire', value: base.filter(clicked).length },
  ]
}

export function durationLabel(seconds: number): string {
  const total = Math.round(seconds)
  if (total < 60) return `${total} s`
  const rest = total % 60
  return `${Math.floor(total / 60)} min${rest ? ` ${String(rest).padStart(2, '0')}` : ''}`
}
