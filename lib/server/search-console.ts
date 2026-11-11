import { createSign } from 'node:crypto'
import { readFile } from 'node:fs/promises'

// @cdc tableau de bord — Search Console en lecture seule (accès donné par le propriétaire le 2026-11-07). Compte de
// service Google, clé dans /srv/toutou/shared/gsc-key.json (GSC_KEY_FILE), jamais dans le dépôt. Jeton signé ici
// (RS256), sans bibliothèque Google.

const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly'
const KEY_FILE = process.env.GSC_KEY_FILE || '/srv/toutou/shared/gsc-key.json'

interface Cle {
  client_email: string
  private_key: string
}

let jeton: { valeur: string; expire: number } | null = null

const b64 = (s: string | Buffer) => Buffer.from(s).toString('base64url')

async function accessToken(): Promise<string> {
  if (jeton && jeton.expire > Date.now() + 60_000) return jeton.valeur
  const cle = JSON.parse(await readFile(KEY_FILE, 'utf8')) as Cle
  const now = Math.floor(Date.now() / 1000)
  const corps = `${b64(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${b64(JSON.stringify({ iss: cle.client_email, scope: SCOPE, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }))}`
  const signature = createSign('RSA-SHA256').update(corps).sign(cle.private_key)
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${corps}.${b64(signature)}` }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`jeton Google refusé (${res.status})`)
  const data = (await res.json()) as { access_token: string; expires_in: number }
  jeton = { valeur: data.access_token, expire: Date.now() + data.expires_in * 1000 }
  return jeton.valeur
}

async function gsc<T>(chemin: string, body?: unknown): Promise<T> {
  const res = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/${chemin}`, {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${await accessToken()}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    next: { revalidate: 3600 },
  })
  if (!res.ok) throw new Error(`Search Console ${res.status} : ${(await res.text()).slice(0, 200)}`)
  return (await res.json()) as T
}

export async function sitesGsc(): Promise<{ siteUrl: string; permissionLevel: string }[]> {
  return (await gsc<{ siteEntry?: { siteUrl: string; permissionLevel: string }[] }>('sites')).siteEntry ?? []
}

export interface LigneGsc {
  keys: string[]
  clicks: number
  impressions: number
  ctr: number
  position: number
}

/** Requêtes ou pages sur une période (dates AAAA-MM-JJ), triées par impressions. */
export async function analyseGsc(site: string, debut: string, fin: string, dimensions: ('query' | 'page' | 'date')[], rowLimit = 250, startRow = 0): Promise<LigneGsc[]> {
  const r = await gsc<{ rows?: LigneGsc[] }>(`sites/${encodeURIComponent(site)}/searchAnalytics/query`, { startDate: debut, endDate: fin, dimensions, rowLimit, startRow, dataState: 'all' })
  return r.rows ?? []
}
