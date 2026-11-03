'use client'

import type { ReactNode } from 'react'
import { useActionState, useId, useState } from 'react'
import type { ActivityLevel } from '@/lib/calculators'
import type { FormState } from '@/app/(fr)/compte/actions'
import { Segmented } from '@/components/tools/Segmented'
import { FieldError, FormNotice, SubmitButton, TextField } from './fields'

// @cdc lot 4 — formulaire du profil chien (ajout et édition). Envoi par action serveur,
// erreurs renvoyées champ par champ. Âge : date de naissance, ou âge approximatif en années.

export interface DogFormValues {
  name: string
  breedSlug: string
  ageMode: 'naissance' | 'age'
  birthDate: string
  ageYears: string
  weightKg: string
  activity: ActivityLevel
  sterilized: 'oui' | 'non'
}

interface DogFormProps {
  action: (prev: FormState, form: FormData) => Promise<FormState>
  initial: DogFormValues
  breeds: { slug: string; name: string }[]
  submitLabel: ReactNode
  today: string
}

const AGE_MODES = [['naissance', 'Date de naissance'], ['age', 'Âge approximatif']] as const
const ACTIVITIES = [['sedentaire', 'Calme'], ['normal', 'Normale'], ['actif', 'Sportive'], ['tres-actif', 'Intense']] as const
const YES_NO = [['non', 'Non'], ['oui', 'Oui']] as const

export function DogForm({ action, initial, breeds, submitLabel, today }: DogFormProps) {
  const id = useId()
  const [state, formAction] = useActionState(action, {})
  const [v, setV] = useState(initial)
  const set = <K extends keyof DogFormValues>(key: K, value: DogFormValues[K]) => setV((s) => ({ ...s, [key]: value }))
  const err = state.errors ?? {}

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-card border border-line bg-paper p-4 sm:p-6">
      {state.message ? <FormNotice tone="error">{state.message}</FormNotice> : null}
      <TextField id={`${id}-name`} name="name" label="Son nom" value={v.name} onChange={(x) => set('name', x)} required maxLength={40} error={err.name} />
      <div className="flex min-w-0 flex-col gap-1.5">
        <label htmlFor={`${id}-breed`} className="text-sm font-semibold text-ink">
          Sa race
        </label>
        <select
          id={`${id}-breed`}
          name="breedSlug"
          value={v.breedSlug}
          onChange={(e) => set('breedSlug', e.target.value)}
          className="min-h-12 w-full rounded-control border-2 border-ink bg-paper px-3 text-base text-ink focus-visible:ring-4 focus-visible:ring-amber"
        >
          <option value="">Croisé, autre race ou je ne sais pas</option>
          {breeds.map((b) => (
            <option key={b.slug} value={b.slug}>
              {b.name}
            </option>
          ))}
        </select>
        <FieldError id={`${id}-breed-err`} message={err.breedSlug} />
      </div>
      <Segmented name="ageMode" legend="Son âge" options={AGE_MODES} value={v.ageMode} onChange={(x) => set('ageMode', x)} />
      {v.ageMode === 'naissance' ? (
        <TextField id={`${id}-birth`} name="birthDate" label="Date de naissance" type="date" max={today} min="1995-01-01" value={v.birthDate} onChange={(x) => set('birthDate', x)} error={err.birthDate} />
      ) : (
        <TextField id={`${id}-age`} name="ageYears" label="Âge (ans)" type="number" inputMode="decimal" min="0" max="25" step="0.5" value={v.ageYears} onChange={(x) => set('ageYears', x)} error={err.ageYears} />
      )}
      <TextField id={`${id}-weight`} name="weightKg" label="Poids (kg)" type="number" inputMode="decimal" min="0.5" max="120" step="0.1" value={v.weightKg} onChange={(x) => set('weightKg', x)} error={err.weightKg} hint="Facultatif. Chaque pesée ajoutée ensuite le met à jour." />
      <Segmented name="activity" legend="Son activité" options={ACTIVITIES} value={v.activity} onChange={(x) => set('activity', x)} />
      <Segmented name="sterilized" legend="Stérilisé" options={YES_NO} value={v.sterilized} onChange={(x) => set('sterilized', x)} />
      <SubmitButton pendingLabel="Enregistrement…">{submitLabel}</SubmitButton>
    </form>
  )
}
