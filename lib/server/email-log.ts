import type { EmailKind, EmailLogState } from '@/lib/emails/email-kinds'
import { getPool } from './db'
import { emailHash, emailHashSecret } from './email-hash'

// @cdc e-mails — journal des envois individuels (analytics.email_log), appelé par
// lib/server/mailer.ts pour chaque e-mail. L'écriture part en arrière-plan : une base lente, une
// table absente ou une erreur ne bloquent ni ne retardent l'envoi. Journal d'erreur sans adresse.

export interface EmailLogEntry {
  to: string
  kind: EmailKind
  subject: string
  state: EmailLogState
}

const pending = new Set<Promise<void>>()

function logFailure(err: unknown): void {
  const code = err && typeof err === 'object' && 'code' in err ? String(err.code) : 'inconnu'
  console.error('[email-log] écriture impossible, code', code)
}

/** Ne lève jamais d'erreur et rend la main tout de suite. */
export function recordEmailSend(entry: EmailLogEntry): void {
  try {
    const pool = getPool()
    if (!pool) return
    const write: Promise<void> = pool
      .query('INSERT INTO analytics.email_log (email_hash, kind, subject, state) VALUES ($1, $2, $3, $4)', [
        emailHash(entry.to, emailHashSecret()),
        entry.kind,
        entry.subject,
        entry.state,
      ])
      .then(() => undefined, logFailure)
      .finally(() => pending.delete(write))
    pending.add(write)
  } catch (err) {
    logFailure(err)
  }
}

/** Pour les scripts, avant de fermer la connexion : attend les écritures, `timeoutMs` au plus. */
export async function flushEmailLog(timeoutMs = 3_000): Promise<void> {
  let timer: NodeJS.Timeout | undefined
  const limit = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, timeoutMs)
  })
  await Promise.race([Promise.all(pending), limit])
  clearTimeout(timer)
}
