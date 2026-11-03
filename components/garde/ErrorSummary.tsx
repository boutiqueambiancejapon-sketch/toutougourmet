'use client'

import { useEffect, useRef, type RefObject } from 'react'
import type { SheetErrors } from '@/lib/garde/sheet'

// @cdc fiche de garde — résumé des erreurs après un envoi incomplet (audit 2026-11-03, E18) :
// chaque message est repris et mène à son champ (attribut name, sinon premier champ en erreur).
// Le résumé prend le focus à chaque envoi refusé.

interface ErrorSummaryProps {
  form: RefObject<HTMLFormElement | null>
  err: SheetErrors
  /** Numéro de l'envoi refusé : change à chaque tentative pour redonner le focus au résumé */
  attempt: number
}

export function ErrorSummary({ form, err, attempt }: ErrorSummaryProps) {
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (attempt > 0) box.current?.focus()
  }, [attempt])

  const fields = Object.entries(err).filter(([key, msg]) => key !== 'form' && msg)
  if (!fields.length && !err.form) return null

  function goTo(key: string) {
    const root = form.current
    const el = root?.querySelector<HTMLElement>(`[name="${key}"]`) ?? root?.querySelector<HTMLElement>('[aria-invalid="true"]')
    el?.focus()
    el?.scrollIntoView({ block: 'center' })
  }

  const title = err.form ?? (fields.length === 1 ? 'Un champ est à corriger :' : `${fields.length} champs sont à corriger :`)
  return (
    <div ref={box} tabIndex={-1} role="alert" className="flex flex-col gap-2 rounded-box border-2 border-orange-ink bg-cream-2 p-4 text-ink outline-none">
      <p className="m-0 font-semibold">{title}</p>
      {fields.length ? (
        <ul role="list" className="m-0 flex list-none flex-col p-0">
          {fields.map(([key, msg]) => (
            <li key={key}>
              <button type="button" onClick={() => goTo(key)} className="min-h-11 text-left font-semibold text-orange-ink underline underline-offset-2">
                {msg}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
