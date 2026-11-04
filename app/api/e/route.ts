import { NextResponse, type NextRequest } from 'next/server'
import { getPool } from '@/lib/server/db'
import { BOT_UA, deviceOf, isAnalyticsEvent } from '@/lib/analytics-events'
import { countryOf } from '@/lib/server/geo'
import { clientIp } from '@/lib/server/rate-window'
import { isIgnoredVisitor, OWNER_COOKIE } from '@/lib/server/analytics-ignore'

// @cdc mesure — reçoit les actions des visiteurs (clic partenaire, outil, inscription, recherche)
// et les range dans analytics.events. Aucun cookie posé, aucune IP stockée : seul le pays déduit
// de l'adresse (base locale, lib/server/geo.ts) est écrit. Répond toujours 204 :
// la mesure ne doit jamais casser la page. Sans base (Vercel), ne fait rien.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_BODY = 2_000
const MAX_PROPS = 10
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 60

/** Limite simple par adresse, en mémoire seulement (l'adresse n'est jamais écrite). */
const hitsByIp = new Map<string, { n: number; until: number }>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  if (hitsByIp.size > 5_000) hitsByIp.clear()
  const entry = hitsByIp.get(ip)
  if (!entry || entry.until < now) {
    hitsByIp.set(ip, { n: 1, until: now + WINDOW_MS })
    return false
  }
  entry.n += 1
  return entry.n > MAX_PER_WINDOW
}

function cleanProps(raw: unknown): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {}
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out
  for (const [key, value] of Object.entries(raw).slice(0, MAX_PROPS)) {
    if (key.length > 40) continue
    if (typeof value === 'string') out[key] = value.slice(0, 120)
    else if (typeof value === 'number' && Number.isFinite(value)) out[key] = value
    else if (typeof value === 'boolean') out[key] = value
  }
  return out
}

function hostOf(url: unknown): string | null {
  if (typeof url !== 'string' || !url) return null
  try {
    return new URL(url).hostname.replace(/^www\./, '').slice(0, 100)
  } catch {
    return null
  }
}

const done = () => new NextResponse(null, { status: 204 })

export async function POST(req: NextRequest) {
  const pool = getPool()
  if (!pool) return done()

  const ua = req.headers.get('user-agent') ?? ''
  if (!ua || BOT_UA.test(ua)) return done()

  const origin = req.headers.get('origin')
  const host = req.headers.get('host')
  if (origin && host && hostOf(origin) !== host.replace(/^www\./, '').split(':')[0]) return done()

  const ip = clientIp(req.headers)
  if (rateLimited(ip)) return done()
  // @cdc mesure — propriétaire (cookie signé, empreinte de son adresse) et serveur : rien n'est écrit.
  if (await isIgnoredVisitor(ip, req.cookies.get(OWNER_COOKIE)?.value)) return done()

  const text = await req.text()
  if (text.length > MAX_BODY) return done()
  let body: { n?: unknown; p?: unknown; r?: unknown; props?: unknown }
  try {
    body = JSON.parse(text) as typeof body
  } catch {
    return done()
  }
  if (!isAnalyticsEvent(body.n) || typeof body.p !== 'string' || !body.p.startsWith('/')) return done()

  const refHost = hostOf(body.r)
  try {
    await pool.query(
      'INSERT INTO analytics.events (name, page, props, ref_host, device, country) VALUES ($1, $2, $3, $4, $5, $6)',
      [body.n, body.p.slice(0, 300), JSON.stringify(cleanProps(body.props)), refHost, deviceOf(ua), countryOf(ip)],
    )
  } catch (err) {
    console.error('[api/e] insert failed', err instanceof Error ? err.message : err)
  }
  return done()
}
