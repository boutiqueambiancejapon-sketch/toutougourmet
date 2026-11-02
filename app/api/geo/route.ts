import { NextResponse, type NextRequest } from 'next/server'
import { countryOf } from '@/lib/server/geo'
import { clientIp, overLimit, retryAfterSeconds } from '@/lib/server/rate-window'

// @cdc urgences — pays du visiteur (code ISO) pour afficher les bons numéros d'urgence.
// L'adresse IP sert au calcul puis est oubliée ; rien n'est enregistré.
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const LIMITS = [{ windowMs: 60_000, max: 30 }] as const

export function GET(req: NextRequest) {
  const ip = clientIp(req.headers)
  if (overLimit(`geo:${ip}`, LIMITS)) {
    return NextResponse.json({ country: null }, { status: 429, headers: { 'Retry-After': retryAfterSeconds(LIMITS), 'Cache-Control': 'no-store' } })
  }
  return NextResponse.json({ country: countryOf(ip) }, { headers: { 'Cache-Control': 'private, no-store' } })
}
