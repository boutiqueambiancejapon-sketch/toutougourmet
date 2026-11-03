import type { ServerEvent } from '@/lib/analytics-events'
import { deviceOf } from '@/lib/analytics-events'
import { isSignupPlace, OTHER_PLACE } from '@/lib/signup-places'
import { getPool } from './db'

// @cdc mesure — emplacement d'origine d'un compte (CRO compte). Le formulaire d'inscription est
// servi sur /compte/inscription?retour=…&source=<place> ; sa requête vers /api/auth/sign-up/email
// part de cette page, donc l'en-tête Referer (même origine, Referrer-Policy
// strict-origin-when-cross-origin) porte l'URL complète. On n'y lit que `source`, validé contre
// la liste fermée de lib/signup-places.ts. Rien d'autre n'est gardé : ni IP, ni e-mail, ni URL.

/** Emplacement lu dans l'URL de la page d'inscription, sinon « autre ». */
export function placeFromReferer(referer: string | null | undefined): string {
  if (!referer) return OTHER_PLACE
  try {
    const url = new URL(referer)
    if (!url.pathname.startsWith('/compte/inscription')) return OTHER_PLACE
    const source = url.searchParams.get('source')
    return isSignupPlace(source) ? source : OTHER_PLACE
  } catch {
    return OTHER_PLACE
  }
}

function headerOf(request: { headers?: Headers; request?: Request } | null | undefined, name: string): string | null {
  return request?.headers?.get(name) ?? request?.request?.headers.get(name) ?? null
}

async function insertEvent(name: ServerEvent, place: string, ua: string | null): Promise<void> {
  const pool = getPool()
  if (!pool) return
  await pool.query(
    'INSERT INTO analytics.events (name, page, props, device) VALUES ($1, $2, $3, $4)',
    [name, '/compte/inscription', JSON.stringify({ place }), ua ? deviceOf(ua) : null],
  )
}

/** Après la création d'un compte : retient l'emplacement et compte la création. */
export async function recordSignup(userId: string, ctx: { headers?: Headers; request?: Request } | null): Promise<void> {
  const pool = getPool()
  if (!pool) return
  const place = placeFromReferer(headerOf(ctx, 'referer'))
  try {
    await pool.query(
      'INSERT INTO analytics.signup_sources (user_id, place) VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING',
      [userId, place],
    )
    await insertEvent('Account Created', place, headerOf(ctx, 'user-agent'))
  } catch (err) {
    // La mesure ne bloque jamais l'inscription.
    console.error('[signup-source] création', err instanceof Error ? err.message : err)
  }
}

/** Après la confirmation de l'e-mail : compte la confirmation avec l'emplacement d'origine. */
export async function recordVerified(userId: string, request: Request | undefined): Promise<void> {
  const pool = getPool()
  if (!pool) return
  try {
    const res = await pool.query<{ place: string }>('DELETE FROM analytics.signup_sources WHERE user_id = $1 RETURNING place', [userId])
    await insertEvent('Account Verified', res.rows[0]?.place ?? OTHER_PLACE, request?.headers.get('user-agent') ?? null)
  } catch (err) {
    console.error('[signup-source] confirmation', err instanceof Error ? err.message : err)
  }
}
