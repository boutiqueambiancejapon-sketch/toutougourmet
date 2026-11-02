'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
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
