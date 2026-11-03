import type { Pool } from 'pg'
import { getPool } from './db'

// @cdc tableau de bord — chaque bloc se lit à part : une requête en panne donne un bloc vide
// (et une trace dans le journal), jamais une page cassée.

export async function safeRead<T>(label: string, fallback: T, read: (pool: Pool) => Promise<T>): Promise<{ value: T; ok: boolean }> {
  const pool = getPool()
  if (!pool) return { value: fallback, ok: false }
  try {
    return { value: await read(pool), ok: true }
  } catch (err) {
    console.error(`[tableau-de-bord] ${label}`, err instanceof Error ? err.message : err)
    return { value: fallback, ok: false }
  }
}
