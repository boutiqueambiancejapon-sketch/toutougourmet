import { NextRequest, NextResponse } from 'next/server'
import { SignJWT, importPKCS8 } from 'jose'
import { rejectBadSecret } from '@/lib/server/api-secret'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function notConfigured(): NextResponse {
  return NextResponse.json(
    { error: 'Not configured' },
    { status: 501 },
  )
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface ServiceAccount {
  client_email: string
  private_key: string
  token_uri: string
}

interface SearchConsoleRequest {
  secret: string
  siteUrl?: string
  period?: '7d' | '28d' | '90d'
  type?: 'pages' | 'queries' | 'both'
  limit?: number
}

interface PageRow {
  url: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

interface QueryRow {
  query: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

// ─── Auth (même logique que /api/indexing) ────────────────────────────────────

async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const privateKey = await importPKCS8(sa.private_key, 'RS256')

  const jwt = await new SignJWT({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: sa.token_uri,
    iat: now,
    exp: now + 3600,
  })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .sign(privateKey)

  const resp = await fetch(sa.token_uri, {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`Token exchange failed (${resp.status}): ${text}`)
  }

  const data = await resp.json()
  return data.access_token as string
}

// ─── Search Analytics ────────────────────────────────────────────────────────

const SC_API = 'https://www.googleapis.com/webmasters/v3/sites'

function getDateRange(period: '7d' | '28d' | '90d'): { startDate: string; endDate: string } {
  const end = new Date()
  // Search Console a ~3 jours de délai
  end.setDate(end.getDate() - 3)
  const start = new Date(end)

  if (period === '7d') start.setDate(start.getDate() - 7)
  else if (period === '28d') start.setDate(start.getDate() - 28)
  else start.setDate(start.getDate() - 90)

  const fmt = (d: Date) => d.toISOString().split('T')[0]
  return { startDate: fmt(start), endDate: fmt(end) }
}

async function fetchSearchAnalytics(
  siteUrl: string,
  token: string,
  dimensions: string[],
  period: '7d' | '28d' | '90d',
  limit: number
): Promise<{ rows: Record<string, unknown>[] }> {
  const { startDate, endDate } = getDateRange(period)
  const encodedSite = encodeURIComponent(siteUrl)

  const resp = await fetch(
    `${SC_API}/${encodedSite}/searchAnalytics/query`,
    {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions,
        rowLimit: limit,
        dataState: 'final',
      }),
    }
  )

  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`Search Analytics API (${resp.status}): ${text}`)
  }

  return resp.json()
}

// ─── Route ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Service abandonné à la sortie de Vercel (DECISIONS.md, 2026-11-02) : sans ses variables,
  // la route répond 501 au lieu d'échouer.
  const apiSecret = process.env.INDEXING_API_SECRET
  const saJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!apiSecret || !saJson) return notConfigured()

  let body: SearchConsoleRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const rejected = rejectBadSecret(req.headers, 'search-console', body?.secret, apiSecret)
  if (rejected) return rejected

  // Propriétés du site seulement ; période, type et limite bornés.
  const SITES = ['https://www.toutou-gourmet.com', 'https://www.toutou-gourmet.com/', 'sc-domain:toutou-gourmet.com']
  const siteUrl = body.siteUrl ?? 'https://www.toutou-gourmet.com'
  const period = body.period ?? '28d'
  const type = body.type ?? 'both'
  if (!SITES.includes(siteUrl) || !['7d', '28d', '90d'].includes(period) || !['pages', 'queries', 'both'].includes(type)) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  }
  const limit = Math.max(1, Math.min(Number.isFinite(body.limit) ? Number(body.limit) : 50, 1000))

  let sa: ServiceAccount
  try {
    sa = JSON.parse(saJson) as ServiceAccount
  } catch {
    console.error('[search-console] GOOGLE_SERVICE_ACCOUNT_JSON invalide')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  let token: string
  try {
    token = await getAccessToken(sa)
  } catch (err) {
    console.error('[search-console] jeton Google refusé', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Upstream auth failed' }, { status: 502 })
  }

  const result: {
    period: string
    siteUrl: string
    pages?: PageRow[]
    queries?: QueryRow[]
    summary?: { totalClicks: number; totalImpressions: number; avgCtr: number; avgPosition: number }
  } = { period, siteUrl }

  try {
    // ── Pages ──
    if (type === 'pages' || type === 'both') {
      const data = await fetchSearchAnalytics(siteUrl, token, ['page'], period, limit)
      const rows = (data.rows ?? []) as { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }[]

      result.pages = rows.map((r) => ({
        url: r.keys[0],
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: Math.round(r.ctr * 10000) / 100,
        position: Math.round(r.position * 10) / 10,
      }))

      // Résumé global
      const totalClicks = rows.reduce((s, r) => s + r.clicks, 0)
      const totalImpressions = rows.reduce((s, r) => s + r.impressions, 0)
      result.summary = {
        totalClicks,
        totalImpressions,
        avgCtr: totalImpressions > 0 ? Math.round((totalClicks / totalImpressions) * 10000) / 100 : 0,
        avgPosition: rows.length > 0 ? Math.round((rows.reduce((s, r) => s + r.position, 0) / rows.length) * 10) / 10 : 0,
      }
    }

    // ── Requêtes ──
    if (type === 'queries' || type === 'both') {
      const data = await fetchSearchAnalytics(siteUrl, token, ['query'], period, limit)
      const rows = (data.rows ?? []) as { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }[]

      result.queries = rows.map((r) => ({
        query: r.keys[0],
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: Math.round(r.ctr * 10000) / 100,
        position: Math.round(r.position * 10) / 10,
      }))
    }
  } catch (err) {
    console.error('[search-console] appel API', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Upstream API failed' }, { status: 502 })
  }

  return NextResponse.json(result)
}
