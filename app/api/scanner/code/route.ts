import { NextResponse, type NextRequest } from 'next/server'
import { getSessionUser } from '@/lib/server/auth'
import { getDb } from '@/lib/server/drizzle'
import { fetchOpffProduct } from '@/lib/server/opff'
import { overLimit } from '@/lib/server/rate-window'
import { findByEan, recordScan, saveAnalysis } from '@/lib/server/scanner'
import { opffToLabel } from '@/lib/scanner/opff'
import { ERROR_MESSAGES, toScanAnalysis, type Prefill, type ScanResponse } from '@/lib/scanner/result'
import { cleanEan } from '@/lib/scanner/slug'
import type { ScannerErrorCode } from '@/lib/scanner/types'

// @cdc lot 6 — résultat par code-barres, accessible sans compte, jamais décompté, sans IA :
// 1. EAN déjà connu dans food_analysis → résultat immédiat ;
// 2. sinon fiche Open Pet Food Facts : si ingrédients et constituants sont exploitables, NOTRE
//    barème la note et elle est enregistrée (source openpetfoodfacts) ;
// 3. sinon « not_found » avec marque et produit pour préremplir l'analyse par photos.
// Seul le code-barres est envoyé à Open Pet Food Facts. Limite de débit par adresse IP.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'private, no-store' }
const LIMITS = [
  { windowMs: 60_000, max: 12 },
  { windowMs: 24 * 60 * 60_000, max: 200 },
] as const
const STATUS: Partial<Record<ScannerErrorCode, number>> = { bad_request: 400, rate_limited: 429, not_found: 404, cat_food: 422, treat: 422, unavailable: 503 }

function fail(error: ScannerErrorCode, prefill?: Prefill) {
  const body: ScanResponse = { ok: false, error, message: ERROR_MESSAGES[error], prefill }
  return NextResponse.json(body, { status: STATUS[error] ?? 400, headers: NO_STORE })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!getDb()) return fail('unavailable')
  const body = (await request.json().catch(() => null)) as { ean?: unknown } | null
  const ean = cleanEan(body?.ean)
  if (!ean) return fail('bad_request')
  if (overLimit(`code:${request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local'}`, LIMITS)) return fail('rate_limited')
  const user = await getSessionUser().catch(() => null)
  const reply = (analysis: Parameters<typeof toScanAnalysis>[0], origin: 'cache' | 'openpetfoodfacts') =>
    NextResponse.json({ ok: true, analysis: toScanAnalysis(analysis), fromCache: origin === 'cache', origin } satisfies ScanResponse, { headers: NO_STORE })

  try {
    const cached = await findByEan(ean)
    if (cached) {
      await recordScan(user?.id ?? null, cached.id, true)
      return reply(cached, 'cache')
    }
    const lookup = await fetchOpffProduct(ean)
    if (lookup.status === 'error') console.warn(`[scanner] open pet food facts indisponible (${lookup.reason})`)
    if (lookup.status !== 'found') return fail('not_found', { ean, brand: null, product: null })
    const verdict = opffToLabel(lookup.product, ean)
    if (verdict.kind === 'incomplete') {
      if (verdict.type === 'aliment-chat') return fail('cat_food')
      if (verdict.type === 'friandise') return fail('treat')
      return fail('not_found', { ean, brand: verdict.brand, product: verdict.product })
    }
    const row = await saveAnalysis(verdict.label, ean, 'openpetfoodfacts', 'openpetfoodfacts')
    await recordScan(user?.id ?? null, row.id, false)
    return reply(row, row.source === 'openpetfoodfacts' ? 'openpetfoodfacts' : 'cache')
  } catch (err) {
    console.error('[scanner] code-barres', err instanceof Error ? err.message : err)
    return fail('unavailable')
  }
}
