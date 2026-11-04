import type { AuthenticationResponseJSON } from '@simplewebauthn/server'
import { dashboardCredentials, safeEqual } from '@/lib/dashboard/auth'
import { ENROLL_PATH, LOGIN_PATH, MAX_SESSION_FACTOR_FAILURES, stageHref, VERIFY_PATH, type AttemptKind } from '@/lib/dashboard/login/policy'
import { alertFactorChange, alertIfFailureSeries, alertNewDevice } from './alerts'
import { attemptSucceeded, beginAttempt } from './attempts'
import { consumeBackupCode, hasFactor, knownDevice, rememberDevice } from './factors'
import { BLOCKED, NEUTRAL, NO_SESSION, ok, text, type FlowContext, type FlowResult } from './flow-types'
import { countFactorFailure, createSession, deleteSession, elevateSession, saveChallenge, saveDirectChallenge, takeChallenge, takeDirectChallenge } from './sessions'
import { verifyTotp } from './totp'
import { authenticationOptions, challengeOf, checkAuthentication, directAuthenticationOptions } from './webauthn'

// @cdc tableau de bord — mot de passe, puis second facteur. Un mot de passe juste n'ouvre jamais le
// tableau de bord : il crée une session d'attente qui ne donne accès qu'à l'écran suivant.

export async function passwordStep(ctx: FlowContext): Promise<FlowResult> {
  const attempt = await beginAttempt('password', ctx.who, await knownDevice(ctx.deviceToken))
  if (!attempt) return BLOCKED()
  const expected = dashboardCredentials()
  const [okUser, okPassword] = await Promise.all([
    // Le clavier d'un téléphone ajoute parfois une espace à la fin : elle ne compte pas.
    safeEqual(text(ctx.input, 'username').trim(), expected?.user ?? ''),
    safeEqual(text(ctx.input, 'password').trim(), expected?.password ?? ''),
  ])
  if (!expected || !okUser || !okPassword) {
    await alertIfFailureSeries()
    return NEUTRAL()
  }
  await attemptSucceeded(attempt)
  const stage = (await hasFactor()) ? 'second_factor' : 'enroll'
  const token = await createSession(stage, ctx.who.label)
  return { ...ok({ next: stage === 'enroll' ? ENROLL_PATH : VERIFY_PATH }), setSession: token }
}

/** Dernier geste de toute connexion : cookie renouvelé, appareil noté, alerte si inconnu. */
export async function openFullSession(ctx: FlowContext, sessionId: string, extra: Record<string, unknown> = {}): Promise<FlowResult> {
  const token = await elevateSession(sessionId)
  const freshDevice = await rememberDevice(ctx.deviceToken, ctx.who.label)
  if (freshDevice) alertNewDevice(ctx.who.label)
  return { ...ok({ next: stageHref('full', ctx.input.next), ...extra }), setSession: token, ...(freshDevice ? { setDevice: freshDevice } : {}) }
}

async function factorStep(ctx: FlowContext, kind: AttemptKind, check: () => Promise<boolean>): Promise<FlowResult> {
  const session = ctx.session
  if (session?.stage !== 'second_factor') return NO_SESSION()
  const attempt = await beginAttempt(kind, ctx.who, await knownDevice(ctx.deviceToken))
  if (!attempt) return BLOCKED()
  if (await check()) {
    await attemptSucceeded(attempt)
    return openFullSession(ctx, session.id)
  }
  await alertIfFailureSeries()
  if ((await countFactorFailure(session.id)) < MAX_SESSION_FACTOR_FAILURES) return NEUTRAL()
  await deleteSession(session.id)
  return { status: 401, body: { ok: false, error: 'invalid', next: LOGIN_PATH }, clearSession: true }
}

export const totpStep = (ctx: FlowContext): Promise<FlowResult> => factorStep(ctx, 'totp', () => verifyTotp(text(ctx.input, 'code', 16).trim()))

export const backupStep = (ctx: FlowContext): Promise<FlowResult> =>
  factorStep(ctx, 'backup', async () => {
    const used = await consumeBackupCode(text(ctx.input, 'code', 32))
    if (used) alertFactorChange('un code de secours vient de servir')
    return used
  })

export async function passkeyOptionsStep(ctx: FlowContext): Promise<FlowResult> {
  if (ctx.session?.stage !== 'second_factor') return NO_SESSION()
  const options = await authenticationOptions()
  await saveChallenge(ctx.session.id, options.challenge)
  return ok({ options })
}

export const passkeyVerifyStep = (ctx: FlowContext): Promise<FlowResult> =>
  factorStep(ctx, 'passkey', async () => {
    const challenge = ctx.session ? await takeChallenge(ctx.session.id) : null
    const response = ctx.input.response
    if (!challenge || typeof response !== 'object' || response === null) return false
    return checkAuthentication(response as AuthenticationResponseJSON, challenge)
  })

// @cdc tableau de bord — connexion directe par Face ID : la clé vaut deux preuves, l'appareil et le
// visage (vérification de l'utilisateur exigée). Le code de secours et le TOTP, eux, restent derrière le mot de passe.
export async function directOptionsStep(): Promise<FlowResult> {
  const options = await directAuthenticationOptions()
  await saveDirectChallenge(options.challenge)
  return ok({ options })
}

export async function directVerifyStep(ctx: FlowContext): Promise<FlowResult> {
  const attempt = await beginAttempt('passkey', ctx.who, await knownDevice(ctx.deviceToken))
  if (!attempt) return BLOCKED()
  const response = ctx.input.response
  const parsed = typeof response === 'object' && response !== null && 'response' in response ? (response as AuthenticationResponseJSON) : null
  const challenge = parsed ? challengeOf(parsed) : null
  if (!parsed || !challenge || !(await takeDirectChallenge(challenge)) || !(await checkAuthentication(parsed, challenge))) {
    await alertIfFailureSeries()
    return NEUTRAL()
  }
  await attemptSucceeded(attempt)
  const now = new Date()
  const token = await createSession('full', ctx.who.label, now, now)
  const freshDevice = await rememberDevice(ctx.deviceToken, ctx.who.label)
  if (freshDevice) alertNewDevice(ctx.who.label)
  return { ...ok({ next: stageHref('full', ctx.input.next) }), setSession: token, ...(freshDevice ? { setDevice: freshDevice } : {}) }
}
