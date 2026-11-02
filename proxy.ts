import { NextResponse, type NextRequest } from 'next/server'
import { dashboardCredentials, isAuthorized } from '@/lib/dashboard/auth'

// @cdc tableau de bord — proxy Next 16 (ex-middleware). Il ne concerne que /tableau-de-bord
// (voir config.matcher) : le reste du site ne passe jamais par ici.

export async function proxy(request: NextRequest) {
  const expected = dashboardCredentials()
  if (!expected) return new NextResponse('Not Found', { status: 404 })

  if (await isAuthorized(request.headers.get('authorization'), expected)) {
    const response = NextResponse.next()
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
    response.headers.set('Cache-Control', 'private, no-store')
    return response
  }

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
