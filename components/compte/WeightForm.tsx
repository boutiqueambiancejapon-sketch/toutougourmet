'use client'

import { useActionState, useId } from 'react'
import type { FormState } from '@/app/(fr)/compte/actions'
import { FormNotice, SubmitButton, TextField } from './fields'

// @cdc lot 4 — ajout d'une pesée (date du jour par défaut).
export function WeightForm({ action, today }: { action: (prev: FormState, form: FormData) => Promise<FormState>; today: string }) {
  const id = useId()
  const [state, formAction] = useActionState(action, {})
  const err = state.errors ?? {}
  return (
    <form action={formAction} aria-label="Ajouter une pesée" className="flex flex-col gap-3">
      {state.message ? <FormNotice tone="error">{state.message}</FormNotice> : null}
      <div className="grid grid-cols-2 gap-3">
        <TextField id={`${id}-w`} name="weightKg" label="Poids (kg)" type="number" inputMode="decimal" min="0.5" max="120" step="0.1" required error={err.weightKg} />
        <TextField id={`${id}-d`} name="date" label="Date" type="date" defaultValue={today} max={today} min="1995-01-01" required error={err.date} />
      </div>
      <SubmitButton pendingLabel="Enregistrement…">Ajouter la pesée</SubmitButton>
    </form>
  )
}
