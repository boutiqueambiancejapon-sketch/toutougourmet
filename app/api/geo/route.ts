import { NextResponse, type NextRequest } from 'next/server'
import { countryOf } from '@/lib/server/geo'

// @cdc urgences — pays du visiteur (code ISO) pour afficher les bons numéros d'urgence.
// L'adresse IP sert au calcul puis est oubliée ; rien n'est enregistré.
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
  return NextResponse.json({ country: countryOf(ip) }, { headers: { 'Cache-Control': 'private, no-store' } })
}
