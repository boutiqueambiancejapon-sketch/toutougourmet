import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/server/auth'
import { changerFavori, slugsFavoris } from '@/lib/server/favoris'

// @cdc compte — « Mes aliments » : liste des fiches gardées (GET) et ajout ou retrait (POST, même origine seulement).

export const dynamic = 'force-dynamic'

const headers = { 'Cache-Control': 'private, no-store' }

export async function GET(): Promise<NextResponse> {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ slugs: [] }, { status: 401, headers })
  return NextResponse.json({ slugs: await slugsFavoris(user.id) }, { headers })
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const origin = req.headers.get('origin')
  if (!origin || new URL(origin).host !== req.headers.get('host')) return NextResponse.json({ ok: false }, { status: 403, headers })
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401, headers })
  const body = (await req.json().catch(() => null)) as { slug?: unknown; garder?: unknown } | null
  if (!body || typeof body.slug !== 'string' || !/^[a-z0-9-]{1,100}$/.test(body.slug) || typeof body.garder !== 'boolean') {
    return NextResponse.json({ ok: false }, { status: 400, headers })
  }
  const ok = await changerFavori(user.id, body.slug, body.garder)
  return NextResponse.json({ ok }, { status: ok ? 200 : 404, headers })
}
