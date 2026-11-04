import type { Pool } from 'pg'
import { getPool } from './db'
import { emailHash, emailHashSecret } from './email-hash'

// @cdc e-mails — désinscriptions faites par notre lien (analytics.email_optouts, empreinte
// seulement). La liste Brevo ne suffit pas : un compte qui n'a jamais rejoint la lettre n'y figure
// pas, et ses rappels doivent quand même s'arrêter au premier clic sur « Se désinscrire ».

const pgCode = (err: unknown): string => (err && typeof err === 'object' && 'code' in err ? String(err.code) : 'inconnu')
const UNDEFINED_TABLE = '42P01'

/** false : l'écriture a échoué alors que la table existe, le lecteur doit réessayer. */
export async function recordOptOut(email: string): Promise<boolean> {
  const pool = getPool()
  if (!pool) return true
  try {
    await pool.query('INSERT INTO analytics.email_optouts (email_hash) VALUES ($1) ON CONFLICT DO NOTHING', [emailHash(email, emailHashSecret())])
    return true
  } catch (err) {
    console.error('[newsletter] désinscription non notée, code', pgCode(err))
    return pgCode(err) === UNDEFINED_TABLE
  }
}

/** Empreintes désinscrites. null : table absente, les rappels de compte ne partent pas. */
export async function readOptOuts(pool: Pool): Promise<Set<string> | null> {
  try {
    const { rows } = await pool.query<{ email_hash: string }>('SELECT email_hash FROM analytics.email_optouts')
    return new Set(rows.map((r) => r.email_hash))
  } catch (err) {
    if (pgCode(err) === UNDEFINED_TABLE) return null
    throw err
  }
}
