import { after, NextRequest, NextResponse } from 'next/server'
import { isBrevoConfigured, subscribe } from '@/lib/server/brevo'
import { getPool } from '@/lib/server/db'
import { sendWelcomeOnce } from '@/lib/server/newsletter'
import { contactRateLimited, parseContactMessage, saveContactMessage } from '@/lib/server/contact'

// @cdc contact — deux usages : inscription (e-mail seul, sans champ « message ») envoyée à Brevo,
// et message de contact rangé dans analytics.contact_messages (lu dans le tableau de bord).
// Après une inscription réussie : e-mail de bienvenue envoyé après la réponse (after), une fois
// par adresse. En double opt-in, Brevo envoie déjà sa confirmation : pas de bienvenue à une adresse
// non confirmée.
// Champ piège « website » : rempli par un robot, la requête reçoit 200 sans rien enregistrer.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const unavailable = () => NextResponse.json({ error: 'Unavailable' }, { status: 503 })

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

  if (typeof body.email === 'string' && !body.message) {
    if (!isBrevoConfigured()) return unavailable()
    const source = typeof body.source === 'string' ? body.source : typeof body._subject === 'string' ? body._subject : 'site'
    const result = await subscribe(body.email, source)
    if (result === 'ok') {
      const email = body.email
      if (!process.env.BREVO_DOI_TEMPLATE_ID) after(() => sendWelcomeOnce(email).then(() => undefined))
      return NextResponse.json({ ok: true })
    }
    if (result === 'invalid') return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    return NextResponse.json({ error: 'Subscribe failed' }, { status: 502 })
  }

  const pool = getPool()
  if (!pool) return unavailable()

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local'
  if (contactRateLimited(ip)) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

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
