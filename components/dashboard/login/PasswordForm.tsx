'use client'

import { useEffect, useId, useState, type FormEvent } from 'react'
import { API_PATH, ROOT, stageHref, VERIFY_PATH, type SessionStage } from '@/lib/dashboard/login/policy'
import { buttonPrimary, callLogin, errorText, fieldClass, linkButton } from '@/lib/dashboard/login/client'
import { LoginError } from './LoginFrame'

// @cdc tableau de bord — première étape. Le mot de passe seul n'ouvre rien : la réponse indique
// l'écran suivant, second facteur ou enrôlement.

function withNext(path: string, next: string): string {
  return next === ROOT || path !== VERIFY_PATH ? path : `${path}?suivant=${encodeURIComponent(next)}`
}

export function PasswordForm({ next }: { next: string }) {
  const id = useId()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [shown, setShown] = useState(false)

  // SameSite=Strict : un lien venu de ntfy ou d'un e-mail arrive ici sans le cookie, même connecté.
  // La sonde, partie de cette page, le porte et rattrape ce cas.
  useEffect(() => {
    let cancelled = false
    fetch(`${API_PATH}/etat`, { cache: 'no-store', credentials: 'same-origin' })
      .then((res) => (res.ok ? (res.json() as Promise<{ stage: SessionStage | null }>) : null))
      .then((state) => {
        if (!cancelled && state?.stage) window.location.replace(stageHref(state.stage, next))
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [next])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    const form = new FormData(event.currentTarget)
    const reply = await callLogin('mot-de-passe', { username: form.get('username'), password: form.get('password') })
    if (reply.ok && reply.next) {
      window.location.assign(withNext(reply.next, next))
      return
    }
    setError(errorText(reply.error))
    setBusy(false)
  }

  return (
    <form onSubmit={submit}>
      <label htmlFor={`${id}-user`} className="block text-sm font-semibold text-ink">
        Identifiant
      </label>
      <input id={`${id}-user`} name="username" autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} required className={fieldClass} />
      <label htmlFor={`${id}-pass`} className="mt-3 block text-sm font-semibold text-ink">
        Mot de passe
      </label>
      <input id={`${id}-pass`} name="password" type={shown ? 'text' : 'password'} autoComplete="current-password" autoCapitalize="none" autoCorrect="off" spellCheck={false} required className={fieldClass} />
      <button type="button" onClick={() => setShown((v) => !v)} aria-pressed={shown} className={linkButton}>
        {shown ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
      </button>
      <LoginError>{error}</LoginError>
      <button type="submit" disabled={busy} className={`${buttonPrimary} mt-4`}>
        Continuer
      </button>
    </form>
  )
}
