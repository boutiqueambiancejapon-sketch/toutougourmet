import { EMAIL_KIND_LABEL, type EmailKind, type EmailLogState } from '@/lib/emails/email-kinds'
import { csvDate, type CsvValue } from './csv'
import { subscriberSourceLabel } from './subscriber-source'

// @cdc tableau de bord — « qui a reçu quoi et quand ». Fonction pure, testée par
// scripts/test-emails.ts : part des adresses connues (liste Brevo, comptes, adresses de test),
// retrouve leur empreinte (hash fourni par l'appelant, côté serveur) dans le journal et dans
// l'historique plus ancien de guide_sends, welcome_sends et de l'attribut WELCOME_SENT. Une
// empreinte sans adresse connue devient une ligne « adresse supprimée ou inconnue ».

export interface TrackingSend {
  label: string
  subject: string | null
  state: EmailLogState
  /** null : envoi connu sans date (attribut Brevo WELCOME_SENT) */
  at: Date | null
}

export interface TrackingRow {
  hash: string
  /** null : adresse supprimée ou inconnue */
  email: string | null
  source: string | null
  listedAt: Date | null
  listStatus: 'actif' | 'desinscrit' | null
  account: { id?: string; createdAt: Date; verified: boolean; dogs: number; dogNames?: string[] } | null
  /** Étapes de la suite et des rappels déjà parties (welcome_sends) */
  sentSteps: string[]
  /** Adresse de test ou du propriétaire, connue par l'environnement */
  internal: boolean
  optedOut: boolean
  sends: TrackingSend[]
}

export interface KnownSubscriber {
  email: string
  createdAt: string
  source: string | null
  status: 'actif' | 'desinscrit'
  welcomeSent: boolean
}

export interface KnownAccount {
  id?: string
  dogNames?: string[]
  email: string
  createdAt: Date
  verified: boolean
  dogs: number
}

export interface LogLine {
  email_hash: string
  kind: string
  subject: string
  state: EmailLogState
  sent_at: Date
}

export interface LegacyLine {
  email_hash: string
  sent_at: Date
}

export interface TrackingInput {
  subscribers: KnownSubscriber[]
  accounts: KnownAccount[]
  internal: string[]
  logs: LogLine[]
  guideSends: LegacyLine[]
  welcomeSends: (LegacyLine & { step: string })[]
  optOuts: ReadonlySet<string>
  hash: (email: string) => string
  /** false : liste Brevo illisible ou tronquée, une empreinte sans adresse ne prouve plus rien */
  listComplete: boolean
}

const labelOf = (kind: string): string => (Object.hasOwn(EMAIL_KIND_LABEL, kind) ? EMAIL_KIND_LABEL[kind as EmailKind] : kind)
const lastActivity = (r: TrackingRow): number =>
  Math.max(r.listedAt?.getTime() ?? 0, r.account?.createdAt.getTime() ?? 0, ...r.sends.map((s) => s.at?.getTime() ?? 0))

export function buildTrackingRows(input: TrackingInput): TrackingRow[] {
  const rows = new Map<string, TrackingRow>()
  const rowFor = (hash: string, email: string | null): TrackingRow => {
    const row = rows.get(hash) ?? { hash, email, source: null, listedAt: null, listStatus: null, account: null, sentSteps: [], internal: false, optedOut: input.optOuts.has(hash), sends: [] }
    rows.set(hash, row)
    return row
  }
  const norm = (email: string) => email.trim().toLowerCase()

  for (const s of input.subscribers) {
    const row = rowFor(input.hash(s.email), norm(s.email))
    row.source = s.source
    row.listedAt = s.createdAt ? new Date(s.createdAt) : null
    row.listStatus = s.status
  }
  for (const a of input.accounts) rowFor(input.hash(a.email), norm(a.email)).account = { id: a.id, createdAt: a.createdAt, verified: a.verified, dogs: a.dogs, dogNames: a.dogNames }
  for (const email of input.internal) rowFor(input.hash(email), norm(email)).internal = true

  const logged = new Set<string>()
  for (const l of input.logs) {
    const row = input.listComplete || rows.has(l.email_hash) ? rowFor(l.email_hash, null) : null
    row?.sends.push({ label: labelOf(l.kind), subject: l.subject, state: l.state, at: l.sent_at })
    if (l.state !== 'failed') logged.add(`${l.email_hash}|${l.kind}`)
  }
  const legacy = (line: LegacyLine, kind: EmailKind) => {
    if (logged.has(`${line.email_hash}|${kind}`) || (!input.listComplete && !rows.has(line.email_hash))) return
    rowFor(line.email_hash, null).sends.push({ label: EMAIL_KIND_LABEL[kind], subject: null, state: 'sent', at: line.sent_at })
  }
  for (const g of input.guideSends) legacy(g, 'guide')
  for (const w of input.welcomeSends) rows.get(w.email_hash)?.sentSteps.push(w.step)
  for (const w of input.welcomeSends) legacy(w, (w.step.startsWith('j') ? `suite-${w.step}` : w.step) as EmailKind)
  for (const s of input.subscribers) {
    const hash = input.hash(s.email)
    if (s.welcomeSent && !logged.has(`${hash}|bienvenue`)) rowFor(hash, null).sends.push({ label: EMAIL_KIND_LABEL.bienvenue, subject: null, state: 'sent', at: null })
  }

  for (const row of rows.values()) row.sends.sort((a, b) => (b.at?.getTime() ?? 0) - (a.at?.getTime() ?? 0))
  return [...rows.values()].sort((a, b) => lastActivity(b) - lastActivity(a) || a.hash.localeCompare(b.hash))
}

/** Recherche sur l'adresse, ou sur le début de l'empreinte pour une adresse inconnue. */
export function filterTracking(rows: TrackingRow[], query: string): TrackingRow[] {
  const q = query.trim().toLowerCase()
  return q ? rows.filter((r) => (r.email ? r.email.includes(q) : r.hash.startsWith(q))) : rows
}

export const UNKNOWN_ADDRESS = 'adresse supprimée ou inconnue'
export const TRACKING_STATE_LABEL: Record<EmailLogState, string> = { sent: 'envoyé', failed: 'échec', simulated: 'simulé, non parti' }

export const trackingSource = (row: TrackingRow): string => (row.internal ? 'Adresse de test' : row.listedAt || row.source ? subscriberSourceLabel(row.source) : row.account ? 'Compte' : 'Inconnue')

export const TRACKING_CSV_HEADER = ['email', 'empreinte', 'source', 'inscription_lettre', 'statut_lettre', 'compte', 'compte_cree', 'adresse_confirmee', 'chien', 'envois', 'dernier_envoi', 'detail']

export function trackingCsvRows(rows: TrackingRow[]): CsvValue[][] {
  return rows.map((r) => {
    const dated = r.sends.find((s) => s.at)
    return [
      r.email ?? UNKNOWN_ADDRESS,
      r.hash.slice(0, 10),
      trackingSource(r),
      r.listedAt ? csvDate(r.listedAt) : null,
      r.optedOut ? 'désinscrit' : r.listStatus === 'desinscrit' ? 'désinscrit' : r.listStatus === 'actif' ? 'actif' : null,
      r.account !== null,
      r.account ? csvDate(r.account.createdAt) : null,
      r.account ? r.account.verified : null,
      r.account ? r.account.dogs > 0 : null,
      r.sends.length,
      dated?.at ? csvDate(dated.at) : null,
      r.sends.map((s) => `${s.at ? csvDate(s.at) : 'date inconnue'} ${s.label} (${TRACKING_STATE_LABEL[s.state]})`).join(' | '),
    ]
  })
}
