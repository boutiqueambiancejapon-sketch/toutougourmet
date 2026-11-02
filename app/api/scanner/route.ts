import { NextResponse, type NextRequest } from 'next/server'
import { getSessionUser } from '@/lib/server/auth'
import { getDb } from '@/lib/server/drizzle'
import { overLimit } from '@/lib/server/rate-window'
import { findByEan, recordScan, releaseQuota, reserveQuota, saveAnalysis, usedThisMonth } from '@/lib/server/scanner'
import { MAX_IMAGE_BYTES, MAX_IMAGES, RATE_LIMITS } from '@/lib/scanner/config'
import { scanLimitFor } from '@/lib/server/membership'
import { extractLabel } from '@/lib/scanner/extract'
import { prepareImage } from '@/lib/scanner/images'
import { ERROR_MESSAGES, INCOMPLETE_MESSAGE, QUOTA_FREE_MESSAGE, toScanAnalysis, type ScanQuota, type ScanResponse } from '@/lib/scanner/result'
import { classifyExtraction, nothingRead } from '@/lib/scanner/outcome'
import { createScanSession, consumeScanSession } from '@/lib/server/scan-session'
import { cleanEan } from '@/lib/scanner/slug'
import { ScannerError, type ScannerErrorCode } from '@/lib/scanner/types'

// @cdc lot 6 — analyse d'une étiquette par photos (compte obligatoire). Ordre : session, débit,
// cache par EAN (gratuit, sans appel à l'IA), contrôle des photos, réservation du quota (sauf
// envoi suivant d'une session de scan déjà décomptée), lecture par l'IA, tri de la lecture
// (pas une étiquette, floue, chat, friandise : rendu ; partie manquante : on la demande), note
// par notre algorithme, enregistrement. Les photos restent en mémoire le temps de la requête.

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
  blurry: 422,
  cat_food: 422,
  treat: 422,
  not_found: 404,
  timeout: 504,
  provider_error: 502,
  unavailable: 503,
}

function fail(error: ScannerErrorCode, quota?: ScanQuota) {
  // Quota gratuit atteint : on propose Premium (gratuit pendant le lancement, 10 analyses par mois).
  const message = error === 'quota_reached' && quota?.plan === 'free' ? QUOTA_FREE_MESSAGE : ERROR_MESSAGES[error]
  const body: ScanResponse = { ok: false, error, message, quota }
  return NextResponse.json(body, { status: STATUS[error], headers: NO_STORE })
}

// Quota du mois selon la formule du compte (5 en gratuit, 10 en Premium, lib/scanner/config.ts).
async function quota(userId: string): Promise<ScanQuota> {
  const [used, { plan, limit }] = await Promise.all([usedThisMonth(userId), scanLimitFor(userId)])
  return { used, limit, plan }
}

export async function GET(): Promise<NextResponse> {
  const user = await getSessionUser()
  if (!user) return fail('unauthorized')
  return NextResponse.json({ quota: await quota(user.id) }, { headers: NO_STORE })
}

function ok(body: ScanResponse) {
  return NextResponse.json(body, { headers: NO_STORE })
}

const hint = (v: FormDataEntryValue | null) => (typeof v === 'string' && v.trim() ? v.replace(/\s+/g, ' ').trim().slice(0, 120) : null)

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
  const sessionToken = form.get('session')

  try {
    if (typedEan && !sessionToken) {
      const cached = await findByEan(typedEan)
      if (cached) {
        await recordScan(user.id, cached.id, true)
        return ok({ ok: true, analysis: toScanAnalysis(cached), fromCache: true, origin: 'cache', quota: await quota(user.id) })
      }
    }
    const images = await Promise.all(files.map(prepareImage))
    // Envoi suivant d'une session déjà décomptée (photo manquante ajoutée) : gratuit.
    const paid = consumeScanSession(sessionToken, user.id)
    if (!paid && !(await reserveQuota(user.id, (await scanLimitFor(user.id)).limit))) return fail('quota_reached', await quota(user.id))
    const refund = () => (paid ? Promise.resolve() : releaseQuota(user.id))

    let result
    try {
      result = await extractLabel(images)
    } catch (err) {
      await refund()
      throw err
    }
    const outcome = classifyExtraction(result.label)
    const l = result.label
    console.info(
      `[scanner] lecture type=${l.typeImage} espece=${l.espece} lisibilite=${l.lisibilite} ingredients=${l.ingredients.length} constituants=${Object.values(l.constituants).filter((v) => v !== null).length} douteux=${l.champsDouteux.join('+') || '-'} → ${outcome.kind === 'reject' ? outcome.code : outcome.kind}`,
    )
    if (outcome.kind === 'reject') {
      await refund()
      return fail(outcome.code, await quota(user.id))
    }
    if (outcome.kind === 'incomplete') {
      const free = nothingRead(outcome) && !paid
      if (free) await releaseQuota(user.id)
      const session = paid && typeof sessionToken === 'string' ? sessionToken : free ? '' : createScanSession(user.id)
      return ok({ ok: false, error: 'incomplete', message: INCOMPLETE_MESSAGE, missing: outcome.missing, read: outcome.read, session, quota: await quota(user.id) })
    }
    const label = { ...result.label, marque: result.label.marque ?? hint(form.get('brand')), produit: result.label.produit ?? hint(form.get('product')) }
    const ean = cleanEan(label.ean) ?? typedEan
    const existing = ean ? await findByEan(ean) : null
    if (existing) await refund() // déjà en cache : l'analyse ne compte pas
    const row = existing ?? (await saveAnalysis(label, ean, result.model, 'photo'))
    await recordScan(user.id, row.id, Boolean(existing))
    return ok({ ok: true, analysis: toScanAnalysis(row), fromCache: Boolean(existing), origin: existing ? 'cache' : 'photo', quota: await quota(user.id) })
  } catch (err) {
    if (err instanceof ScannerError) {
      if (!['too_large', 'bad_type', 'bad_request'].includes(err.code)) console.error(`[scanner] ${err.code} ${err.message}`)
      return fail(err.code)
    }
    console.error('[scanner] erreur', err instanceof Error ? err.message : err)
    return fail('provider_error')
  }
}
