import { NextRequest, NextResponse } from 'next/server'
import { SignJWT, importPKCS8 } from 'jose'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ServiceAccount {
  client_email: string
  private_key: string
  token_uri: string
}

interface IndexingResult {
  url: string
  status: 'success' | 'error' | 'rate_limited'
  code: number
  message: string
}

interface IndexingRequest {
  urls: string[]
  action?: 'update' | 'delete'
  secret?: string
}

// ─── Auth ────────────────────────────────────────────────────────────────────

async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const privateKey = await importPKCS8(sa.private_key, 'RS256')

  const jwt = await new SignJWT({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: sa.token_uri,
    iat: now,
    exp: now + 3600,
  })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .sign(privateKey)

  const resp = await fetch(sa.token_uri, {
    method: 'POST',
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

// ─── Indexing ────────────────────────────────────────────────────────────────

const INDEXING_ENDPOINT =
  'https://indexing.googleapis.com/v3/urlNotifications:publish'

async function submitUrl(
  url: string,
  action: 'update' | 'delete',
  token: string
): Promise<IndexingResult> {
  const type = action === 'update' ? 'URL_UPDATED' : 'URL_DELETED'

  const resp = await fetch(INDEXING_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ url, type }),
  })

  const text = await resp.text()

  if (resp.status === 429) {
    return { url, status: 'rate_limited', code: 429, message: 'Rate limited' }
  }

  if (!resp.ok) {
    return { url, status: 'error', code: resp.status, message: text.slice(0, 200) }
  }

  return { url, status: 'success', code: 200, message: text.slice(0, 200) }
}

// ─── Route ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Auth : vérifier le secret partagé
  const apiSecret = process.env.INDEXING_API_SECRET
  if (!apiSecret) {
    return NextResponse.json(
      { error: 'INDEXING_API_SECRET not configured' },
      { status: 500 }
    )
  }

  // Lire le service account depuis la variable d'env Vercel
  const saJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!saJson) {
    return NextResponse.json(
      { error: 'GOOGLE_SERVICE_ACCOUNT_JSON not configured' },
      { status: 500 }
    )
  }

  let body: IndexingRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Vérifier le secret
  if (body.secret !== apiSecret) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  const { urls, action = 'update' } = body

  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json(
      { error: 'urls must be a non-empty array' },
      { status: 400 }
    )
  }

  if (urls.length > 200) {
    return NextResponse.json(
      { error: 'Max 200 URLs per request (Google daily quota)' },
      { status: 400 }
    )
  }

  // Parser le service account
  let sa: ServiceAccount
  try {
    sa = JSON.parse(saJson) as ServiceAccount
  } catch {
    return NextResponse.json(
      { error: 'GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON' },
      { status: 500 }
    )
  }

  // Obtenir un token OAuth2
  let token: string
  try {
    token = await getAccessToken(sa)
  } catch (err) {
    return NextResponse.json(
      { error: `Auth failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    )
  }

  // Soumettre les URLs une par une
  const results: IndexingResult[] = []
  let successCount = 0
  let errorCount = 0

  for (const url of urls) {
    const result = await submitUrl(url, action, token)
    results.push(result)

    if (result.status === 'success') successCount++
    else errorCount++

    // Rate limit : si Google renvoie 429, on arrête
    if (result.status === 'rate_limited') {
      // Marquer les URLs restantes comme non traitées
      const remaining = urls.slice(urls.indexOf(url) + 1)
      for (const r of remaining) {
        results.push({ url: r, status: 'rate_limited', code: 429, message: 'Skipped (quota reached)' })
        errorCount++
      }
      break
    }
  }

  return NextResponse.json({
    total: urls.length,
    success: successCount,
    errors: errorCount,
    results,
  })
}
