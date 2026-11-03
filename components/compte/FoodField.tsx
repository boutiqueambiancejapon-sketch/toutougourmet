'use client'

import { useEffect, useState } from 'react'
import { FieldError } from './fields'

// @cdc profil chien — « Ce qu'il mange » : texte libre, avec des suggestions tirées des fiches
// /croquettes (GET /api/compte/croquettes, 8 au plus, après 250 ms sans frappe). Choisir une
// suggestion remplit le texte et lie la fiche (foodSlug) ; retaper le texte délie la fiche.

export interface FoodChoice {
  food: string
  foodSlug: string
}

interface Suggestion {
  slug: string
  name: string
  score: number | null
}

interface FoodFieldProps {
  id: string
  value: FoodChoice
  onChange: (value: FoodChoice) => void
  error?: string
}

export function FoodField({ id, value, onChange, error }: FoodFieldProps) {
  const [items, setItems] = useState<Suggestion[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (query.trim().length < 2) return
    const ctrl = new AbortController()
    const t = window.setTimeout(() => {
      fetch(`/api/compte/croquettes?q=${encodeURIComponent(query)}`, { cache: 'no-store', signal: ctrl.signal })
        .then(async (res) => (res.ok ? ((await res.json()) as { items: Suggestion[] }).items : []))
        .then(setItems)
        .catch(() => undefined)
    }, 250)
    return () => {
      window.clearTimeout(t)
      ctrl.abort()
    }
  }, [query])

  function type(food: string) {
    onChange({ food, foodSlug: '' })
    setQuery(food)
    if (food.trim().length < 2) setItems([])
  }

  function pick(s: Suggestion) {
    onChange({ food: s.name, foodSlug: s.slug })
    setItems([])
    setQuery('')
  }

  const open = query.trim().length >= 2 && items.length > 0
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        Ce qu&apos;il mange
      </label>
      <input
        id={id}
        name="food"
        type="text"
        autoComplete="off"
        value={value.food}
        onChange={(e) => type(e.target.value)}
        maxLength={160}
        placeholder="ex. Franklin Pet Food, adulte poulet"
        aria-describedby={`${id}-hint`}
        aria-invalid={error ? true : undefined}
        className="h-12 w-full min-w-0 rounded-control border-2 border-ink bg-paper px-4 text-base text-ink outline-none placeholder:text-ink-3 focus-visible:ring-4 focus-visible:ring-amber aria-[invalid=true]:border-orange-ink"
      />
      <input type="hidden" name="foodSlug" value={value.foodSlug} />
      <p id={`${id}-hint`} className="m-0 text-sm text-ink-2" aria-live="polite">
        {value.foodSlug ? 'Fiche du produit liée : sa note s’affiche sur le profil.' : 'Facultatif. Tape la marque, puis choisis le produit dans la liste pour lier sa fiche.'}
      </p>
      {open ? (
        <ul role="list" aria-label="Produits trouvés" className="m-0 flex list-none flex-col gap-1 rounded-box border border-line bg-cream p-1">
          {items.map((s) => (
            <li key={s.slug}>
              <button
                type="button"
                onClick={() => pick(s)}
                title={s.name}
                className="flex min-h-11 w-full min-w-0 items-center justify-between gap-2 rounded-control px-3 text-left text-base text-ink hover:bg-paper"
              >
                <span className="min-w-0 truncate">{s.name}</span>
                {s.score !== null ? <span className="shrink-0 text-sm font-semibold text-ink-2">{`${s.score}/100`}</span> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <FieldError id={`${id}-err`} message={error} />
    </div>
  )
}
