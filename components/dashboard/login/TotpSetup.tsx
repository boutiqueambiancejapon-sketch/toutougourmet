'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { buttonPrimary, callLogin, errorText, type LoginReply } from '@/lib/dashboard/login/client'
import { CodeForm } from './CodeForm'
import { LoginError } from './LoginFrame'

// @cdc tableau de bord — application de codes. Sur l'iPhone qui sert à se connecter, un QR code ne
// se scanne pas : le bouton ouvre le trousseau, et la clé reste copiable à la main.

export function TotpSetup({ onDone }: { onDone: (reply: LoginReply) => void }) {
  const [setup, setSetup] = useState<LoginReply | null>(null)

  useEffect(() => {
    let cancelled = false
    void callLogin('enrol-code-debut').then((reply) => {
      if (!cancelled) setSetup(reply)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!setup) return <p className="m-0 text-sm text-ink-2">Préparation du code…</p>
  if (!setup.ok || !setup.uri || !setup.qr) return <LoginError>{errorText(setup.error)}</LoginError>

  return (
    <div>
      <a href={setup.uri} className={`${buttonPrimary} no-underline`}>
        Ajouter au trousseau
      </a>
      <p className="m-0 mt-3 text-sm text-ink-2">Depuis un autre appareil, scanne ce QR code.</p>
      <Image src={setup.qr} alt="QR code à scanner dans l’application de codes" width={180} height={180} unoptimized className="mx-auto mt-2 rounded-box" />
      <p className="m-0 mt-3 text-sm text-ink-2">Clé à saisir à la main :</p>
      <p className="m-0 mt-1 break-all rounded-box bg-cream-2 px-3 py-2 font-mono text-sm text-ink">{setup.secret}</p>
      <div className="mt-4">
        <CodeForm action="enrol-code-confirmer" label="Code affiché par l’application" numeric submitLabel="Valider le code" onDone={onDone} />
      </div>
    </div>
  )
}
