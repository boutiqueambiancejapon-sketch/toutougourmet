import { brevoKey, listId } from './brevo-newsletter'

// @cdc tableau de bord — inscrits à la lettre, lus en direct dans la liste Brevo (BREVO_LIST_ID) à
// chaque affichage : aucune adresse n'est copiée dans notre base. Lecture seule (GET uniquement),
// sans cache, 6 s au plus par appel. Les journaux ne gardent que le code HTTP, jamais d'adresse.

const API = 'https://api.brevo.com/v3'
const TIMEOUT_MS = 6_000
export const PAGE_SIZE = 50
/** Recherche et export parcourent la liste par blocs de 500, 5 000 contacts au plus. */
const SCAN_BLOCK = 500
const SCAN_MAX = 5_000

export type SubscriberStatus = 'actif' | 'desinscrit'

export interface Subscriber {
  email: string
  createdAt: string
  source: string | null
  status: SubscriberStatus
}

export type SubscribersResult =
  | { ok: true; total: number; matched: number; rows: Subscriber[]; truncated: boolean }
  | { ok: false; reason: 'not-configured' | 'unreachable' }

interface BrevoContact {
  email?: string
  createdAt?: string
  emailBlacklisted?: boolean
  listUnsubscribed?: number[]
  attributes?: Record<string, unknown>
}

class BrevoReadError extends Error {}

function toSubscriber(c: BrevoContact, list: number): Subscriber {
  const unsubscribed = c.emailBlacklisted === true || (c.listUnsubscribed ?? []).includes(list)
  const source = c.attributes?.SOURCE
  return {
    email: c.email ?? '',
    createdAt: c.createdAt ?? '',
    source: typeof source === 'string' ? source : null,
    status: unsubscribed ? 'desinscrit' : 'actif',
  }
}

async function readBlock(key: string, list: number, offset: number, limit: number): Promise<{ count: number; rows: Subscriber[] }> {
  let res: Response
  try {
    res = await fetch(`${API}/contacts/lists/${list}/contacts?limit=${limit}&offset=${offset}&sort=desc`, {
      headers: { 'api-key': key, accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch (err) {
    throw new BrevoReadError(err instanceof Error ? err.name : 'fetch')
  }
  if (!res.ok) throw new BrevoReadError(`status=${res.status}`)
  const data = (await res.json()) as { count?: number; contacts?: BrevoContact[] }
  return { count: data.count ?? 0, rows: (data.contacts ?? []).map((c) => toSubscriber(c, list)) }
}

function config(): { key: string; list: number } | null {
  const key = brevoKey()
  const list = listId()
  return key && list ? { key, list } : null
}

function failed(err: unknown): SubscribersResult {
  console.error('[inscrits] lecture Brevo', err instanceof BrevoReadError ? err.message : 'erreur')
  return { ok: false, reason: 'unreachable' }
}

/** Toute la liste (5 000 contacts au plus), plus récents d'abord. */
async function scanAll(key: string, list: number): Promise<{ count: number; rows: Subscriber[]; truncated: boolean }> {
  const first = await readBlock(key, list, 0, SCAN_BLOCK)
  const rows = [...first.rows]
  for (let offset = SCAN_BLOCK; offset < Math.min(first.count, SCAN_MAX); offset += SCAN_BLOCK) {
    rows.push(...(await readBlock(key, list, offset, SCAN_BLOCK)).rows)
  }
  return { count: first.count, rows, truncated: first.count > SCAN_MAX }
}

/** Une page de 50. Avec `query` : filtre insensible à la casse sur l'adresse, côté serveur. */
export async function listSubscribers(page: number, query: string): Promise<SubscribersResult> {
  const c = config()
  if (!c) return { ok: false, reason: 'not-configured' }
  try {
    if (!query) {
      const block = await readBlock(c.key, c.list, (page - 1) * PAGE_SIZE, PAGE_SIZE)
      return { ok: true, total: block.count, matched: block.count, rows: block.rows, truncated: false }
    }
    const all = await scanAll(c.key, c.list)
    const needle = query.toLowerCase()
    const hits = all.rows.filter((s) => s.email.toLowerCase().includes(needle))
    const rows = hits.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    return { ok: true, total: all.count, matched: hits.length, rows, truncated: all.truncated }
  } catch (err) {
    return failed(err)
  }
}

/** Pour l'export CSV : toute la liste. */
export async function allSubscribers(): Promise<SubscribersResult> {
  const c = config()
  if (!c) return { ok: false, reason: 'not-configured' }
  try {
    const all = await scanAll(c.key, c.list)
    return { ok: true, total: all.count, matched: all.rows.length, rows: all.rows, truncated: all.truncated }
  } catch (err) {
    return failed(err)
  }
}
