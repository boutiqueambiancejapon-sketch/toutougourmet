import type { Pool } from 'pg'
import type { Dog } from '@/db/schema'
import { isAccountId } from '@/lib/dashboard/account-status'
import { emailsForAddress, type AddressEmails } from './dashboard-email-tracking'
import { quietRead } from './dashboard-safe'
import { letterStatusOf, type LetterStatus } from './dashboard-subscribers'
import { getPool } from './db'
import { listDogs } from './dogs'
import { scanLimitFor } from './membership'
import { usedThisMonth } from './scanner'

// @cdc tableau de bord — fiche d'un compte, pour le support. Colonnes citées une à une : ni mot de
// passe, ni jeton de session, ni IP, ni navigateur. Fiches de garde : seules les dates sortent de la
// base, jamais la colonne `data` (téléphones, vétérinaire, médicaments, notes) ni `token` (lien
// privé). Chaque bloc se lit à part : une panne donne « illisible » sur ce bloc, jamais une page
// cassée. Journaux : code PostgreSQL seulement.

export interface AccountCore {
  id: string
  name: string
  email: string
  verified: boolean
  createdAt: Date
  updatedAt: Date
  /** analytics.signup_sources : vidée à la confirmation de l'adresse */
  place: string | null
  /** Dernière activité d'une session encore en base (Better Auth la met à jour une fois par jour) */
  lastVisit: Date | null
}

export interface AccountDog extends Dog {
  weighings: number
}

export interface AccountScan {
  at: Date
  fromCache: boolean
  eventType: string | null
  foodId: string
  brand: string | null
  product: string | null
  score: number | null
  source: string
}

export interface AccountSheet {
  id: string
  dogName: string
  startsOn: string
  endsOn: string
  active: boolean
}

export interface AccountDetail {
  core: AccountCore
  plan: 'free' | 'premium' | null
  letter: LetterStatus
  dogs: AccountDog[] | null
  scans: { rows: AccountScan[]; total: number } | null
  /** Analyses par photo du mois : les codes-barres ne sont pas décomptés */
  usage: { used: number; limit: number } | null
  sheets: AccountSheet[] | null
  emails: AddressEmails
}

export const ACCOUNT_SCANS_SHOWN = 30

async function hasTable(pool: Pool, name: string): Promise<boolean> {
  const { rows } = await pool.query<{ ok: boolean }>('SELECT to_regclass($1) IS NOT NULL AS ok', [name])
  return rows[0]?.ok === true
}

async function readCore(pool: Pool, id: string): Promise<AccountCore | null> {
  const withPlace = await hasTable(pool, 'analytics.signup_sources')
  const { rows } = await pool.query<AccountCore>(
    `SELECT u.id, u.name, u.email, u.email_verified AS verified, u.created_at AS "createdAt", u.updated_at AS "updatedAt",
            ${withPlace ? '(SELECT s.place FROM analytics.signup_sources s WHERE s.user_id = u.id)' : 'NULL::text'} AS place,
            (SELECT max(se.updated_at) FROM app.session se WHERE se.user_id = u.id) AS "lastVisit"
     FROM app."user" u WHERE u.id = $1`,
    [id],
  )
  return rows[0] ?? null
}

async function readDogs(pool: Pool, id: string): Promise<AccountDog[]> {
  const [dogs, counts] = await Promise.all([
    listDogs(id),
    pool.query<{ dog_id: string; n: number }>(
      'SELECT w.dog_id, count(*)::int AS n FROM app.weight_log w JOIN app.dog d ON d.id = w.dog_id WHERE d.user_id = $1 GROUP BY w.dog_id',
      [id],
    ),
  ])
  const byDog = new Map(counts.rows.map((c) => [c.dog_id, c.n]))
  return dogs.map((d) => ({ ...d, weighings: byDog.get(d.id) ?? 0 }))
}

async function readScans(pool: Pool, id: string): Promise<{ rows: AccountScan[]; total: number }> {
  // La ligne du journal écrite juste après ce scan dit s'il vient d'un code-barres ou d'une photo.
  const eventType = (await hasTable(pool, 'analytics.scanner_events'))
    ? `(SELECT e.scan_type FROM analytics.scanner_events e
        WHERE e.user_id = h.user_id AND e.food_analysis_id = h.food_analysis_id
          AND e.created_at BETWEEN h.created_at - interval '1 minute' AND h.created_at + interval '1 minute'
        ORDER BY abs(extract(epoch FROM e.created_at - h.created_at)) LIMIT 1)`
    : 'NULL::text'
  const [rows, total] = await Promise.all([
    pool.query<AccountScan>(
      `SELECT h.created_at AS at, h.from_cache AS "fromCache", ${eventType} AS "eventType",
              f.id AS "foodId", f.brand, f.product, f.score, f.source
       FROM app.scan_history h JOIN app.food_analysis f ON f.id = h.food_analysis_id
       WHERE h.user_id = $1 ORDER BY h.created_at DESC LIMIT ${ACCOUNT_SCANS_SHOWN}`,
      [id],
    ),
    pool.query<{ n: number }>('SELECT count(*)::int AS n FROM app.scan_history WHERE user_id = $1', [id]),
  ])
  return { rows: rows.rows, total: total.rows[0]?.n ?? 0 }
}

async function readSheets(pool: Pool, id: string): Promise<AccountSheet[]> {
  const { rows } = await pool.query<AccountSheet>(
    `SELECT s.id, d.name AS "dogName", s.starts_on::text AS "startsOn", s.ends_on::text AS "endsOn", s.expires_at > now() AS active
     FROM app.sitter_sheet s JOIN app.dog d ON d.id = s.dog_id
     WHERE s.user_id = $1 ORDER BY s.created_at DESC LIMIT 20`,
    [id],
  )
  return rows
}

/** null : aucun compte pour cet identifiant. `{ ok: false }` : base illisible. */
export async function getAccountDetail(id: string): Promise<{ ok: true; detail: AccountDetail } | { ok: false } | null> {
  if (!isAccountId(id)) return null
  const pool = getPool()
  if (!pool) return { ok: false }
  const core = await quietRead<AccountCore | null | undefined>('fiche compte', undefined, (p) => readCore(p, id))
  if (!core.ok || core.value === undefined) return { ok: false }
  if (core.value === null) return null
  const account = core.value
  const letter = await letterStatusOf(account.email)
  const [plan, dogs, scans, usage, sheets, emails] = await Promise.all([
    quietRead('fiche formule', null, async () => (await scanLimitFor(id)).plan),
    quietRead('fiche chiens', null, (p) => readDogs(p, id)),
    quietRead('fiche scans', null, (p) => readScans(p, id)),
    quietRead('fiche compteur', null, async () => {
      const [used, { limit }] = await Promise.all([usedThisMonth(id), scanLimitFor(id)])
      return { used, limit }
    }),
    quietRead('fiche garde', null, (p) => readSheets(p, id)),
    emailsForAddress(account.email, letter.state !== 'unknown' && letter.welcomeSent),
  ])
  return { ok: true, detail: { core: account, plan: plan.value, letter, dogs: dogs.value, scans: scans.value, usage: usage.value, sheets: sheets.value, emails } }
}
