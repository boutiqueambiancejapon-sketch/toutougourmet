import { Secret, TOTP } from 'otpauth'
import { requirePool } from './mode'
import { decryptSecret, encryptSecret } from './secrets'

// @cdc tableau de bord — code à 6 chiffres (RFC 6238, SHA-1, 30 s) par la bibliothèque otpauth :
// réglages lus par toutes les applications, trousseau d'iPhone compris. Une période d'écart acceptée
// de chaque côté, et un code déjà utilisé refusé.

const PERIOD = 30

function totpOf(base32: string): TOTP {
  return new TOTP({ issuer: 'Toutou Gourmet', label: 'Tableau de bord', algorithm: 'SHA1', digits: 6, period: PERIOD, secret: Secret.fromBase32(base32) })
}

export interface TotpEnrollment {
  uri: string
  secret: string
}

/** Enrôlement en cours : le secret n'ouvre rien tant qu'un premier code ne l'a pas confirmé. */
export async function startTotpEnrollment(): Promise<TotpEnrollment | null> {
  const secret = new Secret({ size: 20 }).base32
  const { rowCount } = await requirePool().query(
    `INSERT INTO app.dashboard_totp (id, secret_enc) VALUES (1, $1)
     ON CONFLICT (id) DO UPDATE SET secret_enc = EXCLUDED.secret_enc, created_at = now() WHERE app.dashboard_totp.confirmed_at IS NULL`,
    [encryptSecret(secret)],
  )
  return rowCount === 1 ? { uri: totpOf(secret).toString(), secret } : null
}

/** Période du code, ou null s'il est faux. */
export function matchingCounter(base32: string, code: string, timestamp = Date.now()): number | null {
  if (!/^\d{6}$/.test(code)) return null
  const delta = totpOf(base32).validate({ token: code, timestamp, window: 1 })
  return delta === null ? null : Math.floor(timestamp / 1000 / PERIOD) + delta
}

async function readRow(): Promise<{ secret: string; confirmed: boolean } | null> {
  const { rows } = await requirePool().query<{ secret_enc: string; confirmed_at: Date | null }>('SELECT secret_enc, confirmed_at FROM app.dashboard_totp WHERE id = 1')
  const row = rows[0]
  const secret = row ? decryptSecret(row.secret_enc) : null
  return row && secret ? { secret, confirmed: row.confirmed_at !== null } : null
}

/** Premier code juste : le secret devient un facteur. */
export async function confirmTotp(code: string): Promise<boolean> {
  const row = await readRow()
  if (!row || row.confirmed) return false
  const counter = matchingCounter(row.secret, code)
  if (counter === null) return false
  const { rowCount } = await requirePool().query('UPDATE app.dashboard_totp SET confirmed_at = now(), last_counter = $1 WHERE id = 1 AND confirmed_at IS NULL', [counter])
  return rowCount === 1
}

/** Connexion : code juste, et période plus récente que la dernière acceptée (écriture atomique). */
export async function verifyTotp(code: string): Promise<boolean> {
  const row = await readRow()
  if (!row?.confirmed) return false
  const counter = matchingCounter(row.secret, code)
  if (counter === null) return false
  const { rowCount } = await requirePool().query('UPDATE app.dashboard_totp SET last_counter = $1 WHERE id = 1 AND confirmed_at IS NOT NULL AND last_counter < $1', [counter])
  return rowCount === 1
}

export async function removeTotp(): Promise<void> {
  await requirePool().query('DELETE FROM app.dashboard_totp')
}
