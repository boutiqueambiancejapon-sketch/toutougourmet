import { randomBytes } from 'node:crypto'
import { newBackupCodes, normalizeBackupCode } from '@/lib/dashboard/login/backup-codes'
import { requirePool } from './mode'
import { backupCodeHash, deviceHash, newToken } from './secrets'

// @cdc tableau de bord — ce qui est enrôlé : clés d'accès, secret TOTP, codes de secours, appareils.

export interface StoredPasskey {
  credentialId: string
  publicKey: string
  counter: number
  transports: string[]
  label: string
  createdAt: Date
  lastUsedAt: Date | null
}

export async function listPasskeys(): Promise<StoredPasskey[]> {
  const { rows } = await requirePool().query<StoredPasskey>(
    `SELECT credential_id AS "credentialId", public_key AS "publicKey", counter, transports, label, created_at AS "createdAt", last_used_at AS "lastUsedAt"
       FROM app.dashboard_passkey ORDER BY created_at`,
  )
  // pg rend bigint en chaîne.
  return rows.map((r) => ({ ...r, counter: Number(r.counter) }))
}

export async function factorsSummary(): Promise<{ passkeys: number; totp: boolean; backupCodes: number }> {
  const { rows } = await requirePool().query<{ passkeys: number; totp: number; backupCodes: number }>(
    `SELECT (SELECT count(*)::int FROM app.dashboard_passkey) AS passkeys,
            (SELECT count(*)::int FROM app.dashboard_totp WHERE confirmed_at IS NOT NULL) AS totp,
            (SELECT count(*)::int FROM app.dashboard_backup_code WHERE used_at IS NULL) AS "backupCodes"`,
  )
  const r = rows[0]
  return { passkeys: r?.passkeys ?? 0, totp: (r?.totp ?? 0) > 0, backupCodes: r?.backupCodes ?? 0 }
}

/** Facteur qui ouvre la connexion : une clé ou un TOTP confirmé. Les codes de secours n'en sont pas. */
export async function hasFactor(): Promise<boolean> {
  const f = await factorsSummary()
  return f.passkeys > 0 || f.totp
}

/** Remplace tous les codes. Rendus en clair ici, une seule fois, jamais écrits. */
export async function replaceBackupCodes(): Promise<string[]> {
  const codes = newBackupCodes()
  const client = await requirePool().connect()
  try {
    await client.query('BEGIN')
    await client.query('DELETE FROM app.dashboard_backup_code')
    await client.query('INSERT INTO app.dashboard_backup_code (code_hash) SELECT unnest($1::text[])', [codes.map(backupCodeHash)])
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK').catch(() => undefined)
    throw err
  } finally {
    client.release()
  }
  return codes
}

/** Consomme un code d'un seul geste : deux requêtes simultanées ne l'utilisent pas deux fois. */
export async function consumeBackupCode(input: string): Promise<boolean> {
  const code = normalizeBackupCode(input)
  // Empreinte calculée même pour une saisie mal formée : même travail dans les deux cas.
  const hash = backupCodeHash(code ?? randomBytes(8).toString('hex'))
  const { rowCount } = await requirePool().query('UPDATE app.dashboard_backup_code SET used_at = now() WHERE code_hash = $1 AND used_at IS NULL', [hash])
  return code !== null && rowCount === 1
}

export async function knownDevice(token: string | undefined): Promise<boolean> {
  if (!token || token.length > 128) return false
  const { rows } = await requirePool().query('SELECT 1 FROM app.dashboard_device WHERE hash = $1', [deviceHash(token)])
  return rows.length > 0
}

/** Note l'appareil. Rend le jeton à poser quand il est nouveau, sinon null. */
export async function rememberDevice(token: string | undefined, label: string): Promise<string | null> {
  if (token && (await knownDevice(token))) {
    await requirePool().query('UPDATE app.dashboard_device SET last_seen_at = now(), label = $2 WHERE hash = $1', [deviceHash(token), label])
    return null
  }
  const fresh = newToken()
  await requirePool().query('INSERT INTO app.dashboard_device (hash, label) VALUES ($1, $2)', [deviceHash(fresh), label])
  return fresh
}
