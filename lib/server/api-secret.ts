import { createHash, timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { clientIp, isLimited, overLimit } from './rate-window'

// @cdc sécurité — routes appelées par script avec un secret partagé (/api/indexing,
// /api/search-console). Comparaison en temps constant et blocage après 5 échecs par adresse
// en 15 minutes : le secret ne se devine pas par essais successifs.

const FAIL_LIMITS = [{ windowMs: 15 * 60_000, max: 5 }] as const

function sameSecret(provided: unknown, expected: string): boolean {
  if (typeof provided !== 'string' || provided === '') return false
  const a = createHash('sha256').update(provided).digest()
  const b = createHash('sha256').update(expected).digest()
  return timingSafeEqual(a, b)
}

/** null si le secret est bon ; sinon la réponse à renvoyer (401 ou 429). */
export function rejectBadSecret(headers: Headers, scope: string, provided: unknown, expected: string): NextResponse | null {
  const key = `secret:${scope}:${clientIp(headers)}`
  if (isLimited(key, FAIL_LIMITS)) return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': '900' } })
  if (sameSecret(provided, expected)) return null
  overLimit(key, FAIL_LIMITS)
  return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
}
