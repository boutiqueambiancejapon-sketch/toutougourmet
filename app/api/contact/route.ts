import { after, NextRequest, NextResponse } from 'next/server'
import { isBrevoConfigured, subscribe } from '@/lib/server/brevo'
import { isDisposableEmail } from '@/lib/server/disposable-email'
import { getPool } from '@/lib/server/db'
import { sendWelcomeOnce } from '@/lib/server/newsletter'
import { sendGuideOnce } from '@/lib/server/guide-email'
import { GUIDE_SOURCE } from '@/lib/guide/config'
import { contactRateLimited, parseContactMessage, saveContactMessage } from '@/lib/server/contact'
import { clientIp, overLimit, retryAfterSeconds } from '@/lib/server/rate-window'

// @cdc contact — deux usages : inscription (e-mail seul, sans champ « message ») envoyée à Brevo,
// et message de contact rangé dans analytics.contact_messages (lu dans le tableau de bord).
// Après une inscription réussie : e-mail de bienvenue envoyé après la réponse (after), une fois
// par adresse. En double opt-in, Brevo envoie déjà sa confirmation : pas de bienvenue à une adresse
// non confirmée.
// Source « guide » : l'e-mail du guide (lien du PDF) part à la place de la bienvenue, même si la
// bienvenue est coupée et même en double opt-in (le lecteur a demandé ce fichier), une fois par
// adresse (lib/server/guide-email.ts).
// Champ piège « website » : rempli par un robot, la requête reçoit 200 sans rien enregistrer.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const unavailable = () => NextResponse.json({ error: 'Unavailable' }, { status: 503 })

// Inscription : au plus 5 par adresse réseau en 10 minutes et 20 par jour (compteur en mémoire).
const SUBSCRIBE_LIMITS = [
  { windowMs: 10 * 60_000, max: 5 },
  { windowMs: 24 * 60 * 60_000, max: 20 },
] as const
const tooMany = (retryAfter: string) => NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': retryAfter } })

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    const parsed: unknown = await req.json()
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not an object')
    body = parsed as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }

  if (typeof body.website === 'string' && body.website.trim() !== '') return NextResponse.json({ ok: true })

  const ip = clientIp(req.headers)

  if (typeof body.email === 'string' && !body.message) {
    if (!isBrevoConfigured()) return unavailable()
    if (overLimit(`subscribe:${ip}`, SUBSCRIBE_LIMITS)) return tooMany(retryAfterSeconds(SUBSCRIBE_LIMITS))
    if (body.email.length > 254) return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    if (isDisposableEmail(body.email)) return NextResponse.json({ error: 'Disposable email' }, { status: 400 })
    const source = (typeof body.source === 'string' ? body.source : typeof body._subject === 'string' ? body._subject : 'site').slice(0, 60)
    const result = await subscribe(body.email, source)
    if (result === 'ok') {
      const email = body.email
      if (source === GUIDE_SOURCE) {
        after(() => sendGuideOnce(email, ip).then(() => undefined))
        return NextResponse.json({ ok: true })
      }
      // Bienvenue automatique : seulement quand le propriétaire l'a activée (WELCOME_EMAIL_ENABLED=1).
      if (process.env.WELCOME_EMAIL_ENABLED === '1' && !process.env.BREVO_DOI_TEMPLATE_ID) after(() => sendWelcomeOnce(email).then(() => undefined))
      return NextResponse.json({ ok: true })
    }
    if (result === 'invalid') return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    return NextResponse.json({ error: 'Subscribe failed' }, { status: 502 })
  }

  const pool = getPool()
  if (!pool) return unavailable()

  if (contactRateLimited(ip)) return tooMany('600')

  const parsed = parseContactMessage(body)
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

  try {
    await saveContactMessage(pool, parsed.value)
  } catch (err) {
    console.error('[contact] insert failed', err instanceof Error ? err.message : err)
    return unavailable()
  }
  return NextResponse.json({ ok: true })
}
