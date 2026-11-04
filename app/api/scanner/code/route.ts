import { NextResponse, type NextRequest } from 'next/server'
import { getSessionUser } from '@/lib/server/auth'
import { getDb } from '@/lib/server/drizzle'
import { fetchOpffProduct } from '@/lib/server/opff'
import { clientIp, overLimit } from '@/lib/server/rate-window'
import { findByEan, recordScan, saveAnalysis } from '@/lib/server/scanner'
import { recordScannerEvent } from '@/lib/server/scanner-events'
import type { AnalysisSource } from '@/db/schema'
import { opffToLabel } from '@/lib/scanner/opff'
import { ERROR_MESSAGES, toScanAnalysis, type Prefill, type ScanResponse } from '@/lib/scanner/result'
import type { ScannerResult } from '@/lib/scanner/scanner-events'
import { cleanEan } from '@/lib/scanner/slug'
import type { ScannerErrorCode } from '@/lib/scanner/types'

// @cdc lot 6 — résultat par code-barres, accessible sans compte, jamais décompté, sans IA :
// 1. EAN déjà connu dans food_analysis (dont les fiches pré-notées par l'import) → immédiat ;
// 2. sinon fiche Open Pet Food Facts (copie locale hebdomadaire, puis API), à défaut Open Food
//    Facts (lib/server/opff.ts) : si la fiche est exploitable, NOTRE barème la note (friandise :
//    barème friandise, la composition suffit) et elle est enregistrée (source openpetfoodfacts ou openfoodfacts) ;
// 3. sinon « not_found » avec marque et produit pour préremplir l'analyse par photos.
// Seul le code-barres est envoyé à ces bases. Limite de débit par adresse IP.
// Chaque issue après le contrôle de débit laisse une ligne dans analytics.scanner_events, sans
// retarder la réponse (lib/server/scanner-events.ts). Avant ce contrôle, rien n'est écrit : la route
// est ouverte sans compte, un robot ne doit pas pouvoir remplir la table.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'private, no-store' }
const LIMITS = [
  { windowMs: 60_000, max: 12 },
  { windowMs: 24 * 60 * 60_000, max: 200 },
] as const
const STATUS: Partial<Record<ScannerErrorCode, number>> = { bad_request: 400, rate_limited: 429, not_found: 404, cat_food: 422, unavailable: 503 }

function fail(error: ScannerErrorCode, prefill?: Prefill) {
  const body: ScanResponse = { ok: false, error, message: ERROR_MESSAGES[error], prefill }
  return NextResponse.json(body, { status: STATUS[error] ?? 400, headers: NO_STORE })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!getDb()) return fail('unavailable')
  const body = (await request.json().catch(() => null)) as { ean?: unknown } | null
  const ean = cleanEan(body?.ean)
  if (!ean) return fail('bad_request')
  if (overLimit(`code:${clientIp(request.headers)}`, LIMITS)) return fail('rate_limited')
  const user = await getSessionUser().catch(() => null)
  const log = (result: ScannerResult, foodAnalysisId: string | null = null) => recordScannerEvent({ type: 'code', result, userId: user?.id ?? null, foodAnalysisId })
  const reply = (analysis: Parameters<typeof toScanAnalysis>[0], origin: 'cache' | AnalysisSource) =>
    NextResponse.json({ ok: true, analysis: toScanAnalysis(analysis), fromCache: origin === 'cache', origin } satisfies ScanResponse, { headers: NO_STORE })

  try {
    const cached = await findByEan(ean)
    if (cached) {
      await recordScan(user?.id ?? null, cached.id, true)
      log('found', cached.id)
      return reply(cached, 'cache')
    }
    const lookup = await fetchOpffProduct(ean)
    if (lookup.status === 'error') console.warn(`[scanner] open pet food facts indisponible (${lookup.reason})`)
    if (lookup.status !== 'found') {
      // Base injoignable : le visiteur lit « introuvable », le tableau de bord voit la panne.
      log(lookup.status === 'error' ? 'lookup_error' : 'not_found')
      return fail('not_found', { ean, brand: null, product: null })
    }
    const verdict = opffToLabel(lookup.product, ean)
    if (verdict.kind === 'incomplete') {
      log(verdict.type === 'aliment-chat' ? 'cat_food' : 'not_scorable')
      if (verdict.type === 'aliment-chat') return fail('cat_food')
      return fail('not_found', { ean, brand: verdict.brand, product: verdict.product })
    }
    const source: AnalysisSource = lookup.origin === 'openfoodfacts' ? 'openfoodfacts' : 'openpetfoodfacts'
    const row = await saveAnalysis(verdict.label, ean, source, source)
    await recordScan(user?.id ?? null, row.id, false)
    log('found', row.id)
    return reply(row, row.source === source ? source : 'cache')
  } catch (err) {
    console.error('[scanner] code-barres', err instanceof Error ? err.message : err)
    log('unavailable')
    return fail('unavailable')
  }
}
