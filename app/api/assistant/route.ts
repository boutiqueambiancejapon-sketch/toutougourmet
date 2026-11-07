import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/server/auth'
import { sujetSensible } from '@/lib/assistant/sensible'
import { BOT_UA } from '@/lib/analytics-events'
import { CGU_VERSION } from '@/data/conditions'
import { cguOk, compterQuestion, contexteManquant, demanderContexte, noterQuestion, profilChiens, QUESTIONS_PAR_JOUR, renvoiVeterinaire, repondre, reserverAppel, type Echange, type Reponse } from '@/lib/server/assistant'
import { listDogs } from '@/lib/server/dogs'
import { clientIp, overLimit } from '@/lib/server/rate-window'

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

const PAR_ADRESSE = [
  { windowMs: 10 * 60_000, max: 15 },
  { windowMs: 24 * 60 * 60_000, max: 40 },
] as const

/** Garde-fous anti-robots : navigateur déclaré robot, champ piège rempli, envoi trop rapide après l'ouverture. */
function robot(req: NextRequest, body: { site?: unknown; t?: unknown } | null): boolean {
  if (BOT_UA.test(req.headers.get('user-agent') ?? '')) return true
  if (typeof body?.site === 'string' && body.site !== '') return true
  return typeof body?.t !== 'number' || body.t < 1500
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const origin = req.headers.get('origin')
  if (!origin || new URL(origin).host !== req.headers.get('host')) return non(403, 'Requête refusée.')
  const body = (await req.json().catch(() => null)) as { question?: unknown; historique?: unknown; site?: unknown; t?: unknown; lieu?: unknown; cgu?: unknown } | null
  if (robot(req, body)) return non(400, 'Requête refusée.')
  if (overLimit(`assistant-ip:${clientIp(req.headers)}`, PAR_ADRESSE)) return non(429, 'Beaucoup de questions d\'affilée : réessaie dans un moment.')
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ ok: false, compte: true, message: 'Crée ton compte gratuit pour avoir la réponse de Milo.' }, { status: 401, headers })
  if (!(await cguOk(user.id, body?.cgu === CGU_VERSION).catch(() => false))) return NextResponse.json({ ok: false, cgu: true, message: 'Accepte les conditions d’utilisation pour discuter avec Milo.' }, { status: 409, headers })
  const question = typeof body?.question === 'string' ? body.question.trim() : ''
  if (question.length < 3 || question.length > 500) return non(400, 'Pose ta question en une ou deux phrases.')
  const lieu = body?.lieu === 'fenetre' ? 'fenetre' : 'page'
  const historique: Echange[] = Array.isArray(body?.historique)
    ? body.historique.slice(-4).flatMap((h: unknown) => (h && typeof h === 'object' && typeof (h as Echange).q === 'string' && typeof (h as Echange).r === 'string' ? [{ q: (h as Echange).q.slice(0, 500), r: (h as Echange).r.slice(0, 1500) }] : []))
    : []
  if (overLimit(`assistant:${user.id}`, LIMITES)) return non(429, 'Beaucoup de questions d\'affilée : réessaie dans un moment.')
  const fixe = async (r: Reponse) => {
    await noterQuestion(question, r, lieu)
    return NextResponse.json({ ok: true, ...r }, { headers })
  }
  const sensible = sujetSensible(question)
  if (sensible) return fixe(renvoiVeterinaire(question, sensible))
  const chiens = await listDogs(user.id).then(profilChiens).catch(() => '')
  const manque = contexteManquant(question, historique.map((h) => `${h.q} ${h.r}`).join(' '), chiens)
  if (manque) return fixe(demanderContexte(manque))
  if (!(await compterQuestion(user.id))) return non(429, `Tu as posé tes ${QUESTIONS_PAR_JOUR} questions du jour. Milo revient demain matin.`)
  if (!(await reserverAppel())) return non(429, 'L\'assistant a beaucoup servi aujourd\'hui. Réessaie demain.')
  try {
    return await fixe(await repondre(question, historique, chiens))
  } catch (err) {
    console.error('[assistant] échec', err instanceof Error ? err.message : err)
    await noterQuestion(question, null, lieu)
    return non(502, 'La réponse n\'a pas pu être préparée. Réessaie dans un instant.')
  }
}
