'use client'

import { useId, useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { FormNotice, SubmitButton, TextField } from './fields'

// @cdc lot 4 — demande de nouveau mot de passe. Réponse identique que l'adresse ait un compte
// ou non : le formulaire ne sert pas à tester des adresses.

export function ForgotPasswordForm() {
  const id = useId()
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)
  const [limited, setLimited] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    setPending(true)
    const { error } = await authClient.requestPasswordReset({
      email: String(data.get('email') ?? '').trim(),
      redirectTo: '/compte/nouveau-mot-de-passe',
    })
    setPending(false)
    if (error?.status === 429) return setLimited(true)
    setDone(true)
  }

  if (done) {
    return (
      <FormNotice tone="info">
        Si un compte existe avec cette adresse, un lien pour choisir un nouveau mot de passe vient de partir. Il reste valable une
        heure.
      </FormNotice>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {limited ? <FormNotice tone="error">Trop de demandes. Attends quelques minutes avant de réessayer.</FormNotice> : null}
      <TextField id={`${id}-email`} name="email" label="Ton e-mail" type="email" autoComplete="email" inputMode="email" required />
      <SubmitButton pending={pending}>Recevoir le lien</SubmitButton>
    </form>
  )
}
