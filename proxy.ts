import { NextResponse, type NextRequest } from 'next/server'
import { dashboardCredentials, isAuthorized } from '@/lib/dashboard/auth'
import { clientIp, isLimited, overLimit } from '@/lib/server/rate-window'

// @cdc tableau de bord — proxy Next 16 (ex-middleware). Il ne concerne que /tableau-de-bord
// (voir config.matcher) : le reste du site ne passe jamais par ici.

// Mot de passe deviné : 10 échecs par adresse en 15 minutes, puis 429 (compteur en mémoire).
const FAIL_LIMITS = [{ windowMs: 15 * 60_000, max: 10 }] as const

export async function proxy(request: NextRequest) {
  const expected = dashboardCredentials()
  if (!expected) return new NextResponse('Not Found', { status: 404 })

  const failKey = `dashboard-fail:${clientIp(request.headers)}`
  if (isLimited(failKey, FAIL_LIMITS)) {
    return new NextResponse('Trop de tentatives', { status: 429, headers: { 'Retry-After': '900', 'Cache-Control': 'no-store' } })
  }

  if (await isAuthorized(request.headers.get('authorization'), expected)) {
    const response = NextResponse.next()
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
    response.headers.set('Cache-Control', 'private, no-store')
    return response
  }

  // Un en-tête absent (première visite) ne compte pas comme un échec.
  if (request.headers.get('authorization')) overLimit(failKey, FAIL_LIMITS)
  return new NextResponse('Authentification requise', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Toutou Gourmet", charset="UTF-8"',
      'Cache-Control': 'no-store',
    },
  })
}

export const config = {
  matcher: ['/tableau-de-bord', '/tableau-de-bord/:path*'],
}
