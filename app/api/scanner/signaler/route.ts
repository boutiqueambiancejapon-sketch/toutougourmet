import { NextResponse, type NextRequest } from 'next/server'
import { getSessionUser } from '@/lib/server/auth'
import { overLimit } from '@/lib/server/rate-window'
import { addReport } from '@/lib/server/scanner'

// @cdc lot 6 — signaler une erreur de lecture (AI Act : contester une lecture faite par une IA).
// Le message est relu par la rédaction avant toute correction de la fiche.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'private, no-store' }

export async function POST(request: NextRequest): Promise<NextResponse> {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401, headers: NO_STORE })
  if (overLimit(`report:${user.id}`, [{ windowMs: 60 * 60_000, max: 10 }])) return NextResponse.json({ ok: false }, { status: 429, headers: NO_STORE })
  const body = (await request.json().catch(() => null)) as { analysisId?: unknown; message?: unknown } | null
  const analysisId = typeof body?.analysisId === 'string' ? body.analysisId : ''
  const message = typeof body?.message === 'string' ? body.message.trim().slice(0, 1000) : ''
  if (!/^[0-9a-f-]{36}$/i.test(analysisId) || message.length < 3) return NextResponse.json({ ok: false }, { status: 400, headers: NO_STORE })
  const ok = await addReport(user.id, analysisId, message)
  return NextResponse.json({ ok }, { status: ok ? 200 : 404, headers: NO_STORE })
}
