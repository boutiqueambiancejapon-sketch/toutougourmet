import type { Pool } from 'pg'
import { isValidEmail } from '@/lib/server/brevo'

// @cdc contact — validation et enregistrement des messages du formulaire de contact dans
// analytics.contact_messages (db/analytics.sql). Aucune IP écrite : la limite de débit vit en mémoire.

export const LIMITS = { name: 80, message: 5_000, minMessage: 10, page: 300 } as const

export interface ContactMessage {
  name: string
  email: string
  message: string
  page: string | null
}

export type ParseResult = { ok: true; value: ContactMessage } | { ok: false; error: string }

export function parseContactMessage(body: Record<string, unknown>): ParseResult {
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  if (!name || name.length > LIMITS.name) return { ok: false, error: 'Invalid name' }
  if (!isValidEmail(email)) return { ok: false, error: 'Invalid email' }
  if (message.length < LIMITS.minMessage || message.length > LIMITS.message) return { ok: false, error: 'Invalid message' }
  const page = typeof body.page === 'string' && body.page.startsWith('/') ? body.page.slice(0, LIMITS.page) : null
  return { ok: true, value: { name, email, message, page } }
}

const WINDOW_MS = 10 * 60_000
const MAX_PER_WINDOW = 5
const hitsByKey = new Map<string, { n: number; until: number }>()

/** Au plus 5 envois par adresse réseau toutes les 10 minutes, compteur en mémoire seulement. */
export function contactRateLimited(key: string): boolean {
  const now = Date.now()
  if (hitsByKey.size > 5_000) hitsByKey.clear()
  const entry = hitsByKey.get(key)
  if (!entry || entry.until < now) {
    hitsByKey.set(key, { n: 1, until: now + WINDOW_MS })
    return false
  }
  entry.n += 1
  return entry.n > MAX_PER_WINDOW
}

export async function saveContactMessage(pool: Pool, msg: ContactMessage): Promise<void> {
  await pool.query('INSERT INTO analytics.contact_messages (name, email, message, page) VALUES ($1, $2, $3, $4)', [
    msg.name,
    msg.email,
    msg.message,
    msg.page,
  ])
}

export interface StoredMessage extends ContactMessage {
  id: number
  ts: Date
  handled: boolean
}

/** Les 20 derniers messages, non traités en premier (tableau de bord). */
export async function getRecentMessages(pool: Pool, limit = 20): Promise<StoredMessage[]> {
  const res = await pool.query<Omit<StoredMessage, 'id'> & { id: string }>(
    `SELECT id, ts, name, email, message, page, handled FROM analytics.contact_messages
     ORDER BY handled ASC, ts DESC LIMIT $1`,
    [limit],
  )
  return res.rows.map((row) => ({ ...row, id: Number(row.id) }))
}
