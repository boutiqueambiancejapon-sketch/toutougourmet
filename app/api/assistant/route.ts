import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/server/auth'
import { compterQuestion, contexteManquant, demanderContexte, noterQuestion, profilChiens, QUESTIONS_PAR_JOUR, repondre, reserverAppel, type Echange } from '@/lib/server/assistant'
import { listDogs } from '@/lib/server/dogs'
import { overLimit } from '@/lib/server/rate-window'

// @cdc assistant — POST { question, historique } depuis le site seulement, avec un compte (décision du 2026-11-07).
// Limites : par compte en mémoire, et plafond global d'appels par jour en base. La question est gardée sans le compte.

export const dynamic = 'force-dynamic'
export const maxDuration = 45

const headers = { 'Cache-Control': 'private, no-store' }
const LIMITES = [
  { windowMs: 60 * 60_000, max: 20 },
  { windowMs: 24 * 60 * 60_000, max: 60 },
] as const

const non = (status: number, message: string) => NextResponse.json({ ok: false, message }, { status, headers })

export async function POST(req: NextRequest): Promise<NextResponse> {
  const origin = req.headers.get('origin')
  if (!origin || new URL(origin).host !== req.headers.get('host')) return non(403, 'Requête refusée.')
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ ok: false, compte: true, message: 'Crée ton compte gratuit pour avoir la réponse de Milo.' }, { status: 401, headers })
  const body = (await req.json().catch(() => null)) as { question?: unknown; historique?: unknown } | null
  const question = typeof body?.question === 'string' ? body.question.trim() : ''
  if (question.length < 3 || question.length > 500) return non(400, 'Pose ta question en une ou deux phrases.')
  const historique: Echange[] = Array.isArray(body?.historique)
    ? body.historique.slice(-4).flatMap((h: unknown) => (h && typeof h === 'object' && typeof (h as Echange).q === 'string' && typeof (h as Echange).r === 'string' ? [{ q: (h as Echange).q.slice(0, 500), r: (h as Echange).r.slice(0, 1500) }] : []))
    : []
  if (overLimit(`assistant:${user.id}`, LIMITES)) return non(429, 'Beaucoup de questions d\'affilée : réessaie dans un moment.')
  const chiens = await listDogs(user.id).then(profilChiens).catch(() => '')
  const manque = contexteManquant(question, historique.map((h) => `${h.q} ${h.r}`).join(' '), chiens)
  if (manque) return NextResponse.json({ ok: true, ...demanderContexte(manque) }, { headers })
  if (!(await compterQuestion(user.id))) return non(429, `Tu as posé tes ${QUESTIONS_PAR_JOUR} questions du jour. Milo revient demain matin.`)
  if (!(await reserverAppel())) return non(429, 'L\'assistant a beaucoup servi aujourd\'hui. Réessaie demain.')
  try {
    const r = await repondre(question, historique, chiens)
    await noterQuestion(question, r)
    return NextResponse.json({ ok: true, ...r }, { headers })
  } catch (err) {
    console.error('[assistant] échec', err instanceof Error ? err.message : err)
    await noterQuestion(question, null)
    return non(502, 'La réponse n\'a pas pu être préparée. Réessaie dans un instant.')
  }
}
