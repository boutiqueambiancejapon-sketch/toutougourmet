import { LOGIN_PATH } from '@/lib/dashboard/login/policy'
import { logEvent } from './attempts'
import { NO_SESSION, ok, text, type FlowContext, type FlowResult } from './flow-types'
import { deleteAllSessions, deleteSession } from './sessions'

// @cdc tableau de bord — fin de session : celle-ci, une autre, ou toutes.

export async function logout(ctx: FlowContext): Promise<FlowResult> {
  if (ctx.session) {
    await deleteSession(ctx.session.id)
    await logEvent('logout', 'success', ctx.who)
  }
  return { ...ok({ next: LOGIN_PATH }), clearSession: true }
}

export async function logoutEverywhere(ctx: FlowContext): Promise<FlowResult> {
  if (ctx.session?.stage !== 'full') return NO_SESSION()
  await deleteAllSessions()
  await logEvent('logout-all', 'success', ctx.who)
  return { ...ok({ next: LOGIN_PATH }), clearSession: true }
}

export async function closeSession(ctx: FlowContext): Promise<FlowResult> {
  if (ctx.session?.stage !== 'full') return NO_SESSION()
  const id = text(ctx.input, 'id', 64)
  if (!/^[0-9a-f-]{36}$/.test(id)) return ok()
  await deleteSession(id)
  await logEvent('session-closed', 'success', ctx.who)
  return id === ctx.session.id ? { ...ok({ next: LOGIN_PATH }), clearSession: true } : ok()
}
