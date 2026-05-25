// @cdc analytics — route qui retourne le nombre de bilans réalisés sur 4 fenêtres
// temporelles distinctes (today / last_7d / last_30d / all_time), agrégées depuis
// Plausible Stats API v2 sur l'event « bien_nourri_completed ».
//
// 4 queries Plausible en parallèle (Promise.all), cachées 1h via ISR + Next fetch
// cache. Cible : ~4 calls/h vers Plausible (largement sous les 600/h du plan free).
//
// Le client (sticky CTA) utilise ces 4 valeurs pour piocher la fenêtre la plus
// flatteuse selon des seuils — chaque valeur est REELLE pour sa fenêtre, donc
// aucun mensonge sur le framing « aujourd'hui » vs « cette semaine ».
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

export interface BienNourriCountResponse {
  today: number
  last_7d: number
  last_30d: number
  all_time: number
}

/**
 * Query Plausible pour le count d'events sur une fenêtre temporelle donnée.
 * Retourne 0 silencieusement en cas d'échec (la chaîne survit).
 */
async function queryPlausibleCount(
  token: string,
  domain: string,
  dateRange: string,
): Promise<number> {
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
        date_range: dateRange,
        filters: [['is', 'event:name', [EVENT_NAME]]],
      }),
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      console.warn(`[bien-nourri-count] Plausible API non-OK (${dateRange})`, response.status)
      return 0
    }

    const data = (await response.json()) as PlausibleQueryResponse
    return Number(data?.results?.[0]?.metrics?.[0]) || 0
  } catch (err) {
    console.warn(`[bien-nourri-count] Fetch failed (${dateRange})`, err)
    return 0
  }
}

export async function GET() {
  const token = process.env.PLAUSIBLE_API_KEY
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? DEFAULT_DOMAIN

  // Pas de token configuré = pas de stats → on retourne 0 partout silencieusement
  if (!token) {
    const empty: BienNourriCountResponse = { today: 0, last_7d: 0, last_30d: 0, all_time: 0 }
    return NextResponse.json(empty)
  }

  // 4 queries Plausible en parallèle, chacune sur sa fenêtre réelle
  const [today, last_7d, last_30d, all_time] = await Promise.all([
    queryPlausibleCount(token, domain, 'day'),
    queryPlausibleCount(token, domain, '7d'),
    queryPlausibleCount(token, domain, '30d'),
    queryPlausibleCount(token, domain, 'all'),
  ])

  const payload: BienNourriCountResponse = { today, last_7d, last_30d, all_time }
  return NextResponse.json(payload)
}
