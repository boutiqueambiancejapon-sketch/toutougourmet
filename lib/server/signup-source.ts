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
    const res = await pool.query<{ place: string }>('SELECT place FROM analytics.signup_sources WHERE user_id = $1 ', [userId])
    await insertEvent('Account Verified', res.rows[0]?.place ?? OTHER_PLACE, request?.headers.get('user-agent') ?? null)
  } catch (err) {
    console.error('[signup-source] confirmation', err instanceof Error ? err.message : err)
  }
}

async function placeOf(userId: string): Promise<string> {
  const pool = getPool()
  if (!pool) return OTHER_PLACE
  const res = await pool.query<{ place: string }>('SELECT place FROM analytics.signup_sources WHERE user_id = $1', [userId])
  return res.rows[0]?.place ?? OTHER_PLACE
}

/** Premier chien ajouté : l'étape qui rend le compte utile. Jamais bloquant. */
export async function recordDogAdded(userId: string): Promise<void> {
  const pool = getPool()
  if (!pool) return
  try {
    const n = await pool.query<{ n: number }>('SELECT count(*)::int AS n FROM app.dog WHERE user_id = $1', [userId])
    if (n.rows[0]?.n === 1) await insertEvent('Dog Added', await placeOf(userId), null)
  } catch (err) {
    console.error('[signup-source] chien', err instanceof Error ? err.message : err)
  }
}

/** Retour d'un compte un autre jour que celui de sa création, compté une fois par jour. */
export async function recordReturn(userId: string, ua: string | null): Promise<void> {
  const pool = getPool()
  if (!pool) return
  try {
    const res = await pool.query(
      `UPDATE analytics.signup_sources SET last_return = (now() AT TIME ZONE 'Europe/Paris')::date
        WHERE user_id = $1 AND (created_at AT TIME ZONE 'Europe/Paris')::date < (now() AT TIME ZONE 'Europe/Paris')::date
          AND last_return IS DISTINCT FROM (now() AT TIME ZONE 'Europe/Paris')::date
        RETURNING place`,
      [userId],
    )
    if (res.rows[0]) await insertEvent('Account Return', (res.rows[0] as { place: string }).place, ua)
  } catch (err) {
    console.error('[signup-source] retour', err instanceof Error ? err.message : err)
  }
}
