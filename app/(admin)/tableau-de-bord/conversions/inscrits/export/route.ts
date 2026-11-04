import { NextResponse, type NextRequest } from 'next/server'
import { dashboardAllowed } from '@/lib/dashboard/guard'
import { csvDate, csvFileName, toCsv, type CsvValue } from '@/lib/dashboard/csv'
import { parseList } from '@/lib/dashboard/subscriber-search'
import { subscriberSourceLabel } from '@/lib/dashboard/subscriber-source'
import { signupPlaceLabel } from '@/lib/signup-places'
import { allAccounts } from '@/lib/server/dashboard-accounts'
import { allEmailTracking } from '@/lib/server/dashboard-email-tracking'
import { allSubscribers } from '@/lib/server/dashboard-subscribers'
import { trackingCsvRows, TRACKING_CSV_HEADER } from '@/lib/dashboard/email-tracking'

// @cdc tableau de bord — export CSV d'une liste entière (?liste=lettre|comptes). Identifiants
// revérifiés ici (le proxy peut sauter, voir guard.ts), réponse jamais mise en cache.

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const NO_STORE = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' }

async function letterCsv(): Promise<string | null> {
  const res = await allSubscribers()
  if (!res.ok) return null
  const rows: CsvValue[][] = res.rows.map((s) => [s.email, csvDate(s.createdAt), subscriberSourceLabel(s.source), s.source, s.status === 'actif' ? 'actif' : 'désinscrit'])
  return toCsv(['email', 'inscription', 'source', 'source_brute', 'statut'], rows)
}

async function accountsCsv(): Promise<string | null> {
  const res = await allAccounts()
  if (!res.ok) return null
  const rows: CsvValue[][] = res.rows.map((a) => [
    a.email,
    csvDate(a.createdAt),
    a.verified,
    a.place ? signupPlaceLabel(a.place) : 'non attribué',
    a.premium,
    a.dogs,
  ])
  return toCsv(['email', 'creation', 'adresse_confirmee', 'emplacement', 'premium', 'chiens'], rows)
}

async function trackingCsv(): Promise<string | null> {
  const res = await allEmailTracking()
  return res.ok ? toCsv(TRACKING_CSV_HEADER, trackingCsvRows(res.rows)) : null
}

export async function GET(request: NextRequest) {
  if (!(await dashboardAllowed())) return new NextResponse(null, { status: 401, headers: NO_STORE })
  const list = parseList(request.nextUrl.searchParams.get('liste') ?? undefined)
  const csv = list === 'comptes' ? await accountsCsv() : list === 'envois' ? await trackingCsv() : await letterCsv()
  if (csv === null) {
    return new NextResponse('Lecture impossible pour le moment, réessaie dans une minute.', {
      status: 503,
      headers: { ...NO_STORE, 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }
  return new NextResponse(csv, {
    headers: {
      ...NO_STORE,
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${csvFileName(list)}"`,
    },
  })
}
