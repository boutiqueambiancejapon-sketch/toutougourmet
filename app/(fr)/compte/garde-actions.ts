'use server'

import { redirect } from 'next/navigation'
import { parseSheet, type SheetErrors } from '@/lib/garde/sheet'
import { getSessionUser } from '@/lib/server/auth'
import { todayIso } from '@/lib/server/dog-form'
import { createDog, getDog } from '@/lib/server/dogs'
import { createSheet, deleteSheet, getOwnSheet } from '@/lib/server/sitter-sheets'

// @cdc fiche de garde — actions serveur. La session est relue à chaque appel, la fiche est
// revalidée côté serveur avec le même schéma que le navigateur (lib/garde/sheet.ts).

export type SheetActionResult = { ok: true; dogId: string; sheetId: string } | { ok: false; errors: SheetErrors }

const NO_DOG: SheetActionResult = { ok: false, errors: { form: "Ce chien n'existe pas ou n'est pas rattaché à ton compte." } }

async function requireUser() {
  const user = await getSessionUser()
  if (!user) redirect('/compte/connexion')
  return user
}

/** Fiche créée depuis la page d'un chien. */
export async function createSheetForDogAction(dogId: string, raw: unknown): Promise<SheetActionResult> {
  const user = await requireUser()
  const owned = await getDog(user.id, dogId)
  if (!owned) return NO_DOG
  const parsed = parseSheet(raw, todayIso())
  if (!parsed.ok) return { ok: false, errors: parsed.errors }
  const sheet = await createSheet(user.id, owned.id, parsed.data)
  return { ok: true, dogId: owned.id, sheetId: sheet.id }
}

/**
 * Saisie reprise après l'inscription (brouillon de /outils/fiche-de-garde). `target` : un chien
 * du compte, ou « new » pour ajouter le chien de la fiche au profil.
 */
export async function createSheetFromDraftAction(target: string, raw: unknown): Promise<SheetActionResult> {
  const user = await requireUser()
  const parsed = parseSheet(raw, todayIso())
  if (!parsed.ok) return { ok: false, errors: parsed.errors }
  const d = parsed.data
  let dogId: string
  if (target === 'new') {
    dogId = await createDog(
      user.id,
      { name: d.dogName, breedSlug: null, birthDate: null, birthDateEstimated: false, weightKg: d.weightKg, activity: d.activity, sterilized: d.sterilized },
      todayIso(),
    )
  } else {
    const owned = await getDog(user.id, target)
    if (!owned) return NO_DOG
    dogId = owned.id
  }
  const sheet = await createSheet(user.id, dogId, d)
  return { ok: true, dogId, sheetId: sheet.id }
}

export async function deleteSheetAction(sheetId: string): Promise<void> {
  const user = await requireUser()
  const sheet = await getOwnSheet(user.id, sheetId)
  await deleteSheet(user.id, sheetId)
  redirect(sheet ? `/compte/chien/${sheet.dogId}/garde?supprimee=1` : '/compte/chiens')
}
