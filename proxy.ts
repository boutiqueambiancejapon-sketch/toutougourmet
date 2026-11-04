import { NextResponse, type NextRequest } from 'next/server'
import { dashboardCredentials, isAuthorized } from '@/lib/dashboard/auth'
import { clientIp, isLimited, overLimit } from '@/lib/server/rate-window'
import { markIgnoredVisitor, OWNER_COOKIE, ownerCookieNeedsRenewal, ownerCookieOptions, ownerCookieValue } from '@/lib/server/analytics-ignore'

// @cdc tableau de bord — proxy Next 16 (ex-middleware). Il ne concerne que /tableau-de-bord et
// la page du gardien /garde/[jeton] (voir config.matcher) : le reste du site ne passe jamais par ici.

// Mot de passe deviné : 10 échecs par adresse en 15 minutes, puis 429 (compteur en mémoire).
const FAIL_LIMITS = [{ windowMs: 15 * 60_000, max: 10 }] as const

// @cdc fiche de garde — page du gardien et son PDF : 30 vues par adresse en 10 minutes (un
// gardien en fait quelques-unes ; au-delà, quelqu'un essaie des jetons), jamais indexée, jamais
// en cache partagé, sans Referer.
const SITTER_LIMITS = [{ windowMs: 10 * 60_000, max: 30 }] as const
const SITTER_HEADERS = { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' }

function sitterProxy(request: NextRequest): NextResponse {
  if (overLimit(`garde:${clientIp(request.headers)}`, SITTER_LIMITS)) {
    return new NextResponse('Trop de demandes, réessaie dans quelques minutes.', { status: 429, headers: { ...SITTER_HEADERS, 'Retry-After': '600' } })
  }
  const response = NextResponse.next()
  for (const [key, value] of Object.entries(SITTER_HEADERS)) response.headers.set(key, value)
  return response
}

// @cdc mesure — identifié au tableau de bord : le propriétaire ne compte plus dans les statistiques
// (cookie signé + empreinte de son adresse, lib/server/analytics-ignore.ts). La mesure ne retarde
// ni ne casse jamais le tableau de bord.
function rememberOwner(request: NextRequest, response: NextResponse): void {
  void markIgnoredVisitor(clientIp(request.headers))
  if (!ownerCookieNeedsRenewal(request.cookies.get(OWNER_COOKIE)?.value)) return
  const value = ownerCookieValue()
  if (!value) return
  const secure = request.headers.get('x-forwarded-proto') === 'https'
  response.cookies.set(OWNER_COOKIE, value, ownerCookieOptions(request.headers.get('host'), secure))
}

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/garde/')) return sitterProxy(request)
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
    rememberOwner(request, response)
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
  matcher: ['/tableau-de-bord', '/tableau-de-bord/:path*', '/garde/:path*'],
}
