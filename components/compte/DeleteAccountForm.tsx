'use client'

import { useActionState, useId } from 'react'
import { deleteAccountAction, type FormState } from '@/app/(fr)/compte/actions'
import { FormNotice, SubmitButton, TextField } from './fields'

// @cdc lot 4 — RGPD, droit à l'effacement : le mot de passe confirme la demande.
export function DeleteAccountForm() {
  const id = useId()
  const [state, formAction] = useActionState<FormState, FormData>(deleteAccountAction, {})
  return (
    <form action={formAction} aria-label="Supprimer mon compte" className="flex flex-col gap-3">
      {state.message ? <FormNotice tone="error">{state.message}</FormNotice> : null}
      <TextField
        id={`${id}-pw`}
        name="password"
        label="Ton mot de passe"
        type="password"
        autoComplete="current-password"
        required
        maxLength={128}
        error={state.errors?.password}
      />
      <SubmitButton pendingLabel="Suppression…">Supprimer mon compte</SubmitButton>
    </form>
  )
}
