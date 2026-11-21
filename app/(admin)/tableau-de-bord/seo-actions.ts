'use server'

import { revalidatePath } from 'next/cache'
import { assertDashboardAction } from '@/lib/dashboard/guard'
import type { NoteKind } from '@/lib/seo-dash/chart-types'
import { addNote, deleteNote } from '@/lib/seo-dash/server/notes'
import { markDone } from '@/lib/seo-dash/server/today'
import { getPool } from '@/lib/server/db'

// @cdc tableau de bord SEO — actions serveur : « Marquer comme fait » et notes manuelles. Accès et origine revérifiés.

const KINDS: NoteKind[] = ['tech', 'pub', 'maj', 'google']

export async function markActionDone(form: FormData): Promise<void> {
  await assertDashboardAction()
  const key = String(form.get('key') ?? '')
  const title = String(form.get('title') ?? '')
  const pool = getPool()
  if (!pool || !key) return
  await markDone(pool, key, title)
  revalidatePath('/tableau-de-bord')
}

export async function saveNote(form: FormData): Promise<void> {
  await assertDashboardAction()
  const day = String(form.get('day') ?? '')
  const text = String(form.get('text') ?? '').trim()
  const kind = String(form.get('kind') ?? 'tech') as NoteKind
  const pool = getPool()
  if (!pool || !/^\d{4}-\d\d-\d\d$/.test(day) || !text || !KINDS.includes(kind)) return
  await addNote(pool, day, kind, text)
  revalidatePath('/tableau-de-bord/contenu')
}

export async function removeNote(form: FormData): Promise<void> {
  await assertDashboardAction()
  const id = Number(form.get('id'))
  const pool = getPool()
  if (!pool || !Number.isInteger(id)) return
  await deleteNote(pool, id)
  revalidatePath('/tableau-de-bord/contenu')
}
