'use client'

import { useState } from 'react'
import { buttonPrimary, errorText, PASSKEY_CANCELLED } from '@/lib/dashboard/login/client'
import { signInWithPasskey, usePreparedPasskey } from '@/lib/dashboard/login/passkey-client'
import { LoginError } from './LoginFrame'

// @cdc tableau de bord — connexion directe par Face ID, sans mot de passe. Le formulaire du mot de
// passe reste dessous, en secours : autre appareil, clé indisponible.

export function FaceIdFirst({ next }: { next: string }) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const prepared = usePreparedPasskey('cle-directe-options')

  async function signIn() {
    setBusy(true)
    setError('')
    const reply = await signInWithPasskey(await prepared.take(), next, 'cle-directe')
    if (reply?.ok && reply.next) {
      window.location.assign(reply.next)
      return
    }
    if (reply) prepared.refresh()
    setError(reply ? errorText(reply.error) : PASSKEY_CANCELLED)
    setBusy(false)
  }

  return (
    <div className="mb-4 border-b border-line pb-4">
      <button type="button" onClick={signIn} disabled={busy} className={buttonPrimary}>
        Se connecter avec Face ID
      </button>
      <LoginError>{error}</LoginError>
      <p className="m-0 mt-3 text-sm text-ink-2">Autre appareil ou clé indisponible : utilise ton mot de passe.</p>
    </div>
  )
}
