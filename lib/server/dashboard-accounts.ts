import type { Pool } from 'pg'
import { getPool } from './db'

// @cdc tableau de bord — comptes créés, lus dans app.user / app.membership / app.dog. Emplacement
// d'origine : analytics.signup_sources, vidée à la confirmation de l'adresse (signup-source.ts) et
// peut-être retirée plus tard ; sans ligne ou sans table, le compte est « non attribué ».
// Les journaux ne gardent que le code d'erreur PostgreSQL, jamais l'adresse ni le chien cherchés.
// Noms des chiens : lus pour la liste affichée seulement, jamais pour l'export ni le suivi (allAccounts).

export const ACCOUNTS_PAGE_SIZE = 50
const EXPORT_MAX = 20_000

export interface AccountRow {
  /** Identifiant du compte : c'est lui qui va dans l'URL de la fiche, jamais l'adresse */
  id: string
  email: string
  createdAt: Date
  verified: boolean
  place: string | null
  premium: boolean
  dogs: number
  dogNames: string[]
}

export type AccountsResult = { ok: true; total: number; matched: number; rows: AccountRow[] } | { ok: false }

/** Échappe % _ \ pour un ILIKE qui cherche la saisie telle quelle. */
function likePattern(query: string): string {
  return `%${query.replace(/[\\%_]/g, (c) => `\\${c}`)}%`
}

async function hasSignupSources(pool: Pool): Promise<boolean> {
  const res = await pool.query<{ ok: boolean }>(`SELECT to_regclass('analytics.signup_sources') IS NOT NULL AS ok`)
  return res.rows[0]?.ok === true
}

/** Saisie cherchée dans l'adresse ou le nom d'un chien. Toujours passée en paramètre, jamais collée au SQL. */
const SEARCH_WHERE = `($1::text IS NULL OR u.email ILIKE $1 ESCAPE '\\'
  OR EXISTS (SELECT 1 FROM app.dog sd WHERE sd.user_id = u.id AND sd.name ILIKE $1 ESCAPE '\\'))`

function selectSql(withPlace: boolean, withNames: boolean): string {
  const names = withNames ? `coalesce((SELECT array_agg(d.name ORDER BY d.created_at) FROM app.dog d WHERE d.user_id = u.id), '{}'::text[])` : `'{}'::text[]`
  return `SELECT u.id, u.email, u.created_at AS "createdAt", u.email_verified AS verified,
            ${withPlace ? 's.place' : 'NULL::text'} AS place,
            coalesce(m.plan = 'premium', false) AS premium,
            (SELECT count(*) FROM app.dog d WHERE d.user_id = u.id)::int AS dogs,
            ${names} AS "dogNames"
     FROM app."user" u
     LEFT JOIN app.membership m ON m.user_id = u.id
     ${withPlace ? 'LEFT JOIN analytics.signup_sources s ON s.user_id = u.id' : ''}
     WHERE ${SEARCH_WHERE}
     ORDER BY u.created_at DESC, u.id
     LIMIT $2 OFFSET $3`
}

function logFailure(err: unknown): void {
  const code = err && typeof err === 'object' && 'code' in err ? String(err.code) : 'inconnu'
  console.error('[inscrits] lecture des comptes, code', code)
}

async function read(query: string, limit: number, offset: number, withNames: boolean): Promise<AccountsResult> {
  const pool = getPool()
  if (!pool) return { ok: false }
  const pattern = query ? likePattern(query) : null
  try {
    const withPlace = await hasSignupSources(pool)
    const [counts, rows] = await Promise.all([
      pool.query<{ total: number; matched: number }>(
        `SELECT count(*)::int AS total, count(*) FILTER (WHERE ${SEARCH_WHERE})::int AS matched FROM app."user" u`,
        [pattern],
      ),
      pool.query<AccountRow>(selectSql(withPlace, withNames), [pattern, limit, offset]),
    ])
    const c = counts.rows[0] ?? { total: 0, matched: 0 }
    return { ok: true, total: c.total, matched: c.matched, rows: rows.rows }
  } catch (err) {
    logFailure(err)
    return { ok: false }
  }
}

export function listAccounts(page: number, query: string): Promise<AccountsResult> {
  return read(query, ACCOUNTS_PAGE_SIZE, (page - 1) * ACCOUNTS_PAGE_SIZE, true)
}

export function allAccounts(): Promise<AccountsResult> {
  return read('', EXPORT_MAX, 0, false)
}
