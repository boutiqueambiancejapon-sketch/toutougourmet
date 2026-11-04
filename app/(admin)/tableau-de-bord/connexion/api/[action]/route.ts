import { cookies, headers } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { requestFromSameHost } from '@/lib/dashboard/auth'
import { ABSOLUTE_MS, DEVICE_COOKIE, DEVICE_COOKIE_DAYS, deviceLabel, SESSION_COOKIE } from '@/lib/dashboard/login/policy'
import { deletePasskey, deleteTotp, enrollPasskeyOptions, enrollPasskeyVerify, enrollTotpConfirm, enrollTotpStart, regenerateCodes } from '@/lib/server/dashboard-login/flow-factors'
import { backupStep, directOptionsStep, directVerifyStep, passkeyOptionsStep, passkeyVerifyStep, passwordStep, totpStep } from '@/lib/server/dashboard-login/flow-login'
import { closeSession, logout, logoutEverywhere } from '@/lib/server/dashboard-login/flow-sessions'
import type { FlowContext, FlowResult } from '@/lib/server/dashboard-login/flow-types'
import { dashboardAuthMode } from '@/lib/server/dashboard-login/mode'
import { ipHash } from '@/lib/server/dashboard-login/secrets'
import { readSession } from '@/lib/server/dashboard-login/sessions'
import { clientIp } from '@/lib/server/rate-window'

// @cdc tableau de bord — toutes les actions de connexion et de sécurité passent ici. Chacune vérifie
// elle-même l'état de la session (flow-*.ts) ; en plus, POST exige une origine du même hôte.

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const NO_STORE = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' }
const MAX_BODY = 16_384

const ACTIONS: Record<string, (ctx: FlowContext) => Promise<FlowResult>> = {
  'mot-de-passe': passwordStep,
  code: totpStep,
  secours: backupStep,
  'cle-directe-options': directOptionsStep,
  'cle-directe': directVerifyStep,
  'cle-options': passkeyOptionsStep,
  'cle-verifier': passkeyVerifyStep,
  'enrol-cle-options': enrollPasskeyOptions,
  'enrol-cle-verifier': enrollPasskeyVerify,
  'enrol-code-debut': enrollTotpStart,
  'enrol-code-confirmer': enrollTotpConfirm,
  'codes-renouveler': regenerateCodes,
  'cle-retirer': deletePasskey,
  'code-retirer': deleteTotp,
  deconnexion: logout,
  'deconnexion-partout': logoutEverywhere,
  'session-fermer': closeSession,
}

const baseCookie = { httpOnly: true, secure: true, sameSite: 'strict' as const, path: '/' }

function respond(result: FlowResult): NextResponse {
  const response = NextResponse.json(result.body, { status: result.status, headers: NO_STORE })
  if (result.setSession) response.cookies.set(SESSION_COOKIE, result.setSession, { ...baseCookie, maxAge: ABSOLUTE_MS / 1000 })
  if (result.clearSession) response.cookies.set(SESSION_COOKIE, '', { ...baseCookie, maxAge: 0 })
  if (result.setDevice) response.cookies.set(DEVICE_COOKIE, result.setDevice, { ...baseCookie, maxAge: DEVICE_COOKIE_DAYS * 86_400 })
  return response
}

const fail = (error: string, status: number) => NextResponse.json({ ok: false, error }, { status, headers: NO_STORE })

function parseInput(raw: string): Record<string, unknown> | null {
  if (raw.length > MAX_BODY) return null
  try {
    const value: unknown = JSON.parse(raw || '{}')
    return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : null
  } catch {
    return null
  }
}

/** Sonde lue par la page de connexion : SameSite=Strict retire le cookie d'un lien venu d'ailleurs. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  if ((await params).action !== 'etat' || (await dashboardAuthMode()) !== 'login') return new NextResponse(null, { status: 404, headers: NO_STORE })
  try {
    const session = await readSession((await cookies()).get(SESSION_COOKIE)?.value)
    return NextResponse.json({ stage: session?.stage ?? null }, { headers: NO_STORE })
  } catch {
    return fail('unavailable', 503)
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params
  const handler = Object.hasOwn(ACTIONS, action) ? ACTIONS[action] : null
  if (!handler || (await dashboardAuthMode()) !== 'login') return new NextResponse(null, { status: 404, headers: NO_STORE })
  const h = await headers()
  if (!requestFromSameHost(h)) return fail('origin', 403)
  const input = parseInput(await request.text())
  if (!input) return fail('input', 400)
  try {
    const jar = await cookies()
    const session = await readSession(jar.get(SESSION_COOKIE)?.value)
    const who = { ipHash: ipHash(clientIp(h)), label: deviceLabel(h.get('user-agent')) }
    return respond(await handler({ who, session, deviceToken: jar.get(DEVICE_COOKIE)?.value, input }))
  } catch (err) {
    console.error('[dashboard-login]', err instanceof Error ? err.message : err)
    return fail('unavailable', 503)
  }
}
