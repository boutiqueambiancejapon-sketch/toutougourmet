'use client'

import Link from 'next/link'
import { useId, useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { authErrorMessage } from './auth-errors'
import { FormNotice, SubmitButton, TextField } from './fields'

// @cdc lot 4 — choix du nouveau mot de passe (lien reçu par e-mail, jeton dans l'URL).
// Better Auth ferme alors toutes les sessions ouvertes du compte.

export function ResetPasswordForm({ token }: { token: string }) {
  const id = useId()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const password = String(data.get('password') ?? '')
    if (password !== String(data.get('confirm') ?? '')) return setError('Les deux mots de passe ne sont pas identiques.')
    setPending(true)
    setError('')
    const { error: err } = await authClient.resetPassword({ newPassword: password, token })
    setPending(false)
    if (err) return setError(authErrorMessage(err))
    setDone(true)
  }

  if (done) {
    return (
      <FormNotice tone="info">
        Mot de passe changé.{' '}
        <Link href="/compte/connexion" className="font-semibold text-orange-ink underline underline-offset-2">
          Connecte-toi
        </Link>{' '}
        avec le nouveau.
      </FormNotice>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {error ? <FormNotice tone="error">{error}</FormNotice> : null}
      <TextField
        id={`${id}-pw`}
        name="password"
        label="Nouveau mot de passe"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        maxLength={128}
        hint="8 caractères au moins."
      />
      <TextField id={`${id}-confirm`} name="confirm" label="Le même, une seconde fois" type="password" autoComplete="new-password" required />
      <SubmitButton pending={pending}>Enregistrer</SubmitButton>
    </form>
  )
}
