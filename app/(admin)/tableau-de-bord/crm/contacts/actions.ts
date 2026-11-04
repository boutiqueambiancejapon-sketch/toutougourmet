'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { parseFilter } from '@/lib/dashboard/crm'
import { assertDashboardAction } from '@/lib/dashboard/guard'
import { cleanQuery, CONTACTS_PATH, encodeSearch, SEARCH_COOKIE, SEARCH_MAX_AGE } from '@/lib/dashboard/subscriber-search'

// @cdc tableau de bord — recherche d'un contact : identifiants et origine revérifiés (guard.ts),
// saisie gardée dans un cookie httpOnly, jamais dans l'URL ni dans les journaux.

async function writeSearch(query: string): Promise<void> {
  ;(await cookies()).set(SEARCH_COOKIE, query ? encodeSearch(query) : '', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: CONTACTS_PATH,
    maxAge: query ? SEARCH_MAX_AGE : 0,
  })
}

function backTo(form: FormData): string {
  const filter = parseFilter(String(form.get('filtre') ?? ''))
  return filter === 'tous' ? CONTACTS_PATH : `${CONTACTS_PATH}?filtre=${filter}`
}

export async function searchContacts(form: FormData): Promise<void> {
  await assertDashboardAction()
  await writeSearch(cleanQuery(form.get('q')))
  redirect(backTo(form))
}

export async function clearContactSearch(form: FormData): Promise<void> {
  await assertDashboardAction()
  await writeSearch('')
  redirect(backTo(form))
}
