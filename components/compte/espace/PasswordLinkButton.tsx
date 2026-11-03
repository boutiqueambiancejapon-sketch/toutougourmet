'use client'

import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { FormNotice } from '../fields'
import { btnOutline } from './ui'

// @cdc compte — changement de mot de passe depuis les réglages : même lien par e-mail que
// « Mot de passe oublié » (Better Auth requestPasswordReset), envoyé à l'adresse du compte.

type Status = 'idle' | 'pending' | 'sent' | 'limited'

export function PasswordLinkButton({ email }: { email: string }) {
  const [status, setStatus] = useState<Status>('idle')

  async function send() {
    setStatus('pending')
    const { error } = await authClient.requestPasswordReset({ email, redirectTo: '/compte/nouveau-mot-de-passe' })
    setStatus(error?.status === 429 ? 'limited' : 'sent')
  }

  if (status === 'sent') {
    return <FormNotice tone="info">{`Lien envoyé à ${email}. Il reste valable une heure.`}</FormNotice>
  }
  return (
    <div className="flex flex-col gap-2">
      {status === 'limited' ? <FormNotice tone="error">Trop de demandes. Attends quelques minutes avant de réessayer.</FormNotice> : null}
      <button type="button" onClick={send} disabled={status === 'pending'} className={`${btnOutline} disabled:opacity-60`}>
        {status === 'pending' ? 'Envoi…' : 'Recevoir le lien'}
      </button>
    </div>
  )
}
