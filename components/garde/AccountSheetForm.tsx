'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createSheetForDogAction } from '@/app/(fr)/compte/garde-actions'
import { track } from '@/lib/analytics'
import type { SheetDraft } from '@/lib/garde/draft'
import type { SheetData } from '@/lib/garde/sheet'
import { KeepInProfile, keepable, type ProfileGaps } from './KeepInProfile'
import { SheetForm } from './SheetForm'

// @cdc fiche de garde — création depuis la page d'un chien (espace compte), formulaire
// pré-rempli par lib/garde/prefill.ts. Croquettes ou allergies absentes du profil et tapées ici :
// case « Garder dans le profil » (cochée par défaut).

interface AccountSheetFormProps {
  dogId: string
  dogName: string
  initial: SheetDraft
  today: string
  prefilled: string
  /** Champs vides du profil que la fiche peut remplir (tout faux avant la migration 0008) */
  gaps: ProfileGaps
}

export function AccountSheetForm({ dogId, dogName, initial, today, prefilled, gaps }: AccountSheetFormProps) {
  const router = useRouter()
  const [keep, setKeep] = useState(true)

  async function onSubmit(data: SheetData, draft: SheetDraft) {
    const what = keepable(gaps, draft)
    const res = await createSheetForDogAction(dogId, data, keep && (what.food || what.allergies))
    if (!res.ok) return res.errors
    track('Sitter Sheet Created', { place: 'compte' })
    router.push(`/compte/chien/${res.dogId}/garde/${res.sheetId}?nouvelle=1`)
  }

  return (
    <SheetForm
      initial={initial}
      today={today}
      submitLabel="Créer la fiche"
      onSubmit={onSubmit}
      beforeSubmit={(draft) => <KeepInProfile name={dogName} what={keepable(gaps, draft)} checked={keep} onChange={setKeep} />}
      banner={
        <p className="m-0 flex items-center justify-between gap-3 rounded-control bg-green-bg px-4 py-3 text-[15px] text-ink">
          <span>
            <strong className="block font-semibold">Déjà rempli depuis son profil</strong>
            {prefilled}
          </span>
          <span className="shrink-0 rounded-pill bg-green px-2 py-0.5 text-xs font-semibold text-green-ink">Auto</span>
        </p>
      }
    />
  )
}
