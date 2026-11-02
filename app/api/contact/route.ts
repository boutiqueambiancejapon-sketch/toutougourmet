import { NextRequest, NextResponse } from 'next/server'
import { isBrevoConfigured, subscribe } from '@/lib/server/brevo'

// @cdc mesure — deux usages : inscription (e-mail seul, sans champ « message ») et formulaire de
// contact. Les inscriptions vont dans Brevo quand il est configuré (serveur), sinon Formspree
// comme avant (Vercel). Les messages de contact passent toujours par Formspree.

export const runtime = 'nodejs'

interface ContactBody {
  email?: unknown
  message?: unknown
  source?: unknown
  _subject?: unknown
}

async function toFormspree(body: ContactBody): Promise<NextResponse> {
  const formId = process.env.FORMSPREE_ID
  if (!formId) {
    console.error('[contact] FORMSPREE_ID manquant')
    return NextResponse.json({ error: 'Form not configured' }, { status: 500 })
  }
  let res: Response
  try {
    res = await fetch(`https://formspree.io/f/${formId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    })
  } catch (err) {
    console.error('[contact] fetch Formspree échoué :', err)
    return NextResponse.json({ error: 'Network error' }, { status: 502 })
  }
  const text = await res.text()
  try {
    return NextResponse.json(JSON.parse(text), { status: res.status })
  } catch {
    return NextResponse.json({ error: text }, { status: res.status })
  }
}

export async function POST(req: NextRequest) {
  let body: ContactBody
  try {
    body = (await req.json()) as ContactBody
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }

  const isSignup = typeof body.email === 'string' && !body.message
  if (isSignup && isBrevoConfigured()) {
    const source = typeof body.source === 'string' ? body.source : typeof body._subject === 'string' ? body._subject : 'site'
    const result = await subscribe(body.email as string, source)
    if (result === 'ok') return NextResponse.json({ ok: true })
    if (result === 'invalid') return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    return NextResponse.json({ error: 'Subscribe failed' }, { status: 502 })
  }
  return toFormspree(body)
}
