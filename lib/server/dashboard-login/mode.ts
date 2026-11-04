import { dashboardCredentials } from '@/lib/dashboard/auth'
import { getPool } from '@/lib/server/db'
import { authSecret } from './secrets'

// @cdc tableau de bord — bascule contrôlée. La nouvelle connexion ne s'active que si
// DASHBOARD_LOGIN_ENABLED=1, DASHBOARD_AUTH_SECRET et les tables sont là. Sinon, authentification
// Basic comme avant. Variable retirée et service relancé : retour à Basic, sans déploiement.
// Tables d'abord vues puis base en panne : pas de retour à Basic, qui sauterait le second facteur.

export type AuthMode = 'basic' | 'login' | 'unavailable'

const TABLES = ['session', 'passkey', 'totp', 'backup_code', 'device', 'login_event'].map((t) => `app.dashboard_${t}`)
const MISSING_RECHECK_MS = 30_000

const holder = globalThis as unknown as { tgDashboardTables?: { present: boolean; at: number } }

export function loginRequested(): boolean {
  return process.env.DASHBOARD_LOGIN_ENABLED === '1' && authSecret() !== null && dashboardCredentials() !== null
}

export async function dashboardAuthMode(): Promise<AuthMode> {
  const pool = getPool()
  if (!loginRequested() || !pool) return 'basic'
  const known = holder.tgDashboardTables
  if (known?.present) return 'login'
  if (known && Date.now() - known.at < MISSING_RECHECK_MS) return 'basic'
  try {
    const { rows } = await pool.query<{ missing: number }>('SELECT count(*)::int AS missing FROM unnest($1::text[]) AS t(name) WHERE to_regclass(name) IS NULL', [TABLES])
    const present = rows[0]?.missing === 0
    holder.tgDashboardTables = { present, at: Date.now() }
    return present ? 'login' : 'basic'
  } catch (err) {
    console.error('[dashboard-login] base injoignable', err instanceof Error ? err.message : err)
    return 'unavailable'
  }
}

export function requirePool() {
  const pool = getPool()
  if (!pool) throw new Error('DATABASE_URL absent')
  return pool
}
