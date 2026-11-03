'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createSheetFromDraftAction } from '@/app/(fr)/compte/garde-actions'
import { FormNotice } from '@/components/compte/fields'
import { btnPrimaryBlock, linkInline } from '@/components/compte/espace/ui'
import { track } from '@/lib/analytics'
import { clearDraft, draftToRaw, gramsOf, loadDraft, type SheetDraft } from '@/lib/garde/draft'

// @cdc fiche de garde — reprise de la saisie faite sans compte sur /outils/fiche-de-garde, après
// l'inscription (ou la connexion). Le brouillon est lu dans ce navigateur, envoyé une seule fois,
// puis effacé. Le visiteur choisit le chien du compte, ou ajoute celui de la fiche.

export function DraftResume({ dogs }: { dogs: { id: string; name: string }[] }) {
  const router = useRouter()
  const [draft, setDraft] = useState<SheetDraft | null | undefined>(undefined)
  const [target, setTarget] = useState('new')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => {
      const d = loadDraft()
      setDraft(d)
      const same = d && dogs.find((x) => x.name.trim().toLowerCase() === d.dogName.trim().toLowerCase())
      if (same) setTarget(same.id)
    }, 0)
    return () => window.clearTimeout(t)
  }, [dogs])

  if (draft === undefined) return <p className="m-0 text-base text-ink-2">Lecture de ta saisie…</p>
  if (draft === null) {
    return (
      <FormNotice tone="info">
        Aucune saisie en attente sur cet appareil (lien de confirmation ouvert ailleurs, ou fiche déjà créée). Ouvre la page d&apos;un de{' '}
        <Link href="/compte/chiens" className={linkInline}>
          tes chiens
        </Link>{' '}
        pour préparer sa fiche, ou reprends le{' '}
        <Link href="/outils/fiche-de-garde" className={linkInline}>
          formulaire
        </Link>
        .
      </FormNotice>
    )
  }

  async function create() {
    if (!draft) return
    setPending(true)
    setError('')
    const res = await createSheetFromDraftAction(target, draftToRaw(draft))
    if (!res.ok) {
      setPending(false)
      return setError(Object.values(res.errors)[0] ?? 'La fiche n’a pas pu être créée.')
    }
    clearDraft()
    track('Sitter Sheet Created', { place: 'outil' })
    router.push(`/compte/chien/${res.dogId}/garde/${res.sheetId}?nouvelle=1`)
  }

  const grams = gramsOf(draft)
  return (
    <div className="flex flex-col gap-4 rounded-card border border-line bg-paper p-4 md:p-6">
      <p className="m-0 text-base text-ink">
        <strong className="font-semibold">{draft.dogName || 'Ton chien'}</strong>
        {grams ? `, ${grams} g de croquettes par jour en ${draft.meals} repas` : null}
      </p>
      <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
        <legend className="mb-1 p-0 text-sm font-semibold text-ink">Pour quel chien ?</legend>
        {dogs.map((d) => (
          <label key={d.id} className="flex min-h-11 cursor-pointer items-center gap-3 text-base text-ink">
            <input type="radio" name="target" value={d.id} checked={target === d.id} onChange={() => setTarget(d.id)} className="size-5 accent-ink" />
            {d.name}
          </label>
        ))}
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-base text-ink">
          <input type="radio" name="target" value="new" checked={target === 'new'} onChange={() => setTarget('new')} className="size-5 accent-ink" />
          {`Ajouter ${draft.dogName || 'ce chien'} à mes chiens`}
        </label>
      </fieldset>
      {error ? <FormNotice tone="error">{error}</FormNotice> : null}
      <button type="button" onClick={create} disabled={pending} className={`${btnPrimaryBlock} disabled:opacity-60`}>
        {pending ? 'Création…' : 'Créer la fiche'}
      </button>
    </div>
  )
}
