import { NextResponse, type NextRequest } from 'next/server'
import { searchFoods } from '@/lib/server/food-suggest'
import { clientIp, overLimit } from '@/lib/server/rate-window'

// @cdc scanner — recherche d'un produit par son nom, sans compte : GET /api/scanner/recherche?q=edgard.
// Lecture de la base seule, aucun appel à l'IA. Limitée par adresse, l'adresse n'est pas gardée.

export const dynamic = 'force-dynamic'

const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' }
const LIMITS = [{ windowMs: 60_000, max: 40 }] as const

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (overLimit(`recherche:${clientIp(req.headers)}`, LIMITS)) return NextResponse.json({ items: [] }, { status: 429, headers })
  const q = (req.nextUrl.searchParams.get('q') ?? '').slice(0, 80)
  const items = await searchFoods(q, { treats: true }).catch(() => [])
  return NextResponse.json({ items }, { headers })
}
