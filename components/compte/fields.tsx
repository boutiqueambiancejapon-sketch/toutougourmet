'use client'

import type { ReactNode } from 'react'
import { useFormStatus } from 'react-dom'

// @cdc lot 4 — briques des formulaires de compte, même dessin que les outils V2
// (components/outils/fields.tsx) : champ bordé encre, bouton plein, cibles de 44 px au moins.

interface TextFieldProps {
  id: string
  name: string
  label: string
  type?: 'text' | 'email' | 'password' | 'date' | 'number'
  autoComplete?: string
  defaultValue?: string
  value?: string
  onChange?: (value: string) => void
  required?: boolean
  error?: string
  hint?: string
  inputMode?: 'decimal' | 'numeric' | 'email' | 'text'
  min?: string
  max?: string
  step?: string
  maxLength?: number
  minLength?: number
}

export function TextField({ id, label, error, hint, onChange, ...input }: TextFieldProps) {
  const describedBy = [error ? `${id}-err` : null, hint ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>
      <input
        id={id}
        {...input}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className="h-12 w-full min-w-0 max-w-full appearance-none rounded-control border-2 border-ink bg-paper px-4 [&::-webkit-date-and-time-value]:text-left text-base text-ink outline-none placeholder:text-ink-2 focus-visible:ring-4 focus-visible:ring-amber aria-[invalid=true]:border-orange-ink"
      />
      {hint ? (
        <p id={`${id}-hint`} className="m-0 text-sm text-ink-2">
          {hint}
        </p>
      ) : null}
      <FieldError id={`${id}-err`} message={error} />
    </div>
  )
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="m-0 text-sm font-semibold text-orange-ink">
      {message}
    </p>
  )
}

/** Bouton d'envoi : se désactive pendant l'envoi (action serveur ou état local). */
export function SubmitButton({ children, pending, pendingLabel = 'Envoi…' }: { children: ReactNode; pending?: boolean; pendingLabel?: string }) {
  const status = useFormStatus()
  const busy = pending ?? status.pending
  return (
    <button
      type="submit"
      disabled={busy}
      className="min-h-12 rounded-control bg-ink px-5 text-base font-semibold text-cream hover:underline disabled:opacity-60"
    >
      {busy ? pendingLabel : children}
    </button>
  )
}

/** Message d'erreur ou de confirmation en tête de formulaire. */
export function FormNotice({ tone, children }: { tone: 'error' | 'info'; children: ReactNode }) {
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={`m-0 rounded-control px-4 py-3 text-[15px] leading-relaxed text-ink ${tone === 'error' ? 'border-2 border-orange-ink bg-paper' : 'bg-cream-2'}`}
    >
      {children}
    </p>
  )
}
