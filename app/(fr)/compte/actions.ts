'use server'

import { isAPIError } from 'better-auth/api'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { SESSION_HINT_COOKIE } from '@/lib/account-hint'
import { deleteAttemptsExceeded } from '@/lib/server/account-data'
import { getAuth, getSessionUser } from '@/lib/server/auth'
import { parseDogForm, parseWeightForm, todayIso, type FieldErrors } from '@/lib/server/dog-form'
import { addWeight, createDog, deleteDog, updateDog } from '@/lib/server/dogs'

// @cdc lot 4 — actions serveur des pages /compte. La session est relue à chaque appel ;
// Next vérifie l'origine des actions serveur (protection CSRF intégrée).

export interface FormState {
  errors?: FieldErrors
  message?: string
}

async function requireUser() {
  const user = await getSessionUser()
  if (!user) redirect('/compte/connexion')
  return user
}

export async function createDogAction(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser()
  const parsed = parseDogForm(form)
  if (!parsed.ok) return { errors: parsed.errors }
  const id = await createDog(user.id, parsed.data, todayIso())
  redirect(`/compte/chien/${id}`)
}

export async function updateDogAction(dogId: string, _prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser()
  const parsed = parseDogForm(form)
  if (!parsed.ok) return { errors: parsed.errors }
  const ok = await updateDog(user.id, dogId, parsed.data)
  if (!ok) return { message: "Ce chien n'existe pas ou n'est pas rattaché à ton compte." }
  redirect(`/compte/chien/${dogId}`)
}

export async function deleteDogAction(dogId: string): Promise<void> {
  const user = await requireUser()
  await deleteDog(user.id, dogId)
  redirect('/compte')
}

export async function addWeightAction(dogId: string, _prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser()
  const parsed = parseWeightForm(form)
  if (!parsed.ok) return { errors: parsed.errors }
  const ok = await addWeight(user.id, dogId, parsed.date, parsed.weightKg)
  if (!ok) return { message: "Ce chien n'existe pas ou n'est pas rattaché à ton compte." }
  redirect(`/compte/chien/${dogId}?pesee=1`)
}

export async function signOutAction(): Promise<void> {
  const auth = getAuth()
  if (auth) await auth.api.signOut({ headers: await headers() })
  redirect('/compte/connexion?deconnecte=1')
}

/** Droit à l'effacement : mot de passe exigé, puis Better Auth supprime l'utilisateur (cascade). */
export async function deleteAccountAction(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser()
  const auth = getAuth()
  if (!auth) return { message: 'La suppression est indisponible pour le moment. Réessaie plus tard.' }
  const password = form.get('password')
  if (typeof password !== 'string' || password === '') return { errors: { password: 'Tape ton mot de passe pour confirmer.' } }
  if (deleteAttemptsExceeded(user.id)) return { message: "Trop d'essais. Attends cinq minutes avant de recommencer." }
  try {
    await auth.api.deleteUser({ body: { password }, headers: await headers() })
  } catch (err) {
    const code = isAPIError(err) ? (err.body as { code?: string } | undefined)?.code : undefined
    if (code === 'INVALID_PASSWORD') return { errors: { password: 'Mot de passe incorrect.' } }
    console.error('[compte] suppression impossible', err instanceof Error ? err.message : err)
    return { message: 'La suppression a échoué. Réessaie dans un instant.' }
  }
  const jar = await cookies()
  jar.set(SESSION_HINT_COOKIE, '', { path: '/', maxAge: 0 })
  redirect('/compte/au-revoir')
}
