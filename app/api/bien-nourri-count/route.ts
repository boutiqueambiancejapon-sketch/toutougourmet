// @cdc analytics — route qui retourne le nombre total de bilans réalisés depuis
// le lancement, agrégé depuis Plausible Stats API v2 sur l'event « bien_nourri_completed ».
// Cache 1h (revalidate: 3600) pour limiter les appels à Plausible (rate-limit 600/h
// sur la Stats API). Silencieux en cas d'échec → retourne { count: 0 } pour ne
// jamais casser le sticky CTA.
//
// Env vars requises (à set côté Vercel) :
//   - PLAUSIBLE_API_KEY              (secret) — token Stats API généré dans Plausible UI
//   - NEXT_PUBLIC_PLAUSIBLE_DOMAIN   (public) — fallback "www.toutou-gourmet.com"

import { NextResponse } from 'next/server'

export const revalidate = 3600 // 1 hour ISR cache

const PLAUSIBLE_QUERY_ENDPOINT = 'https://plausible.io/api/v2/query'
const EVENT_NAME = 'bien_nourri_completed'
const DEFAULT_DOMAIN = 'www.toutou-gourmet.com'

interface PlausibleQueryResponse {
  results?: Array<{
    metrics?: number[]
    dimensions?: unknown[]
  }>
}

export async function GET() {
  const token = process.env.PLAUSIBLE_API_KEY
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? DEFAULT_DOMAIN

  // Pas de token = pas de stats → on retourne 0 silencieusement (le compteur
  // s'affiche à 0 jusqu'à ce que l'admin configure PLAUSIBLE_API_KEY)
  if (!token) {
    return NextResponse.json({ count: 0 })
  }

  try {
    const response = await fetch(PLAUSIBLE_QUERY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        site_id: domain,
        metrics: ['events'],
        date_range: 'all',
        filters: [['is', 'event:name', [EVENT_NAME]]],
      }),
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      console.warn('[bien-nourri-count] Plausible API non-OK', response.status)
      return NextResponse.json({ count: 0 })
    }

    const data = (await response.json()) as PlausibleQueryResponse
    const count = Number(data?.results?.[0]?.metrics?.[0]) || 0

    return NextResponse.json({ count })
  } catch (err) {
    console.warn('[bien-nourri-count] Fetch failed', err)
    return NextResponse.json({ count: 0 })
  }
}
