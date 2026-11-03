'use client'

import { useId, useRef, useState, type ReactNode } from 'react'
import { FormNotice } from '@/components/compte/fields'
import { draftToRaw, type SheetDraft } from '@/lib/garde/draft'
import { parseSheet, type SheetData, type SheetErrors } from '@/lib/garde/sheet'
import { CareFields } from './CareFields'
import { ContactFields } from './ContactFields'
import { DogFields } from './DogFields'
import { MealFields } from './MealFields'

// @cdc fiche de garde — formulaire commun à la page publique (/outils/fiche-de-garde) et à
// l'espace compte. Validé dans le navigateur avec le même schéma que le serveur, puis remis à
// `onSubmit` (brouillon local sans compte, action serveur avec compte).

interface SheetFormProps {
  initial: SheetDraft
  today: string
  /** Bandeau au-dessus des champs (ex. « Déjà rempli depuis son profil ») */
  banner?: ReactNode
  submitLabel: ReactNode
  /** Juste avant le bouton, selon la saisie en cours (ex. « Garder dans le profil ») */
  beforeSubmit?: (draft: SheetDraft) => ReactNode
  /** Sous le bouton (ex. explication du compte demandé) */
  footer?: ReactNode
  onSubmit: (data: SheetData, draft: SheetDraft) => Promise<SheetErrors | void>
  /** Premier champ modifié (mesure « Sitter Sheet Started ») */
  onFirstChange?: () => void
  /** Chaque modification, pour garder la saisie au fil de l'eau */
  onChange?: (draft: SheetDraft) => void
}

export function SheetForm({ initial, today, banner, submitLabel, beforeSubmit, footer, onSubmit, onFirstChange, onChange }: SheetFormProps) {
  const id = useId()
  const [v, setV] = useState(initial)
  const [err, setErr] = useState<SheetErrors>({})
  const [pending, setPending] = useState(false)
  const touched = useRef(false)

  const set = <K extends keyof SheetDraft>(key: K, value: SheetDraft[K]) => {
    if (!touched.current) {
      touched.current = true
      onFirstChange?.()
    }
    setV((s) => {
      const next = { ...s, [key]: value }
      onChange?.(next)
      return next
    })
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = parseSheet(draftToRaw(v), today)
    if (!parsed.ok) {
      setErr(parsed.errors)
      return
    }
    setErr({})
    setPending(true)
    const errors = await onSubmit(parsed.data, v)
    setPending(false)
    if (errors) setErr(errors)
  }

  const count = Object.keys(err).length
  const parts = { id, v, set, err }

  return (
    <form noValidate onSubmit={submit} aria-label="Fiche de garde" className="flex flex-col gap-5 rounded-card border border-line bg-paper p-4 sm:p-6">
      {banner}
      <DogFields {...parts} />
      <MealFields {...parts} />
      <CareFields {...parts} />
      <ContactFields {...parts} today={today} />
      {count > 0 ? (
        <FormNotice tone="error">{err.form ?? (count === 1 ? 'Un champ est à corriger plus haut.' : `${count} champs sont à corriger plus haut.`)}</FormNotice>
      ) : null}
      {beforeSubmit?.(v)}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-control bg-orange px-4 text-base font-semibold text-ink hover:underline disabled:opacity-60"
      >
        {pending ? 'Envoi…' : submitLabel}
      </button>
      {footer}
    </form>
  )
}
