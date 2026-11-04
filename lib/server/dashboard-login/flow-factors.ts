import type { RegistrationResponseJSON } from '@simplewebauthn/server'
import { factorIsRecent } from '@/lib/dashboard/login/policy'
import { qrDataUri } from '@/lib/og/qr'
import { alertFactorChange } from './alerts'
import { logEvent } from './attempts'
import { factorsSummary, hasFactor, replaceBackupCodes } from './factors'
import { openFullSession } from './flow-login'
import { NEUTRAL, NO_SESSION, ok, refused, text, type FlowContext, type FlowResult } from './flow-types'
import { deleteSession, saveChallenge, takeChallenge } from './sessions'
import { confirmTotp, removeTotp, startTotpEnrollment } from './totp'
import { registrationOptions, removePasskey, saveRegistration } from './webauthn'

// @cdc tableau de bord — ajouter ou retirer un facteur. Écran d'enrôlement : session limitée, tant
// qu'aucun facteur n'existe. Écran Sécurité : session complète, second facteur passé il y a moins
// de 15 minutes.

const REAUTH = (): FlowResult => refused('reauth', 403)

/** null si la session a le droit de changer les facteurs, sinon la réponse de refus. */
async function changeDenied(ctx: FlowContext): Promise<FlowResult | null> {
  const session = ctx.session
  if (!session) return NO_SESSION()
  if (session.stage === 'full') return factorIsRecent(session.factorAt, new Date()) ? null : REAUTH()
  if (session.stage !== 'enroll') return NO_SESSION()
  if (!(await hasFactor())) return null
  // Un facteur est apparu entre-temps : cette session d'enrôlement ne vaut plus rien.
  await deleteSession(session.id)
  return { ...NO_SESSION(), clearSession: true }
}

/** Facteur ajouté. Enrôlement : codes de secours, puis session complète. Sécurité : codes s'il n'y en a plus. */
async function factorAdded(ctx: FlowContext, change: string): Promise<FlowResult> {
  await logEvent('enroll', 'success', ctx.who)
  alertFactorChange(change)
  const session = ctx.session
  if (session?.stage === 'enroll') return openFullSession(ctx, session.id, { codes: await replaceBackupCodes() })
  return (await factorsSummary()).backupCodes === 0 ? ok({ codes: await replaceBackupCodes() }) : ok()
}

export async function enrollPasskeyOptions(ctx: FlowContext): Promise<FlowResult> {
  const denied = await changeDenied(ctx)
  if (denied || !ctx.session) return denied ?? NO_SESSION()
  const options = await registrationOptions()
  await saveChallenge(ctx.session.id, options.challenge)
  return ok({ options })
}

export async function enrollPasskeyVerify(ctx: FlowContext): Promise<FlowResult> {
  const denied = await changeDenied(ctx)
  if (denied || !ctx.session) return denied ?? NO_SESSION()
  const challenge = await takeChallenge(ctx.session.id)
  const response = ctx.input.response
  if (!challenge || typeof response !== 'object' || response === null) return NEUTRAL()
  const saved = await saveRegistration(response as RegistrationResponseJSON, challenge, ctx.who.label)
  return saved ? factorAdded(ctx, `clé d'accès ajoutée (${ctx.who.label})`) : NEUTRAL()
}

export async function enrollTotpStart(ctx: FlowContext): Promise<FlowResult> {
  const denied = await changeDenied(ctx)
  if (denied) return denied
  const enrollment = await startTotpEnrollment()
  if (!enrollment) return refused('exists', 409)
  return ok({ uri: enrollment.uri, secret: enrollment.secret, qr: qrDataUri(enrollment.uri) })
}

export async function enrollTotpConfirm(ctx: FlowContext): Promise<FlowResult> {
  const denied = await changeDenied(ctx)
  if (denied) return denied
  return (await confirmTotp(text(ctx.input, 'code', 16).trim())) ? factorAdded(ctx, 'application de codes ajoutée') : NEUTRAL()
}

export async function regenerateCodes(ctx: FlowContext): Promise<FlowResult> {
  if (ctx.session?.stage !== 'full') return NO_SESSION()
  if (!factorIsRecent(ctx.session.factorAt, new Date())) return REAUTH()
  const codes = await replaceBackupCodes()
  await logEvent('codes', 'success', ctx.who)
  alertFactorChange('codes de secours renouvelés')
  return ok({ codes })
}

/** Toujours au moins un facteur restant : sinon, le mot de passe seul rouvrirait l'enrôlement. */
async function removeFactor(ctx: FlowContext, remove: () => Promise<unknown>, change: string): Promise<FlowResult> {
  if (ctx.session?.stage !== 'full') return NO_SESSION()
  if (!factorIsRecent(ctx.session.factorAt, new Date())) return REAUTH()
  const before = await factorsSummary()
  if (before.passkeys + (before.totp ? 1 : 0) < 2) return refused('last-factor', 409)
  if ((await remove()) === false) return ok()
  await logEvent('factor-removed', 'success', ctx.who)
  alertFactorChange(change)
  return ok()
}

export const deletePasskey = (ctx: FlowContext): Promise<FlowResult> => removeFactor(ctx, () => removePasskey(text(ctx.input, 'id', 1024)), "clé d'accès retirée")

export const deleteTotp = (ctx: FlowContext): Promise<FlowResult> => removeFactor(ctx, removeTotp, 'application de codes retirée')
