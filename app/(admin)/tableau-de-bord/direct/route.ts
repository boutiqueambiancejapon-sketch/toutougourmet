import { NextResponse } from 'next/server'
import { dashboardAllowed } from '@/lib/dashboard/guard'
import { getPool } from '@/lib/server/db'
import { getLive } from '@/lib/server/dashboard-live'

// @cdc tableau de bord — données de la vue « En direct », protégées comme la page (proxy.ts).
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  if (!(await dashboardAllowed())) return new NextResponse(null, { status: 401, headers: { 'Cache-Control': 'no-store' } })
  const pool = getPool()
  if (!pool) return NextResponse.json({ error: 'no-db' }, { status: 503 })
  try {
    return NextResponse.json(await getLive(pool), { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    console.error('[dashboard/direct]', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'query' }, { status: 500 })
  }
}
