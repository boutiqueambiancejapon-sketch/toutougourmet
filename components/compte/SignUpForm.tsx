'use client'

import Link from 'next/link'
import { useId, useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { track } from '@/lib/analytics'
import { authErrorMessage } from './auth-errors'
import { FormNotice, SubmitButton, TextField } from './fields'

// @cdc lot 4 — inscription : prénom, e-mail, mot de passe. Le compte s'ouvre après le clic sur
// le lien reçu par e-mail (Better Auth connecte alors directement et renvoie vers /compte).

export function SignUpForm({ returnTo }: { returnTo: string }) {
  const id = useId()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [sentTo, setSentTo] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const email = String(data.get('email') ?? '').trim()
    setPending(true)
    setError('')
    const { error: err } = await authClient.signUp.email({
      name: String(data.get('name') ?? '').trim(),
      email,
      password: String(data.get('password') ?? ''),
      callbackURL: `${returnTo}${returnTo.includes('?') ? '&' : '?'}bienvenue=1`,
    })
    setPending(false)
    if (err) return setError(authErrorMessage(err))
    setSentTo(email)
    track('Account Signup', { step: 'form' })
  }

  if (sentTo) {
    return (
      <FormNotice tone="info">
        <strong className="font-semibold">Regarde ta boîte mail.</strong> On a envoyé un lien de confirmation à {sentTo}. Clique
        dessus pour ouvrir ton compte (pense aux indésirables si tu ne le vois pas).
      </FormNotice>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate={false}>
      {error ? <FormNotice tone="error">{error}</FormNotice> : null}
      <TextField id={`${id}-name`} name="name" label="Ton prénom" autoComplete="given-name" required maxLength={60} />
      <TextField id={`${id}-email`} name="email" label="Ton e-mail" type="email" autoComplete="email" inputMode="email" required />
      <TextField
        id={`${id}-pw`}
        name="password"
        label="Mot de passe"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        maxLength={128}
        hint="8 caractères au moins."
      />
      <SubmitButton pending={pending}>
        <span className="xs:hidden">Créer mon compte</span>
        <span className="hidden xs:inline">Créer mon compte gratuit</span>
      </SubmitButton>
      <p className="m-0 text-sm text-ink-2">
        Déjà un compte ?{' '}
        <Link href={`/compte/connexion?retour=${encodeURIComponent(returnTo)}`} className="font-semibold text-orange-ink underline underline-offset-2">
          Se connecter
        </Link>
      </p>
    </form>
  )
}
