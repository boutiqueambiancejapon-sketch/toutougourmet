import type { Pool } from 'pg'
import { REMINDER_DAY, type ReminderStep } from '@/lib/emails/account-reminders'
import { CAPPED_KINDS } from '@/lib/emails/email-kinds'
import { addDays, parisDate } from '@/lib/emails/schedule'
import { STEP_DAY, WELCOME_STEPS, type WelcomeStep } from '@/lib/emails/welcome-sequence'
import { brevoKey, listId } from './brevo-newsletter'
export { emailHash } from './email-hash'

// @cdc e-mails — suite de bienvenue (scripts/welcome-sequence.ts) : contacts de la liste Brevo,
// étape due selon le nombre de jours depuis l'inscription (date de création du contact Brevo,
// jour civil à Paris), trace par étape dans analytics.welcome_sends (empreinte HMAC de
// l'adresse, jamais l'adresse). Fonctions pures testées par scripts/test-emails.ts.
// Calendrier d'une adresse (stepForAddress) : sans compte J2, J4 créer un compte, J7 l'offre (code
// j5), J10 ; compte confirmé sans chien J1 et J4. Un seul e-mail par jour et par adresse.

export type SequenceStep = WelcomeStep | ReminderStep

const SEQUENCE_DAY: Record<SequenceStep, number> = { ...STEP_DAY, ...REMINDER_DAY }

/** Une étape manquée (minuterie arrêtée) peut partir jusqu'à 3 jours après son jour prévu. */
export const GRACE_DAYS = 3
/** Plafond d'envois de la suite par jour civil à Paris (borne la facture Brevo). */
export const DAILY_CAP = 300

export interface SequenceContact {
  email: string
  /** Date de création du contact dans Brevo (ISO 8601) */
  createdAt: string
  blacklisted: boolean
}

/** Repère court pour les journaux : jamais l'adresse en clair. */
export const shortId = (hash: string): string => `#${hash.slice(0, 10)}`

/** Jours civils (Paris) entre l'inscription et aujourd'hui. */
export function daysSince(createdAt: string, today: string): number {
  const start = parisDate(new Date(createdAt))
  return Math.round((new Date(`${today}T12:00:00Z`).getTime() - new Date(`${start}T12:00:00Z`).getTime()) / 86_400_000)
}

/**
 * Étape à envoyer aujourd'hui, ou null. On prend la plus avancée qui est due (jour atteint, moins
 * de GRACE_DAYS de retard) ; si une étape plus avancée est déjà partie, rien (jamais de retour en
 * arrière) ; une étape manquée au-delà du délai est sautée. Une seule étape par contact et par jour.
 */
export function dueStep<S extends SequenceStep = WelcomeStep>(days: number, sent: ReadonlySet<SequenceStep>, steps: readonly S[] = WELCOME_STEPS as unknown as readonly S[]): S | null {
  for (const step of [...steps].reverse()) {
    if (sent.has(step)) return null
    if (days >= SEQUENCE_DAY[step] && days <= SEQUENCE_DAY[step] + GRACE_DAYS) return step
  }
  return null
}

export interface AccountFacts {
  createdAt: string
  verified: boolean
  hasDog: boolean
}

export interface AddressFacts {
  /** Contact de la liste Brevo de la lettre, null s'il n'y est pas */
  contact: { createdAt: string; blacklisted: boolean } | null
  /** Compte du site, null s'il n'en a pas */
  account: AccountFacts | null
  sent: ReadonlySet<SequenceStep>
  /** A cliqué sur « Se désinscrire » dans l'un de nos e-mails */
  optedOut: boolean
}

export interface PlanOptions {
  today: string
  start: string
  /** ACCOUNT_REMINDERS_ENABLED=1 : compte-j4, chien-j1 et chien-j4 peuvent partir */
  reminders: boolean
}

const DOG_STEPS = ['chien-j1', 'chien-j4'] as const
const SUITE_WITH_INVITE = ['j2', 'compte-j4', 'j5', 'j10'] as const

/**
 * Étape à envoyer à une adresse aujourd'hui, ou null. Désinscrite : rien. Compte sans adresse
 * confirmée : pas de rappel chien (il ne peut pas se connecter, requireEmailVerification). Détenteur
 * d'un compte confirmé : pas de suite, l'inscription n'a aucune case pour la lettre, il ne reçoit
 * que les rappels de son compte. Compte en attente de confirmation : suite maintenue, sans
 * l'invitation à créer un compte.
 */
export function stepForAddress(facts: AddressFacts, { today, start, reminders }: PlanOptions): SequenceStep | null {
  const { contact, account, sent } = facts
  if (facts.optedOut || contact?.blacklisted) return null
  if (reminders && account?.verified && !account.hasDog && afterStart(account.createdAt, start)) {
    const step = dueStep(daysSince(account.createdAt, today), sent, DOG_STEPS)
    if (step) return step
  }
  if (!contact || account?.verified || !afterStart(contact.createdAt, start)) return null
  const steps: readonly SequenceStep[] = reminders && !account ? SUITE_WITH_INVITE : WELCOME_STEPS
  return dueStep(daysSince(contact.createdAt, today), sent, steps)
}

/** Vrai si le contact s'est inscrit le jour de départ ou après (`start` : AAAA-MM-JJ, Paris). */
export function afterStart(createdAt: string, start: string): boolean {
  return parisDate(new Date(createdAt)) >= start
}

/** WELCOME_SEQUENCE_START valide (AAAA-MM-JJ), sinon null : rien n'est envoyé. */
export function sequenceStart(raw: string | undefined): string | null {
  return raw && /^\d{4}-\d{2}-\d{2}$/.test(raw.trim()) ? raw.trim() : null
}

/** Plafond d'un e-mail par jour : retire du plan les adresses déjà servies aujourd'hui. */
export function capOnePerDay<T extends { hash: string }>(plan: readonly T[], received: ReadonlySet<string>): { kept: T[]; postponed: number } {
  const kept = plan.filter((p) => !received.has(p.hash))
  return { kept, postponed: plan.length - kept.length }
}

interface BrevoListContact {
  email?: string
  createdAt?: string
  emailBlacklisted?: boolean
  listUnsubscribed?: number[]
}

/** Tous les contacts de la liste de la lettre (pages de 500). */
export async function fetchListContacts(): Promise<SequenceContact[]> {
  const id = listId()
  const key = brevoKey()
  if (!id || !key) throw new Error('brevo-not-configured')
  const out: SequenceContact[] = []
  for (let offset = 0; offset < 50_000; offset += 500) {
    const res = await fetch(`https://api.brevo.com/v3/contacts/lists/${id}/contacts?limit=500&offset=${offset}&sort=asc`, {
      headers: { 'api-key': key, accept: 'application/json' },
      cache: 'no-store',
    })
    if (!res.ok) throw new Error(`[brevo] contacts de la liste status=${res.status}`)
    const data = (await res.json()) as { contacts?: BrevoListContact[] }
    const page = data.contacts ?? []
    for (const c of page)
      if (c.email && c.createdAt) out.push({ email: c.email, createdAt: c.createdAt, blacklisted: Boolean(c.emailBlacklisted) || (c.listUnsubscribed ?? []).includes(id) })
    if (page.length < 500) break
  }
  return out
}

/** Contacts fictifs pour BREVO_DRY_RUN=1 : un par jour depuis 12 jours, plus un d'avant le départ. */
export function fakeContacts(today: string, start: string): SequenceContact[] {
  const at = (day: string) => `${day}T09:30:00+01:00`
  const contacts = Array.from({ length: 13 }, (_, i) => ({ email: `test-j${i}@example.invalid`, createdAt: at(addDays(today, -i)), blacklisted: false }))
  contacts.push({ email: 'avant-depart@example.invalid', createdAt: at(addDays(start, -1)), blacklisted: false })
  contacts.push({ email: 'liste-noire@example.invalid', createdAt: at(addDays(today, -2)), blacklisted: true })
  return contacts
}

/** Comptes du site, adresse en minuscules. */
export async function fetchAccounts(pool: Pool): Promise<Map<string, AccountFacts>> {
  const { rows } = await pool.query<{ email: string; created_at: Date; email_verified: boolean; has_dog: boolean }>(
    `SELECT u.email, u.created_at, u.email_verified, EXISTS (SELECT 1 FROM app.dog d WHERE d.user_id = u.id) AS has_dog FROM app."user" u`,
  )
  return new Map(rows.map((r) => [r.email.trim().toLowerCase(), { createdAt: r.created_at.toISOString(), verified: r.email_verified, hasDog: r.has_dog }]))
}

/**
 * Vrai si Brevo connaît cette adresse comme désinscrite (lien {{ unsubscribe }} d'une campagne). Pour
 * un compte absent de la liste, seule cette lecture le dit. Erreur de lecture : le rappel attend.
 */
export async function brevoOptedOut(email: string): Promise<boolean> {
  const key = brevoKey()
  if (!key) throw new Error('brevo-not-configured')
  const res = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
    headers: { 'api-key': key, accept: 'application/json' },
    cache: 'no-store',
    signal: AbortSignal.timeout(6_000),
  })
  if (res.status === 404) return false
  if (!res.ok) throw new Error(`[brevo] lecture contact status=${res.status}`)
  const data = (await res.json()) as BrevoListContact
  const id = listId()
  return Boolean(data.emailBlacklisted) || (id !== null && (data.listUnsubscribed ?? []).includes(id))
}

const SINCE_MIDNIGHT = "sent_at >= (date_trunc('day', now() AT TIME ZONE 'Europe/Paris') AT TIME ZONE 'Europe/Paris')"

/** Empreintes qui ont déjà reçu un e-mail compté dans le plafond aujourd'hui (heure de Paris). */
export async function receivedToday(pool: Pool): Promise<Set<string>> {
  const legacy = `SELECT email_hash FROM analytics.guide_sends WHERE ${SINCE_MIDNIGHT} UNION SELECT email_hash FROM analytics.welcome_sends WHERE ${SINCE_MIDNIGHT}`
  const read = (sql: string, params: unknown[] = []) => pool.query<{ email_hash: string }>(sql, params)
  const { rows } = await read(`${legacy} UNION SELECT email_hash FROM analytics.email_log WHERE ${SINCE_MIDNIGHT} AND state <> 'failed' AND kind = ANY($1)`, [CAPPED_KINDS]).catch((err: unknown) => {
    // Journal pas encore créé : guide_sends et welcome_sends restent lues.
    if (err && typeof err === 'object' && 'code' in err && err.code === '42P01') return read(legacy)
    throw err
  })
  return new Set(rows.map((r) => r.email_hash))
}

/** Étapes déjà parties, par empreinte. */
export async function sentSteps(pool: Pool, hashes: string[]): Promise<Map<string, Set<SequenceStep>>> {
  const map = new Map<string, Set<SequenceStep>>()
  if (hashes.length === 0) return map
  const { rows } = await pool.query<{ email_hash: string; step: SequenceStep }>(
    'SELECT email_hash, step FROM analytics.welcome_sends WHERE email_hash = ANY($1)',
    [hashes],
  )
  for (const r of rows) map.set(r.email_hash, (map.get(r.email_hash) ?? new Set()).add(r.step))
  return map
}

/** Envois de la suite depuis minuit, heure de Paris. */
export async function sentToday(pool: Pool): Promise<number> {
  const { rows } = await pool.query<{ n: string }>(
    `SELECT count(*) AS n FROM analytics.welcome_sends WHERE ${SINCE_MIDNIGHT}`,
  )
  return Number(rows[0]?.n ?? 0)
}

/** Réserve l'étape pour cette empreinte. false : déjà partie (autre exécution). */
export async function claimStep(pool: Pool, hash: string, step: SequenceStep): Promise<boolean> {
  const res = await pool.query('INSERT INTO analytics.welcome_sends (email_hash, step) VALUES ($1, $2) ON CONFLICT DO NOTHING', [hash, step])
  return res.rowCount === 1
}

/** Envoi raté : l'étape pourra repartir demain (dans le délai de grâce). */
export async function releaseStep(pool: Pool, hash: string, step: SequenceStep): Promise<void> {
  await pool.query('DELETE FROM analytics.welcome_sends WHERE email_hash = $1 AND step = $2', [hash, step])
}
