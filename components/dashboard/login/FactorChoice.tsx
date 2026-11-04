'use client'

import { useState } from 'react'
import { buttonPrimary, errorText, linkButton, PASSKEY_CANCELLED, type LoginReply } from '@/lib/dashboard/login/client'
import { signInWithPasskey, usePreparedPasskey } from '@/lib/dashboard/login/passkey-client'
import { CodeForm } from './CodeForm'
import { LoginError } from './LoginFrame'

// @cdc tableau de bord — second facteur : clé d'accès d'abord si elle existe, puis code de
// l'application, puis code de secours.

type Mode = 'passkey' | 'totp' | 'backup'

interface FactorChoiceProps {
  hasPasskey: boolean
  hasTotp: boolean
  next: string
}

function go(reply: LoginReply): void {
  window.location.assign(reply.next ?? '/tableau-de-bord')
}

export function FactorChoice({ hasPasskey, hasTotp, next }: FactorChoiceProps) {
  const [mode, setMode] = useState<Mode>(hasPasskey ? 'passkey' : hasTotp ? 'totp' : 'backup')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const takePrepared = usePreparedPasskey('cle-options', hasPasskey)

  async function passkey() {
    setBusy(true)
    setError('')
    const reply = await signInWithPasskey(await takePrepared(), next)
    if (reply?.ok) {
      go(reply)
      return
    }
    if (reply?.next) {
      window.location.assign(reply.next)
      return
    }
    setError(reply ? errorText(reply.error) : PASSKEY_CANCELLED)
    setBusy(false)
  }

  return (
    <>
      {mode === 'passkey' ? (
        <>
          <button type="button" onClick={passkey} disabled={busy} className={buttonPrimary}>
            Continuer avec Face ID
          </button>
          <LoginError>{error}</LoginError>
        </>
      ) : null}
      {mode === 'totp' ? <CodeForm action="code" label="Code à 6 chiffres" numeric submitLabel="Valider le code" extra={{ next }} onDone={go} /> : null}
      {mode === 'backup' ? <CodeForm action="secours" label="Code de secours" submitLabel="Valider le code" extra={{ next }} onDone={go} /> : null}
      <p className="m-0 mt-3 flex flex-wrap gap-x-4">
        {hasPasskey && mode !== 'passkey' ? (
          <button type="button" onClick={() => setMode('passkey')} className={linkButton}>
            Clé d’accès
          </button>
        ) : null}
        {hasTotp && mode !== 'totp' ? (
          <button type="button" onClick={() => setMode('totp')} className={linkButton}>
            Code à 6 chiffres
          </button>
        ) : null}
        {mode !== 'backup' ? (
          <button type="button" onClick={() => setMode('backup')} className={linkButton}>
            Code de secours
          </button>
        ) : null}
      </p>
    </>
  )
}
