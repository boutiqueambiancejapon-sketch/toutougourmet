import { createHmac, timingSafeEqual } from 'node:crypto'
import type { Pool } from 'pg'
import { getPool } from '@/lib/server/db'
import {
  buildStaticList,
  findFingerprint,
  IGNORED_IP_TTL_HOURS,
  isStaticIgnored,
  newFingerprint,
  visitorKey,
} from '@/scripts/lib/analytics-ignore.mjs'

// @cdc mesure — exclut le propriétaire et le serveur des statistiques, sans IP en clair.
// 1. Identification réussie au tableau de bord (proxy.ts) : cookie signé sur tout le domaine, et
//    empreinte salée de l'adresse dans analytics.ignored_ips, valable 12 h.
// 2. Sur le site, /api/e voit le cookie : pas d'événement, et l'empreinte suit la nouvelle adresse
//    (iPhone en déplacement). L'ingestion des journaux Caddy, qui ne voit pas les cookies, écarte
//    ses pages vues grâce à cette empreinte.
// Sans la table (SQL pas encore posé), tout continue : seule la liste fixe s'applique.

export const OWNER_COOKIE = 'tg_owner'
const COOKIE_DAYS = 180
const RENEW_BELOW_DAYS = 30
const DAY_S = 86_400
const ROWS_CACHE_MS = 60_000
const MARK_EVERY_MS = 10 * 60_000

interface FingerprintRow {
  salt: string
  hash: string
}

const staticList = buildStaticList()

function signature(expiresAt: string): string | null {
  const secret = process.env.DASHBOARD_PASSWORD
  return secret ? createHmac('sha256', secret).update(`tg-owner:${expiresAt}`).digest('hex') : null
}

/** Valeur du cookie : date d'expiration et signature, rien sur la personne. */
export function ownerCookieValue(nowS = Math.floor(Date.now() / 1000)): string | null {
  const expiresAt = String(nowS + COOKIE_DAYS * DAY_S)
  const signed = signature(expiresAt)
  return signed ? `${expiresAt}.${signed}` : null
}

/** Secondes restantes d'un cookie correctement signé, 0 sinon. */
function secondsLeft(value: string | undefined, nowS: number): number {
  const [expiresAt = '', sent = ''] = (value ?? '').split('.')
  const expected = signature(expiresAt)
  if (!expected || sent.length !== expected.length) return 0
  if (!timingSafeEqual(Buffer.from(sent), Buffer.from(expected))) return 0
  return Math.max(Number(expiresAt) - nowS, 0)
}

export function isOwnerCookie(value: string | undefined, nowS = Math.floor(Date.now() / 1000)): boolean {
  return secondsLeft(value, nowS) > 0
}

export function ownerCookieNeedsRenewal(value: string | undefined, nowS = Math.floor(Date.now() / 1000)): boolean {
  return secondsLeft(value, nowS) < RENEW_BELOW_DAYS * DAY_S
}

/** Le tableau de bord est sur dashboard. et le site sur www. : le cookie couvre le domaine entier. */
export function ownerCookieOptions(host: string | null, secure: boolean) {
  const name = (host ?? '').split(':')[0].toLowerCase()
  const onDomain = name === 'toutou-gourmet.com' || name.endsWith('.toutou-gourmet.com')
  return {
    httpOnly: true,
    secure,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: COOKIE_DAYS * DAY_S,
    ...(onDomain ? { domain: '.toutou-gourmet.com' } : {}),
  }
}

let rowsCache: { at: number; rows: FingerprintRow[] } | null = null

async function activeRows(pool: Pool): Promise<FingerprintRow[]> {
  if (rowsCache && Date.now() - rowsCache.at < ROWS_CACHE_MS) return rowsCache.rows
  let rows: FingerprintRow[] = []
  try {
    const res = await pool.query<FingerprintRow>('SELECT salt, hash FROM analytics.ignored_ips WHERE expires_at > now()')
    rows = res.rows
  } catch (err) {
    console.error('[analytics-ignore] lecture impossible', err instanceof Error ? err.message : err)
  }
  rowsCache = { at: Date.now(), rows }
  return rows
}

const markedAt = new Map<string, number>()

/** Enregistre ou prolonge l'empreinte de cette adresse, au plus une fois par 10 minutes. Ne jette jamais. */
export async function markIgnoredVisitor(ip: string): Promise<void> {
  const pool = getPool()
  const key = visitorKey(ip)
  if (!pool || !key || isStaticIgnored(ip, staticList)) return
  const now = Date.now()
  if (now - (markedAt.get(key) ?? 0) < MARK_EVERY_MS) return
  if (markedAt.size > 1_000) markedAt.clear()
  markedAt.set(key, now)
  const ttl = `${IGNORED_IP_TTL_HOURS} hours`
  try {
    const { rows } = await pool.query<FingerprintRow>('SELECT salt, hash FROM analytics.ignored_ips')
    const known = findFingerprint(rows, ip)
    const fresh = known ? null : newFingerprint(ip)
    if (known) {
      await pool.query('UPDATE analytics.ignored_ips SET expires_at = now() + $1::interval WHERE hash = $2', [ttl, known.hash])
    } else if (fresh) {
      await pool.query('INSERT INTO analytics.ignored_ips (hash, salt, expires_at) VALUES ($1, $2, now() + $3::interval)', [fresh.hash, fresh.salt, ttl])
    }
    rowsCache = null
  } catch (err) {
    console.error('[analytics-ignore] écriture impossible', err instanceof Error ? err.message : err)
  }
}

/** Vrai si l'action vient du serveur ou du propriétaire : /api/e n'écrit alors rien. */
export async function isIgnoredVisitor(ip: string, ownerCookie: string | undefined): Promise<boolean> {
  if (isStaticIgnored(ip, staticList)) return true
  if (isOwnerCookie(ownerCookie)) {
    await markIgnoredVisitor(ip)
    return true
  }
  const pool = getPool()
  if (!pool) return false
  return findFingerprint(await activeRows(pool), ip) !== null
}
