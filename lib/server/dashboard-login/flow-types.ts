import type { Requester } from './attempts'
import type { DashboardSession } from './sessions'

// @cdc tableau de bord — une action de connexion reçoit la requête déjà lue et rend un résultat
// sans HTTP : testable directement sur une base jetable.

export interface FlowContext {
  who: Requester
  session: DashboardSession | null
  deviceToken: string | undefined
  input: Record<string, unknown>
}

export interface FlowResult {
  status: number
  body: Record<string, unknown>
  setSession?: string
  clearSession?: boolean
  setDevice?: string
}

export const ok = (body: Record<string, unknown> = {}): FlowResult => ({ status: 200, body: { ok: true, ...body } })
export const refused = (error: string, status = 400): FlowResult => ({ status, body: { ok: false, error } })

/** Même réponse pour un identifiant, un mot de passe, un code ou une clé refusés. */
export const NEUTRAL = (): FlowResult => refused('invalid', 401)
export const BLOCKED = (): FlowResult => refused('blocked', 429)
export const NO_SESSION = (): FlowResult => refused('session', 401)

export function text(input: Record<string, unknown>, key: string, max = 512): string {
  const value = input[key]
  return typeof value === 'string' && value.length <= max ? value : ''
}
