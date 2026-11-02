import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'

// @cdc lot 6 — session de scan : quand une partie de l'étiquette manque, la première lecture est
// décomptée et le serveur remet un jeton signé. Les envois suivants de la même session (photo
// manquante ajoutée) ne sont pas décomptés. Jeton lié au compte, valable 30 minutes, 3 envois au
// plus. Compteur d'usage en mémoire : un seul processus Node sur le VPS (comme rate-window).

const TTL_MS = 30 * 60_000
const MAX_FOLLOW_UPS = 3
const uses = new Map<string, number>()

function secret(): string {
  const s = process.env.BETTER_AUTH_SECRET
  if (!s) throw new Error('BETTER_AUTH_SECRET manquant')
  return s
}

const sign = (payload: string) => createHmac('sha256', secret()).update(`scan-session:${payload}`).digest('base64url')

export function createScanSession(userId: string, now = Date.now()): string {
  const payload = `${randomUUID()}.${now + TTL_MS}`
  return `${payload}.${sign(`${userId}.${payload}`)}`
}

/** true si le jeton est valide pour ce compte ; consomme un envoi. */
export function consumeScanSession(token: unknown, userId: string, now = Date.now()): boolean {
  if (typeof token !== 'string' || token.length > 200) return false
  const [id, exp, mac] = token.split('.')
  if (!id || !exp || !mac || Number(exp) < now) return false
  const expected = Buffer.from(sign(`${userId}.${id}.${exp}`))
  const given = Buffer.from(mac)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return false
  const n = uses.get(id) ?? 0
  if (n >= MAX_FOLLOW_UPS) return false
  uses.set(id, n + 1)
  if (uses.size > 5000) for (const key of [...uses.keys()].slice(0, 1000)) uses.delete(key)
  return true
}
