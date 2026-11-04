import type { Pool } from 'pg'
import { buildTrackingRows, filterTracking, type KnownSubscriber, type LegacyLine, type LogLine, type TrackingRow, type TrackingSend } from '@/lib/dashboard/email-tracking'
import { allAccounts } from './dashboard-accounts'
import { allSubscribers } from './dashboard-subscribers'
import { getPool } from './db'
import { emailHash, emailHashSecret } from './email-hash'

// @cdc tableau de bord — suivi des e-mails par adresse. Lecture à l'affichage : liste Brevo, comptes,
// analytics.email_log et l'historique de guide_sends et welcome_sends. Les empreintes sont résolues
// ici, côté serveur, en calculant le HMAC des adresses connues ; aucune adresse n'est écrite. La
// lettre mensuelle part en campagne Brevo : elle n'a pas de ligne par adresse, la vue le dit.

export const TRACKING_PAGE_SIZE = 50
const LOG_LIMIT = 50_000

type Problem = 'no-database' | 'unreadable'
export type TrackingNotice = 'list-incomplete' | 'log-missing'

export type TrackingResult =
  | { ok: true; total: number; matched: number; rows: TrackingRow[]; notices: TrackingNotice[] }
  | { ok: false; reason: Problem }

const logCode = (err: unknown): void => {
  console.error('[suivi] lecture, code', err && typeof err === 'object' && 'code' in err ? String(err.code) : 'inconnu')
}

/** Une table absente (SQL pas encore appliqué) ne casse pas la vue : `null`. */
async function readTable<T extends object>(pool: Pool, table: string, sql: string, params: unknown[] = []): Promise<T[] | null> {
  const { rows } = await pool.query<{ ok: boolean }>('SELECT to_regclass($1) IS NOT NULL AS ok', [`analytics.${table}`])
  if (!rows[0]?.ok) return null
  return (await pool.query<T>(sql, params)).rows
}

/** Contacts fictifs de BREVO_DRY_RUN=1 : seule façon de voir la vue sans la clé Brevo (préversion, tests). */
const DRY_SUBSCRIBERS: KnownSubscriber[] = [
  { email: 'guide-essai@example.invalid', createdAt: '2026-11-03T09:30:00+01:00', source: 'guide', status: 'actif', welcomeSent: false },
  { email: 'lettre-essai@example.invalid', createdAt: '2026-11-02T18:05:00+01:00', source: 'Nouvelle inscription newsletter', status: 'actif', welcomeSent: true },
]

async function load(): Promise<{ ok: true; rows: TrackingRow[]; notices: TrackingNotice[] } | { ok: false; reason: Problem }> {
  const pool = getPool()
  if (!pool) return { ok: false, reason: 'no-database' }
  const dry = process.env.BREVO_DRY_RUN === '1'
  const [subscribers, accounts] = await Promise.all([dry ? null : allSubscribers(), allAccounts()])
  const listOk = dry || subscribers?.ok === true
  const listComplete = dry || (subscribers?.ok === true && !subscribers.truncated)
  try {
    const [logs, guideSends, welcomeSends, optOuts] = await Promise.all([
      readTable<LogLine>(pool, 'email_log', `SELECT email_hash, kind, subject, state, sent_at FROM analytics.email_log ORDER BY sent_at DESC LIMIT ${LOG_LIMIT}`),
      readTable<LegacyLine>(pool, 'guide_sends', 'SELECT email_hash, sent_at FROM analytics.guide_sends'),
      readTable<LegacyLine & { step: string }>(pool, 'welcome_sends', 'SELECT email_hash, step, sent_at FROM analytics.welcome_sends'),
      readTable<{ email_hash: string }>(pool, 'email_optouts', 'SELECT email_hash FROM analytics.email_optouts'),
    ])
    const secret = emailHashSecret()
    const notices: TrackingNotice[] = []
    if (!listComplete || !accounts.ok) notices.push('list-incomplete')
    if (logs === null) notices.push('log-missing')
    const rows = buildTrackingRows({
      subscribers: dry ? DRY_SUBSCRIBERS : subscribers?.ok ? subscribers.rows : [],
      accounts: accounts.ok ? accounts.rows : [],
      internal: [process.env.NEWSLETTER_TEST_EMAIL, process.env.OWNER_EMAIL].filter((v): v is string => Boolean(v)),
      logs: logs ?? [],
      guideSends: guideSends ?? [],
      welcomeSends: welcomeSends ?? [],
      optOuts: new Set((optOuts ?? []).map((o) => o.email_hash)),
      hash: (email) => emailHash(email, secret),
      listComplete: listComplete && accounts.ok,
    })
    if (!listOk && !accounts.ok) return { ok: false, reason: 'unreadable' }
    return { ok: true, rows, notices }
  } catch (err) {
    logCode(err)
    return { ok: false, reason: 'unreadable' }
  }
}

export async function listEmailTracking(page: number, query: string): Promise<TrackingResult> {
  const res = await load()
  if (!res.ok) return res
  const hits = filterTracking(res.rows, query)
  return {
    ok: true,
    total: res.rows.length,
    matched: hits.length,
    rows: hits.slice((page - 1) * TRACKING_PAGE_SIZE, page * TRACKING_PAGE_SIZE),
    notices: res.notices,
  }
}

/** Pour l'export CSV : toutes les lignes. */
export async function allEmailTracking(): Promise<TrackingResult> {
  const res = await load()
  return res.ok ? { ok: true, total: res.rows.length, matched: res.rows.length, rows: res.rows, notices: res.notices } : res
}

export type AddressEmails = { ok: true; sends: TrackingSend[]; logMissing: boolean } | { ok: false }

/**
 * E-mails reçus par une seule adresse, pour la fiche d'un compte : mêmes tables et même calcul que
 * la vue Envois, lus par empreinte (sans parcourir la liste Brevo ni tout le journal).
 */
export async function emailsForAddress(email: string, welcomeSent: boolean): Promise<AddressEmails> {
  const pool = getPool()
  if (!pool) return { ok: false }
  const secret = emailHashSecret()
  const hash = emailHash(email, secret)
  try {
    const [logs, guideSends, welcomeSends] = await Promise.all([
      readTable<LogLine>(pool, 'email_log', 'SELECT email_hash, kind, subject, state, sent_at FROM analytics.email_log WHERE email_hash = $1 ORDER BY sent_at DESC LIMIT 200', [hash]),
      readTable<LegacyLine>(pool, 'guide_sends', 'SELECT email_hash, sent_at FROM analytics.guide_sends WHERE email_hash = $1', [hash]),
      readTable<LegacyLine & { step: string }>(pool, 'welcome_sends', 'SELECT email_hash, step, sent_at FROM analytics.welcome_sends WHERE email_hash = $1', [hash]),
    ])
    const rows = buildTrackingRows({
      subscribers: welcomeSent ? [{ email, createdAt: '', source: null, status: 'actif', welcomeSent: true }] : [],
      accounts: [],
      internal: [],
      logs: logs ?? [],
      guideSends: guideSends ?? [],
      welcomeSends: welcomeSends ?? [],
      optOuts: new Set(),
      hash: (address) => emailHash(address, secret),
      listComplete: true,
    })
    return { ok: true, sends: rows.find((r) => r.hash === hash)?.sends ?? [], logMissing: logs === null }
  } catch (err) {
    logCode(err)
    return { ok: false }
  }
}
