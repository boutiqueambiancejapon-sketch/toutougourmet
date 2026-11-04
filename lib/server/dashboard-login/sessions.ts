import { ABSOLUTE_MS, CHALLENGE_MS, sessionIsLive, stageLifetimeMs, TOUCH_EVERY_MS, type SessionStage } from '@/lib/dashboard/login/policy'
import { requirePool } from './mode'
import { newToken, passwordFingerprint, tokenHash } from './secrets'

// @cdc tableau de bord — sessions du propriétaire : cookie aléatoire, empreinte en base, révocation
// immédiate par suppression de la ligne. Passer un facteur change la valeur du cookie.

export interface DashboardSession {
  id: string
  stage: SessionStage
  passwordFp: string
  createdAt: Date
  lastSeenAt: Date
  expiresAt: Date
  factorAt: Date | null
  factorFailures: number
  deviceLabel: string
}

const COLUMNS = `id, stage, password_fp AS "passwordFp", created_at AS "createdAt", last_seen_at AS "lastSeenAt",
  expires_at AS "expiresAt", factor_at AS "factorAt", factor_failures AS "factorFailures", device_label AS "deviceLabel"`

/** Session vivante de ce cookie, ou null. touch : compte comme une activité (au plus une écriture par minute). */
export async function readSession(token: string | undefined, touch = false, now = new Date()): Promise<DashboardSession | null> {
  const fp = passwordFingerprint()
  if (!token || token.length > 128 || !fp) return null
  const pool = requirePool()
  const { rows } = await pool.query<DashboardSession>(`SELECT ${COLUMNS} FROM app.dashboard_session WHERE token_hash = $1`, [tokenHash(token)])
  const session = rows[0]
  if (!session) return null
  if (!sessionIsLive(session, fp, now)) {
    await pool.query('DELETE FROM app.dashboard_session WHERE id = $1', [session.id])
    return null
  }
  if (touch && now.getTime() - session.lastSeenAt.getTime() >= TOUCH_EVERY_MS) {
    await pool.query('UPDATE app.dashboard_session SET last_seen_at = $2 WHERE id = $1', [session.id, now])
  }
  return session
}

export async function createSession(stage: SessionStage, label: string, now = new Date()): Promise<string> {
  const fp = passwordFingerprint()
  if (!fp) throw new Error('Identifiants absents')
  const token = newToken()
  await requirePool().query(
    `INSERT INTO app.dashboard_session (token_hash, stage, password_fp, created_at, last_seen_at, expires_at, device_label)
     VALUES ($1, $2, $3, $4, $4, $5, $6)`,
    [tokenHash(token), stage, fp, now, new Date(now.getTime() + stageLifetimeMs(stage)), label],
  )
  await requirePool().query(`DELETE FROM app.dashboard_session WHERE expires_at < $1`, [now])
  return token
}

/** Second facteur passé : nouvelle valeur de cookie, 12 h à partir de maintenant. */
export async function elevateSession(id: string, now = new Date()): Promise<string> {
  const token = newToken()
  await requirePool().query(
    `UPDATE app.dashboard_session SET token_hash = $2, stage = 'full', factor_at = $3, last_seen_at = $3, expires_at = $4,
       factor_failures = 0, challenge = NULL, challenge_at = NULL WHERE id = $1`,
    [id, tokenHash(token), now, new Date(now.getTime() + ABSOLUTE_MS)],
  )
  return token
}

export async function deleteSession(id: string): Promise<void> {
  await requirePool().query('DELETE FROM app.dashboard_session WHERE id = $1', [id])
}

export async function deleteAllSessions(): Promise<void> {
  await requirePool().query('DELETE FROM app.dashboard_session')
}

export async function countFactorFailure(id: string): Promise<number> {
  const { rows } = await requirePool().query<{ n: number }>('UPDATE app.dashboard_session SET factor_failures = factor_failures + 1 WHERE id = $1 RETURNING factor_failures AS n', [id])
  return rows[0]?.n ?? 0
}

export async function saveChallenge(id: string, challenge: string, now = new Date()): Promise<void> {
  await requirePool().query('UPDATE app.dashboard_session SET challenge = $2, challenge_at = $3 WHERE id = $1', [id, challenge, now])
}

/** Lit et efface le défi d'un seul geste : il ne sert qu'une fois, et moins de 5 minutes. */
export async function takeChallenge(id: string, now = new Date()): Promise<string | null> {
  const { rows } = await requirePool().query<{ challenge: string | null; challengeAt: Date | null }>(
    `WITH old AS (SELECT id, challenge, challenge_at FROM app.dashboard_session WHERE id = $1 FOR UPDATE)
     UPDATE app.dashboard_session s SET challenge = NULL, challenge_at = NULL FROM old WHERE s.id = old.id
     RETURNING old.challenge AS challenge, old.challenge_at AS "challengeAt"`,
    [id],
  )
  const { challenge, challengeAt } = rows[0] ?? {}
  if (!challenge || !challengeAt || now.getTime() - challengeAt.getTime() > CHALLENGE_MS) return null
  return challenge
}
