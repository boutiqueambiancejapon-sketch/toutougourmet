'use client'

import Link from 'next/link'
import { useId, useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { authErrorMessage } from './auth-errors'
import { FormNotice, SubmitButton, TextField } from './fields'

// @cdc lot 4 — connexion par e-mail et mot de passe. Après succès, rechargement complet vers
// la page d'origine : l'en-tête relit le témoin de session.

export function SignInForm({ returnTo }: { returnTo: string }) {
  const id = useId()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    setPending(true)
    setError('')
    const { error: err } = await authClient.signIn.email({
      email: String(data.get('email') ?? '').trim(),
      password: String(data.get('password') ?? ''),
      rememberMe: true,
      // Adresse pas encore confirmée : Better Auth renvoie le lien, qui ramène ici après clic.
      callbackURL: `${returnTo}${returnTo.includes('?') ? '&' : '?'}bienvenue=1`,
    })
    if (err) {
      setPending(false)
      return setError(authErrorMessage(err))
    }
    window.location.assign(returnTo)
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {error ? <FormNotice tone="error">{error}</FormNotice> : null}
      <TextField id={`${id}-email`} name="email" label="Ton e-mail" type="email" autoComplete="email" inputMode="email" required />
      <TextField id={`${id}-pw`} name="password" label="Mot de passe" type="password" autoComplete="current-password" required />
      <SubmitButton pending={pending} pendingLabel="Connexion…">
        Se connecter
      </SubmitButton>
      <p className="m-0 flex flex-col gap-2 text-sm text-ink-2">
        <Link href="/compte/mot-de-passe-oublie" className="font-semibold text-orange-ink underline underline-offset-2">
          Mot de passe oublié ?
        </Link>
        <span>
          Pas encore de compte ?{' '}
          <Link href={`/compte/inscription?retour=${encodeURIComponent(returnTo)}`} className="font-semibold text-orange-ink underline underline-offset-2">
            En créer un
          </Link>
        </span>
      </p>
    </form>
  )
}
