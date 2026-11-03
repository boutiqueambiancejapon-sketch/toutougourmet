import { NextResponse, type NextRequest } from 'next/server'
import { isBrevoConfigured, isValidEmail, subscribe } from '@/lib/server/brevo'
import { isDisposableEmail } from '@/lib/server/disposable-email'
import { clientIp, overLimit, retryAfterSeconds } from '@/lib/server/rate-window'
import { sendToolResultEmail } from '@/lib/server/tool-result-email'
import { describeToolResult, parseToolEmailInput } from '@/lib/tool-email'

// @cdc outils — « Reçois ton résultat par e-mail » sous la ration, le poids, l'âge et le bilan.
// Reçoit l'adresse et les réglages de l'outil, recalcule le résultat (lib/tool-email.ts), inscrit
// l'adresse à la lettre (source = l'outil, mention affichée sous le champ), puis envoie l'e-mail
// transactionnel tout de suite. Adresses jetables refusées ; champ piège « website ».
// Limites : 3 par adresse réseau en 10 minutes et 10 par jour, 60 par heure et 300 par jour pour
// tout le site (borne la facture Brevo si un robot insiste). Compteurs en mémoire seulement.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const PER_IP = [
  { windowMs: 10 * 60_000, max: 3 },
  { windowMs: 24 * 60 * 60_000, max: 10 },
] as const
const SITE_WIDE = [
  { windowMs: 60 * 60_000, max: 60 },
  { windowMs: 24 * 60 * 60_000, max: 300 },
] as const

const SOURCE = { ration: 'outil-ration', poids: 'outil-poids', age: 'outil-age', bilan: 'outil-bilan' } as const

const fail = (error: string, status: number, headers?: Record<string, string>) => NextResponse.json({ error }, { status, headers })

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    const parsed: unknown = await req.json()
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not an object')
    body = parsed as Record<string, unknown>
  } catch {
    return fail('Bad request', 400)
  }
  if (typeof body.website === 'string' && body.website.trim() !== '') return NextResponse.json({ ok: true })

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!isValidEmail(email)) return fail('Invalid email', 400)
  if (isDisposableEmail(email)) return fail('Disposable email', 400)
  const input = parseToolEmailInput(body.input)
  if (!input) return fail('Invalid input', 400)
  if (!isBrevoConfigured()) return fail('Unavailable', 503)

  const ip = clientIp(req.headers)
  if (overLimit(`tool-mail:${ip}`, PER_IP)) return fail('Too many requests', 429, { 'Retry-After': retryAfterSeconds(PER_IP) })
  if (overLimit('tool-mail:site', SITE_WIDE)) return fail('Too many requests', 429, { 'Retry-After': retryAfterSeconds(SITE_WIDE) })

  const subscribed = await subscribe(email, SOURCE[input.tool])
  if (subscribed === 'invalid') return fail('Invalid email', 400)
  try {
    await sendToolResultEmail(email, describeToolResult(input))
  } catch (err) {
    console.error('[outils/email] e-mail non envoyé', err instanceof Error ? err.message : err)
    return fail('Send failed', 502)
  }
  return NextResponse.json({ ok: true, subscribed: subscribed === 'ok' })
}
