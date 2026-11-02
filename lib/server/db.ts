import { Pool } from 'pg'

// @cdc mesure — connexion PostgreSQL locale (socket Unix, authentification par compte système).
// Sans DATABASE_URL (Vercel, build local), getPool() renvoie null et l'appelant ne fait rien.

const globalForPg = globalThis as unknown as { tgPool?: Pool | null }

export function getPool(): Pool | null {
  if (globalForPg.tgPool !== undefined) return globalForPg.tgPool
  const url = process.env.DATABASE_URL
  globalForPg.tgPool = url ? new Pool({ connectionString: url, max: 4, idleTimeoutMillis: 30_000 }) : null
  return globalForPg.tgPool
}
