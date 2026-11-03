'use client'

import { useState, type KeyboardEvent } from 'react'
import { IconClose } from '@/components/icons'
import { ALLERGIES_MAX, ALLERGY_LENGTH, COMMON_ALLERGIES, uniqueAllergies } from '@/lib/dog-allergies'
import { FieldError } from './fields'

// @cdc profil chien — allergies en étiquettes : ajout au clavier (Entrée ou virgule) ou par les
// suggestions courantes, retrait d'un clic. Chaque étiquette part dans un champ caché « allergies »,
// revalidé par le serveur (lib/server/dog-form.ts).

interface AllergyFieldProps {
  id: string
  value: string[]
  onChange: (value: string[]) => void
  error?: string
  /** Nom des champs cachés ; absent : rien n'est envoyé par le formulaire (état géré par le parent) */
  name?: string
  label?: string
  hint?: string
}

export function AllergyField({ id, value, onChange, error, name, label = 'Allergies ou intolérances connues', hint }: AllergyFieldProps) {
  const [text, setText] = useState('')
  const full = value.length >= ALLERGIES_MAX
  const has = new Set(value.map((a) => a.toLocaleLowerCase('fr')))
  const common = COMMON_ALLERGIES.filter((a) => !has.has(a))

  function add(raw: string) {
    const next = uniqueAllergies([...value, ...raw.split(',')]).slice(0, ALLERGIES_MAX)
    onChange(next)
    setText('')
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (text.trim()) add(text)
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>
      {value.length > 0 ? (
        <ul role="list" aria-label="Allergies ajoutées" className="m-0 flex list-none flex-wrap gap-2 p-0">
          {value.map((a) => (
            <li key={a} className="inline-flex min-h-11 items-center gap-1 rounded-pill bg-rose-bg pl-3 text-base text-rose-ink">
              {a}
              {name ? <input type="hidden" name={name} value={a} /> : null}
              <button
                type="button"
                onClick={() => onChange(value.filter((x) => x !== a))}
                aria-label={`Retirer ${a}`}
                className="inline-flex size-11 items-center justify-center rounded-pill text-rose-ink hover:bg-rose"
              >
                <IconClose className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="flex min-w-0 gap-2">
        <input
          id={id}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
          maxLength={ALLERGY_LENGTH}
          disabled={full}
          placeholder={full ? `${ALLERGIES_MAX} au plus` : 'ex. bœuf'}
          aria-describedby={`${id}-hint`}
          aria-invalid={error ? true : undefined}
          className="h-12 w-full min-w-0 flex-1 rounded-control border-2 border-ink bg-paper px-4 text-base text-ink outline-none placeholder:text-ink-2 focus-visible:ring-4 focus-visible:ring-amber disabled:opacity-60 aria-[invalid=true]:border-orange-ink"
        />
        <button
          type="button"
          onClick={() => add(text)}
          disabled={full || !text.trim()}
          className="min-h-12 shrink-0 whitespace-nowrap rounded-control border-2 border-ink bg-paper px-4 text-base font-semibold text-ink hover:underline disabled:opacity-60"
        >
          Ajouter
        </button>
      </div>
      <p id={`${id}-hint`} className="m-0 text-sm text-ink-2">
        {hint ?? 'Facultatif. Le scanner te prévient quand une composition en contient.'}
      </p>
      {common.length > 0 && !full ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-ink-2">Souvent citées :</span>
          {common.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => add(a)}
              className="min-h-11 whitespace-nowrap rounded-pill border border-line-2 bg-cream px-3 text-sm font-semibold text-ink hover:border-ink"
            >
              {`+ ${a}`}
            </button>
          ))}
        </div>
      ) : null}
      <FieldError id={`${id}-err`} message={error} />
    </div>
  )
}
