'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { assertDashboardAction } from '@/lib/dashboard/guard'
import { cleanQuery, encodeSearch, listHref, parseList, SEARCH_COOKIE, SEARCH_MAX_AGE, SEARCH_PATH } from '@/lib/dashboard/subscriber-search'

// @cdc tableau de bord — recherche d'adresse : identifiants et origine revérifiés (guard.ts),
// saisie gardée dans un cookie httpOnly, jamais dans l'URL ni dans les journaux.

/** Chaîne vide : cookie expiré tout de suite (même chemin, sinon le navigateur le garde). */
async function writeSearch(query: string): Promise<void> {
  ;(await cookies()).set(SEARCH_COOKIE, query ? encodeSearch(query) : '', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: SEARCH_PATH,
    maxAge: query ? SEARCH_MAX_AGE : 0,
  })
}

export async function searchSubscribers(form: FormData): Promise<void> {
  await assertDashboardAction()
  const query = cleanQuery(form.get('q'))
  await writeSearch(query)
  redirect(listHref(parseList(String(form.get('liste') ?? ''))))
}

export async function clearSearch(form: FormData): Promise<void> {
  await assertDashboardAction()
  await writeSearch('')
  redirect(listHref(parseList(String(form.get('liste') ?? ''))))
}
