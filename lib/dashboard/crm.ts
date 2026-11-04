import { EMAIL_KIND_LABEL, type EmailKind } from '@/lib/emails/email-kinds'
import { trackingSource, type TrackingRow } from './email-tracking'

// @cdc tableau de bord — calculs du CRM, sans base ni affichage. Part des lignes du suivi des
// e-mails (lib/dashboard/email-tracking.ts) : une adresse connue vaut un contact.

export const CONTACT_FILTERS = [
  { key: 'tous', label: 'Tous' },
  { key: 'comptes', label: 'Comptes' },
  { key: 'lettre', label: 'Lettre seule' },
  { key: 'confirmer', label: 'À confirmer' },
  { key: 'sans-chien', label: 'Sans chien' },
  { key: 'desinscrits', label: 'Désinscrits' },
] as const

export type ContactFilter = (typeof CONTACT_FILTERS)[number]['key']

export function parseFilter(value: string | string[] | undefined): ContactFilter {
  const raw = Array.isArray(value) ? value[0] : value
  return CONTACT_FILTERS.find((f) => f.key === raw)?.key ?? 'tous'
}

export const isUnsubscribed = (r: TrackingRow): boolean => r.optedOut || r.listStatus === 'desinscrit'
const toConfirm = (r: TrackingRow): boolean => r.account !== null && !r.account.verified
const withoutDog = (r: TrackingRow): boolean => r.account !== null && r.account.verified && r.account.dogs === 0

/** Adresses réelles : ni test ou propriétaire, ni empreinte dont l'adresse est perdue. */
export function contactsOf(rows: TrackingRow[]): TrackingRow[] {
  return rows.filter((r) => r.email !== null && !r.internal)
}

const FILTER_TEST: Record<ContactFilter, (r: TrackingRow) => boolean> = {
  tous: () => true,
  comptes: (r) => r.account !== null,
  lettre: (r) => r.account === null && !isUnsubscribed(r),
  confirmer: toConfirm,
  'sans-chien': withoutDog,
  desinscrits: isUnsubscribed,
}

export function filterContacts(rows: TrackingRow[], filter: ContactFilter, query: string): TrackingRow[] {
  const q = query.trim().toLowerCase()
  return rows.filter(FILTER_TEST[filter]).filter((r) => !q || r.email?.includes(q) || r.account?.dogNames?.some((n) => n.toLowerCase().includes(q)))
}

export type ContactTone = 'green' | 'amber' | 'rose' | 'blue'

export function contactStatus(r: TrackingRow): { label: string; tone: ContactTone } {
  if (toConfirm(r)) return { label: 'À confirmer', tone: 'rose' }
  if (withoutDog(r)) return { label: 'Sans chien', tone: 'amber' }
  if (r.account) return { label: 'Compte', tone: 'green' }
  return isUnsubscribed(r) ? { label: 'Désinscrit', tone: 'rose' } : { label: 'Lettre', tone: 'blue' }
}

export interface CrmSummary {
  total: number
  added: number
  funnel: { label: string; value: number }[]
  watch: { label: string; value: number }[]
  sources: { label: string; value: number }[]
}

const DAY_MS = 86_400_000
const PERIOD_DAYS = { '24h': 1, '7j': 7, '30j': 30, '90j': 90 } as const

export function periodStart(key: keyof typeof PERIOD_DAYS, now = new Date()): Date {
  return new Date(now.getTime() - PERIOD_DAYS[key] * DAY_MS)
}

/** returned : comptes revenus (requête à part) ; since : début de la période choisie. */
export function summarize(rows: TrackingRow[], returned: number, since: Date, now = new Date()): CrmSummary {
  const contacts = contactsOf(rows)
  const accounts = contacts.filter((r) => r.account)
  const verified = accounts.filter((r) => r.account?.verified)
  const firstSeen = (r: TrackingRow) => Math.min(r.listedAt?.getTime() ?? Infinity, r.account?.createdAt.getTime() ?? Infinity)
  const failSince = now.getTime() - 30 * DAY_MS
  const sources = new Map<string, number>()
  for (const r of contacts) sources.set(trackingSource(r), (sources.get(trackingSource(r)) ?? 0) + 1)
  return {
    total: contacts.length,
    added: contacts.filter((r) => firstSeen(r) >= since.getTime()).length,
    funnel: [
      { label: 'A laissé son e-mail', value: contacts.length },
      { label: 'A créé un compte', value: accounts.length },
      { label: 'A confirmé son adresse', value: verified.length },
      { label: 'A ajouté son chien', value: verified.filter((r) => (r.account?.dogs ?? 0) > 0).length },
      { label: 'Revenu dans les 30 jours', value: returned },
    ],
    watch: [
      { label: 'Comptes à confirmer', value: contacts.filter(toConfirm).length },
      { label: 'Comptes sans chien', value: contacts.filter(withoutDog).length },
      { label: 'Désinscrits', value: contacts.filter(isUnsubscribed).length },
      { label: 'E-mails en échec sur 30 jours', value: contacts.flatMap((r) => r.sends).filter((s) => s.state === 'failed' && (s.at?.getTime() ?? 0) >= failSince).length },
    ],
    sources: [...sources.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value || a.label.localeCompare(b.label)),
  }
}

/** Libellé d'une étape de la suite ou des rappels (« j2 » s'écrit « suite-j2 » dans le journal). */
export function stepLabel(step: string): string {
  const kind = /^j\d+$/.test(step) ? `suite-${step}` : step
  return Object.hasOwn(EMAIL_KIND_LABEL, kind) ? EMAIL_KIND_LABEL[kind as EmailKind] : step
}

const weekday = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', timeZone: 'Europe/Paris' })
const day = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', timeZone: 'Europe/Paris' })

export function whenLabel(inDays: number, now = new Date()): string {
  if (inDays === 0) return 'aujourd’hui ou au prochain envoi'
  if (inDays === 1) return 'demain'
  const date = new Date(now.getTime() + inDays * DAY_MS)
  return inDays < 7 ? weekday.format(date) : `le ${day.format(date)}`
}

export function contactLine(r: TrackingRow, next: { step: string; inDays: number } | null, now = new Date()): string {
  if (next) return `Prochain e-mail : ${stepLabel(next.step)}, ${whenLabel(next.inDays, now)}`
  if (isUnsubscribed(r)) return 'Plus aucun e-mail'
  const last = r.sends.find((s) => s.at)
  return last?.at ? `Dernier e-mail : ${last.label}, ${day.format(last.at)}` : 'Aucun e-mail enregistré'
}
