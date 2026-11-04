import { ALERT_WINDOW_MS, attemptBlocked, JOURNAL_DAYS, LIMIT_WINDOW_MS, type AttemptKind } from '@/lib/dashboard/login/policy'
import { requirePool } from './mode'

// @cdc tableau de bord — limites et journal, en base : un redémarrage ne remet rien à zéro. Chaque
// essai s'écrit d'abord comme un échec, sous verrou : des requêtes lancées ensemble ne passent pas
// entre les mailles, et un essai interrompu compte. Un succès corrige la ligne ensuite.

const LOCK_KEY = 7_204_911

export interface Requester {
  ipHash: string
  label: string
}

export interface Attempt {
  id: number
}

const FACTOR_KINDS = ['passkey', 'totp', 'backup']
const INSERT_EVENT = 'INSERT INTO app.dashboard_login_event (kind, outcome, ip_hash, device_label) VALUES ($1, $2, $3, $4) RETURNING id'

/** null si l'essai est refusé d'avance (adresse ou service bloqué). */
export async function beginAttempt(kind: AttemptKind, who: Requester, knownDevice: boolean): Promise<Attempt | null> {
  const client = await requirePool().connect()
  try {
    await client.query('BEGIN')
    await client.query('SELECT pg_advisory_xact_lock($1)', [LOCK_KEY])
    const since = new Date(Date.now() - LIMIT_WINDOW_MS)
    const kinds = kind === 'password' ? ['password'] : FACTOR_KINDS
    const { rows } = await client.query<{ ip: number; global: number; recentBlock: boolean }>(
      `SELECT count(*) FILTER (WHERE ip_hash = $1 AND outcome = 'failure')::int AS ip,
              count(*) FILTER (WHERE kind = ANY($2) AND outcome = 'failure')::int AS global,
              coalesce(bool_or(ip_hash = $1 AND outcome = 'blocked' AND at > now() - interval '1 minute'), false) AS "recentBlock"
         FROM app.dashboard_login_event WHERE at > $3`,
      [who.ipHash, kinds, since],
    )
    const counts = rows[0] ?? { ip: 0, global: 0, recentBlock: false }
    if (attemptBlocked(kind, counts, knownDevice)) {
      // Une ligne par minute au plus : une rafale d'essais bloqués ne gonfle pas le journal.
      if (!counts.recentBlock) await client.query(INSERT_EVENT, [kind, 'blocked', who.ipHash, who.label])
      await client.query('COMMIT')
      return null
    }
    const inserted = await client.query<{ id: string }>(INSERT_EVENT, [kind, 'failure', who.ipHash, who.label])
    await client.query('DELETE FROM app.dashboard_login_event WHERE at < now() - make_interval(days => $1)', [JOURNAL_DAYS])
    await client.query('COMMIT')
    return { id: Number(inserted.rows[0]?.id ?? 0) }
  } catch (err) {
    await client.query('ROLLBACK').catch(() => undefined)
    throw err
  } finally {
    client.release()
  }
}

export async function attemptSucceeded(attempt: Attempt): Promise<void> {
  await requirePool().query(`UPDATE app.dashboard_login_event SET outcome = 'success' WHERE id = $1`, [attempt.id])
}

export async function recentFailures(): Promise<number> {
  const { rows } = await requirePool().query<{ n: number }>(`SELECT count(*)::int AS n FROM app.dashboard_login_event WHERE outcome = 'failure' AND at > $1`, [new Date(Date.now() - ALERT_WINDOW_MS)])
  return rows[0]?.n ?? 0
}

/** Événement sans limite : déconnexion, facteur ajouté ou retiré. */
export async function logEvent(kind: string, outcome: string, who: Requester): Promise<void> {
  await requirePool().query(INSERT_EVENT, [kind, outcome, who.ipHash, who.label])
}
