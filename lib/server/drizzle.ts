import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import * as schema from '@/db/schema'
import { getPool } from './db'

// @cdc lot 4 — client Drizzle sur le pool pg partagé (lib/server/db.ts).
// Sans DATABASE_URL (build, Vercel), renvoie null : les comptes sont alors indisponibles.

export type Db = NodePgDatabase<typeof schema>

const globalForDb = globalThis as unknown as { tgDb?: Db | null }

export function getDb(): Db | null {
  if (globalForDb.tgDb !== undefined) return globalForDb.tgDb
  const pool = getPool()
  globalForDb.tgDb = pool ? drizzle(pool, { schema }) : null
  return globalForDb.tgDb
}
