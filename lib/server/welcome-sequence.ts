import { createHmac } from 'node:crypto'
import type { Pool } from 'pg'
import { addDays, parisDate } from '@/lib/emails/schedule'
import { STEP_DAY, WELCOME_STEPS, type WelcomeStep } from '@/lib/emails/welcome-sequence'
import { brevoKey, listId } from './brevo-newsletter'

// @cdc e-mails — suite de bienvenue (scripts/welcome-sequence.ts) : contacts de la liste Brevo,
// étape due selon le nombre de jours depuis l'inscription (date de création du contact Brevo,
// jour civil à Paris), trace par étape dans analytics.welcome_sends (empreinte HMAC de
// l'adresse, jamais l'adresse). Fonctions pures testées par scripts/test-emails.ts.

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

/** Empreinte de l'adresse, même calcul que l'e-mail du guide (lib/server/guide-email.ts). */
export function emailHash(email: string, secret: string): string {
  return createHmac('sha256', secret).update(email.trim().toLowerCase()).digest('hex')
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
export function dueStep(days: number, sent: ReadonlySet<WelcomeStep>): WelcomeStep | null {
  for (const step of [...WELCOME_STEPS].reverse()) {
    if (sent.has(step)) return null
    if (days >= STEP_DAY[step] && days <= STEP_DAY[step] + GRACE_DAYS) return step
  }
  return null
}

/** Vrai si le contact s'est inscrit le jour de départ ou après (`start` : AAAA-MM-JJ, Paris). */
export function afterStart(createdAt: string, start: string): boolean {
  return parisDate(new Date(createdAt)) >= start
}

/** WELCOME_SEQUENCE_START valide (AAAA-MM-JJ), sinon null : rien n'est envoyé. */
export function sequenceStart(raw: string | undefined): string | null {
  return raw && /^\d{4}-\d{2}-\d{2}$/.test(raw.trim()) ? raw.trim() : null
}

interface BrevoListContact {
  email?: string
  createdAt?: string
  emailBlacklisted?: boolean
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
      if (c.email && c.createdAt) out.push({ email: c.email, createdAt: c.createdAt, blacklisted: Boolean(c.emailBlacklisted) })
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

/** Étapes déjà parties, par empreinte. */
export async function sentSteps(pool: Pool, hashes: string[]): Promise<Map<string, Set<WelcomeStep>>> {
  const map = new Map<string, Set<WelcomeStep>>()
  if (hashes.length === 0) return map
  const { rows } = await pool.query<{ email_hash: string; step: WelcomeStep }>(
    'SELECT email_hash, step FROM analytics.welcome_sends WHERE email_hash = ANY($1)',
    [hashes],
  )
  for (const r of rows) map.set(r.email_hash, (map.get(r.email_hash) ?? new Set()).add(r.step))
  return map
}

/** Envois de la suite depuis minuit, heure de Paris. */
export async function sentToday(pool: Pool): Promise<number> {
  const { rows } = await pool.query<{ n: string }>(
    "SELECT count(*) AS n FROM analytics.welcome_sends WHERE sent_at >= (date_trunc('day', now() AT TIME ZONE 'Europe/Paris') AT TIME ZONE 'Europe/Paris')",
  )
  return Number(rows[0]?.n ?? 0)
}

/** Réserve l'étape pour cette empreinte. false : déjà partie (autre exécution). */
export async function claimStep(pool: Pool, hash: string, step: WelcomeStep): Promise<boolean> {
  const res = await pool.query('INSERT INTO analytics.welcome_sends (email_hash, step) VALUES ($1, $2) ON CONFLICT DO NOTHING', [hash, step])
  return res.rowCount === 1
}

/** Envoi raté : l'étape pourra repartir demain (dans le délai de grâce). */
export async function releaseStep(pool: Pool, hash: string, step: WelcomeStep): Promise<void> {
  await pool.query('DELETE FROM analytics.welcome_sends WHERE email_hash = $1 AND step = $2', [hash, step])
}
