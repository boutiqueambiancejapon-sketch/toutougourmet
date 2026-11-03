'use client'

import type { ReactNode } from 'react'
import { FieldError } from '@/components/compte/fields'
import type { SheetDraft } from '@/lib/garde/draft'
import type { SheetErrors } from '@/lib/garde/sheet'

// @cdc fiche de garde — briques communes des blocs du formulaire (même dessin que les champs
// du compte : bordure encre, cibles de 44 px au moins).

export interface PartProps {
  id: string
  v: SheetDraft
  set: <K extends keyof SheetDraft>(key: K, value: SheetDraft[K]) => void
  err: SheetErrors
}

export function Fieldset({ legend, hint, children }: { legend: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset className="m-0 flex min-w-0 flex-col gap-4 border-0 border-t border-line p-0 pt-4 first:border-t-0 first:pt-0">
      <legend className="float-left mb-1 w-full p-0">
        <span className="block font-display text-xl font-black leading-tight text-ink">{legend}</span>
        {hint ? <span className="mt-1 block text-sm text-ink-2">{hint}</span> : null}
      </legend>
      {children}
    </fieldset>
  )
}

interface AreaProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  maxLength: number
  placeholder?: string
  hint?: string
  error?: string
}

export function AreaField({ id, label, value, onChange, maxLength, placeholder, hint, error }: AreaProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
        {hint ? <span className="font-normal text-ink-2">{` (${hint})`}</span> : null}
      </label>
      <textarea
        id={id}
        rows={2}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        className="min-h-12 w-full min-w-0 rounded-control border-2 border-ink bg-paper px-4 py-2.5 text-base text-ink outline-none placeholder:text-ink-3 focus-visible:ring-4 focus-visible:ring-amber"
      />
      <FieldError id={`${id}-err`} message={error} />
    </div>
  )
}

export function TwoCols({ children }: { children: ReactNode }) {
  return <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
}
