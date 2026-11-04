'use client'

import { useState } from 'react'
import { buttonPrimary, buttonSecondary, errorText, PASSKEY_CANCELLED, type LoginReply } from '@/lib/dashboard/login/client'
import { addPasskey, usePreparedPasskey } from '@/lib/dashboard/login/passkey-client'
import { BackupCodes } from './BackupCodes'
import { LoginError } from './LoginFrame'
import { TotpSetup } from './TotpSetup'

// @cdc tableau de bord — enrôlement guidé après la première connexion par mot de passe : Face ID
// ou application de codes, puis codes de secours. Aucune autre page n'est ouverte avant la fin.

export function EnrollFlow() {
  const [totp, setTotp] = useState(false)
  const [done, setDone] = useState<LoginReply | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const takePrepared = usePreparedPasskey('enrol-cle-options')

  async function passkey() {
    setBusy(true)
    setError('')
    const reply = await addPasskey(await takePrepared())
    if (reply?.ok) {
      setDone(reply)
      return
    }
    if (reply?.error === 'session') {
      window.location.assign('/tableau-de-bord/connexion')
      return
    }
    setError(reply ? errorText(reply.error) : PASSKEY_CANCELLED)
    setBusy(false)
  }

  if (done) {
    const open = () => window.location.assign(done.next ?? '/tableau-de-bord')
    return done.codes ? <BackupCodes codes={done.codes} onDone={open} /> : <button type="button" onClick={open} className={buttonPrimary}>Ouvrir le tableau de bord</button>
  }

  if (totp) {
    return (
      <>
        <TotpSetup onDone={setDone} />
        <button type="button" onClick={() => setTotp(false)} className={`${buttonSecondary} mt-2`}>
          Revenir à Face ID
        </button>
      </>
    )
  }

  return (
    <>
      <button type="button" onClick={passkey} disabled={busy} className={buttonPrimary}>
        Créer une clé Face ID
      </button>
      <LoginError>{error}</LoginError>
      <button type="button" onClick={() => setTotp(true)} disabled={busy} className={`${buttonSecondary} mt-2`}>
        Utiliser une application de codes
      </button>
    </>
  )
}
