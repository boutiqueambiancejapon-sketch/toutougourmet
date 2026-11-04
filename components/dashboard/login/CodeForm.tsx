'use client'

import { useId, useState, type FormEvent } from 'react'
import { buttonPrimary, callLogin, errorText, fieldClass, type LoginReply } from '@/lib/dashboard/login/client'
import { LoginError } from './LoginFrame'

// @cdc tableau de bord — un champ, un bouton : code à 6 chiffres ou code de secours.

interface CodeFormProps {
  action: string
  label: string
  numeric?: boolean
  submitLabel: string
  extra?: Record<string, unknown>
  onDone: (reply: LoginReply) => void
}

export function CodeForm({ action, label, numeric = false, submitLabel, extra, onDone }: CodeFormProps) {
  const id = useId()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    setBusy(true)
    setError('')
    const reply = await callLogin(action, { ...extra, code: new FormData(form).get('code') })
    if (reply.ok) {
      onDone(reply)
      return
    }
    // Trop d'échecs sur cette session : retour au mot de passe.
    if (reply.next) {
      window.location.assign(reply.next)
      return
    }
    setError(errorText(reply.error))
    setBusy(false)
    form.reset()
  }

  return (
    <form onSubmit={submit}>
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      <input
        id={id}
        name="code"
        required
        autoCapitalize="characters"
        autoComplete={numeric ? 'one-time-code' : 'off'}
        inputMode={numeric ? 'numeric' : 'text'}
        pattern={numeric ? '[0-9]{6}' : undefined}
        maxLength={numeric ? 6 : 13}
        spellCheck={false}
        className={`${fieldClass} tracking-widest`}
      />
      <LoginError>{error}</LoginError>
      <button type="submit" disabled={busy} className={`${buttonPrimary} mt-4`}>
        {submitLabel}
      </button>
    </form>
  )
}
