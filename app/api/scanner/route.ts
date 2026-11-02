import { NextResponse, type NextRequest } from 'next/server'
import { getSessionUser } from '@/lib/server/auth'
import { getDb } from '@/lib/server/drizzle'
import { overLimit } from '@/lib/server/rate-window'
import { findByEan, recordScan, releaseQuota, reserveQuota, saveAnalysis, usedThisMonth } from '@/lib/server/scanner'
import { FREE_MONTHLY_SCANS, MAX_IMAGE_BYTES, MAX_IMAGES, RATE_LIMITS } from '@/lib/scanner/config'
import { extractLabel } from '@/lib/scanner/extract'
import { prepareImage } from '@/lib/scanner/images'
import { ERROR_MESSAGES, toScanAnalysis, type ScanResponse } from '@/lib/scanner/result'
import { cleanEan } from '@/lib/scanner/slug'
import { ScannerError, type ScannerErrorCode } from '@/lib/scanner/types'

// @cdc lot 6 — analyse d'une étiquette (compte obligatoire). Ordre : session, débit, cache par
// EAN (gratuit, sans appel à l'IA), contrôle des photos, réservation du quota, lecture par l'IA,
// note par notre algorithme, enregistrement. Les photos restent en mémoire le temps de la requête.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const NO_STORE = { 'Cache-Control': 'private, no-store' }
const STATUS: Record<ScannerErrorCode, number> = {
  unauthorized: 401,
  rate_limited: 429,
  quota_reached: 429,
  bad_request: 400,
  too_large: 413,
  bad_type: 415,
  not_a_label: 422,
  timeout: 504,
  provider_error: 502,
  unavailable: 503,
}

function fail(error: ScannerErrorCode, quota?: { used: number; limit: number }) {
  const body: ScanResponse = { ok: false, error, message: ERROR_MESSAGES[error], quota }
  return NextResponse.json(body, { status: STATUS[error], headers: NO_STORE })
}

async function quota(userId: string) {
  return { used: await usedThisMonth(userId), limit: FREE_MONTHLY_SCANS }
}

export async function GET(): Promise<NextResponse> {
  const user = await getSessionUser()
  if (!user) return fail('unauthorized')
  return NextResponse.json({ quota: await quota(user.id) }, { headers: NO_STORE })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!getDb()) return fail('unavailable')
  const user = await getSessionUser()
  if (!user) return fail('unauthorized')
  if (overLimit(`scan:${user.id}`, RATE_LIMITS)) return fail('rate_limited')
  const length = Number(request.headers.get('content-length') ?? 0)
  if (length > MAX_IMAGES * MAX_IMAGE_BYTES + 512 * 1024) return fail('too_large')

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return fail('bad_request')
  }
  const files = form.getAll('photo').filter((f): f is File => f instanceof File)
  if (files.length === 0 || files.length > MAX_IMAGES) return fail('bad_request')
  const typedEan = cleanEan(form.get('ean'))

  try {
    if (typedEan) {
      const cached = await findByEan(typedEan)
      if (cached) {
        await recordScan(user.id, cached.id, true)
        return NextResponse.json({ ok: true, analysis: toScanAnalysis(cached), fromCache: true, quota: await quota(user.id) } satisfies ScanResponse, { headers: NO_STORE })
      }
    }
    const images = await Promise.all(files.map(prepareImage))
    if (!(await reserveQuota(user.id, FREE_MONTHLY_SCANS))) return fail('quota_reached', await quota(user.id))

    let result
    try {
      result = await extractLabel(images)
      if (!result.label.estUneEtiquette) throw new ScannerError('not_a_label', 'pas une étiquette')
    } catch (err) {
      await releaseQuota(user.id)
      throw err
    }
    const ean = cleanEan(result.label.ean) ?? typedEan
    const existing = ean ? await findByEan(ean) : null
    if (existing) await releaseQuota(user.id) // déjà en cache : l'analyse ne compte pas
    const row = existing ?? (await saveAnalysis(result.label, ean, result.model))
    await recordScan(user.id, row.id, Boolean(existing))
    return NextResponse.json({ ok: true, analysis: toScanAnalysis(row), fromCache: Boolean(existing), quota: await quota(user.id) } satisfies ScanResponse, { headers: NO_STORE })
  } catch (err) {
    if (err instanceof ScannerError) {
      if (!['too_large', 'bad_type', 'bad_request'].includes(err.code)) console.error(`[scanner] ${err.code} ${err.message}`)
      return fail(err.code)
    }
    console.error('[scanner] erreur', err instanceof Error ? err.message : err)
    return fail('provider_error')
  }
}
