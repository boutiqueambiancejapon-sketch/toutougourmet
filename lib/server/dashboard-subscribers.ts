import { brevoKey, listId } from './brevo-newsletter'

// @cdc tableau de bord — inscrits à la lettre, lus en direct dans la liste Brevo (BREVO_LIST_ID) à
// chaque affichage : aucune adresse n'est copiée dans notre base. Lecture seule (GET uniquement),
// sans cache, 6 s au plus par appel. Les journaux ne gardent que le code HTTP, jamais d'adresse.

const API = 'https://api.brevo.com/v3'
const TIMEOUT_MS = 6_000
/** Export et CRM parcourent la liste par blocs de 500, 5 000 contacts au plus. */
const SCAN_BLOCK = 500
const SCAN_MAX = 5_000

export type SubscriberStatus = 'actif' | 'desinscrit'

export interface Subscriber {
  email: string
  createdAt: string
  source: string | null
  status: SubscriberStatus
  /** Attribut Brevo WELCOME_SENT : la bienvenue est partie, sans date connue */
  welcomeSent: boolean
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
    welcomeSent: c.attributes?.WELCOME_SENT === true,
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

export type LetterStatus = { state: 'subscribed' | 'unsubscribed' | 'absent'; welcomeSent: boolean; createdAt: string | null } | { state: 'unknown' }

/** Une adresse dans la liste de la lettre, pour la fiche d'un compte. Brevo en panne ou absent : « unknown », sans lever d'erreur. */
export async function letterStatusOf(email: string): Promise<LetterStatus> {
  const c = config()
  if (!c || process.env.BREVO_DRY_RUN === '1') return { state: 'unknown' }
  try {
    const res = await fetch(`${API}/contacts/${encodeURIComponent(email)}`, {
      headers: { 'api-key': c.key, accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (res.status === 404) return { state: 'absent', welcomeSent: false, createdAt: null }
    if (!res.ok) throw new BrevoReadError(`status=${res.status}`)
    const contact = (await res.json()) as BrevoContact & { listIds?: number[] }
    const welcomeSent = contact.attributes?.WELCOME_SENT === true
    const createdAt = contact.createdAt ?? null
    if (contact.emailBlacklisted === true || (contact.listUnsubscribed ?? []).includes(c.list)) return { state: 'unsubscribed', welcomeSent, createdAt }
    return { state: (contact.listIds ?? []).includes(c.list) ? 'subscribed' : 'absent', welcomeSent, createdAt }
  } catch (err) {
    console.error('[inscrits] lecture d’un contact Brevo', err instanceof BrevoReadError ? err.message : err instanceof Error ? err.name : 'erreur')
    return { state: 'unknown' }
  }
}
