import { toNextJsHandler } from 'better-auth/next-js'
import { getAuth } from '@/lib/server/auth'

// @cdc lot 4 — routes de Better Auth (/api/auth/*). 404 quand la base n'est pas configurée.

export const dynamic = 'force-dynamic'

const notFound = () => new Response('Not Found', { status: 404 })

export async function GET(request: Request): Promise<Response> {
  const auth = getAuth()
  return auth ? toNextJsHandler(auth).GET(request) : notFound()
}

export async function POST(request: Request): Promise<Response> {
  const auth = getAuth()
  return auth ? toNextJsHandler(auth).POST(request) : notFound()
}
