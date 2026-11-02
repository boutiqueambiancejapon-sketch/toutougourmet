import { NextResponse } from 'next/server'
import { exportAccountData } from '@/lib/server/account-data'
import { getSessionUser } from '@/lib/server/auth'

// @cdc lot 4 — RGPD, droit à la portabilité : fichier JSON des données du compte connecté
// (profil, sessions, chiens, pesées). Jamais de mot de passe haché ni de jeton.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(): Promise<NextResponse> {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Cache-Control': 'private, no-store' } })
  const data = await exportAccountData(user.id)
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: { 'Cache-Control': 'private, no-store' } })
  const day = data.exportedAt.slice(0, 10)
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="toutou-gourmet-mes-donnees-${day}.json"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
