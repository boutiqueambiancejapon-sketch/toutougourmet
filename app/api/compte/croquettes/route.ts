import { NextResponse, type NextRequest } from 'next/server'
import { getSessionUser } from '@/lib/server/auth'
import { searchFoods, type FoodSuggestion } from '@/lib/server/food-suggest'

// @cdc profil chien — suggestions du champ « Ce qu'il mange » (formulaire du chien), réservées
// aux comptes connectés : GET /api/compte/croquettes?q=franklin → 8 fiches au plus.

export const dynamic = 'force-dynamic'

const headers = { 'Cache-Control': 'private, no-store' }

export async function GET(req: NextRequest): Promise<NextResponse> {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ items: [] }, { status: 401, headers })
  const q = (req.nextUrl.searchParams.get('q') ?? '').slice(0, 80)
  const items: FoodSuggestion[] = await searchFoods(q).catch(() => [])
  return NextResponse.json({ items }, { headers })
}
