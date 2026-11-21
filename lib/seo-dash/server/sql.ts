import type { Pool } from 'pg'
import { getPool } from '@/lib/server/db'
import { pageTypeSql } from '../config'
import { DEVICE_GSC, DEVICE_HITS, type Filters } from '../filters'

// @cdc tableau de bord SEO — petites briques SQL : paramètres numérotés, filtres communs (type de page, appareil),
// lecture protégée (un bloc en panne reste vide, la page tient).

export class Params {
  values: unknown[] = []
  add(v: unknown): string {
    this.values.push(v)
    return `$${this.values.length}`
  }
}

/** Conditions SQL des filtres. pageCol : colonne du chemin ; device : colonne et dictionnaire de valeurs. */
export function filterSql(f: Filters, p: Params, opts: { pageCol?: string; deviceCol?: string; deviceKind?: 'gsc' | 'hits' }): string {
  const parts: string[] = []
  if (opts.pageCol && f.pages !== 'toutes') {
    const re = pageTypeSql(f.pages)
    if (re) parts.push(`${opts.pageCol} ~ ${p.add(re)}`)
  }
  if (opts.deviceCol && f.device !== 'tous') {
    const map = opts.deviceKind === 'hits' ? DEVICE_HITS : DEVICE_GSC
    parts.push(`${opts.deviceCol} = ${p.add(map[f.device])}`)
  }
  return parts.length ? ` AND ${parts.join(' AND ')}` : ''
}

export async function readBlock<T>(label: string, fallback: T, read: (pool: Pool) => Promise<T>): Promise<{ value: T; ok: boolean }> {
  const pool = getPool()
  if (!pool) return { value: fallback, ok: false }
  try {
    return { value: await read(pool), ok: true }
  } catch (err) {
    console.error(`[tableau-de-bord seo] ${label}`, err instanceof Error ? err.message : err)
    return { value: fallback, ok: false }
  }
}

/** Valeur d'une lecture protégée, sans le drapeau. */
export async function read<T>(label: string, fallback: T, fn: (pool: Pool) => Promise<T>): Promise<T> {
  return (await readBlock(label, fallback, fn)).value
}

export const num = (v: unknown): number => (v === null || v === undefined ? 0 : Number(v))
