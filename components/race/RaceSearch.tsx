'use client'

import { useState } from 'react'
import { BREED_SIZES, type BreedSize } from './breed-size'

// Filtre des cartes race côté navigateur. Les cartes sont rendues par le serveur
// (liens indexables) ; la saisie (data-race-name) et le gabarit (data-race-size) se combinent,
// les lettres sans résultat disparaissent de la grille et de l'index A-Z.
const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export function RaceSearch({ gridId, total }: { gridId: string; total: number }) {
  const [query, setQuery] = useState('')
  const [size, setSize] = useState<BreedSize | null>(null)
  const [shown, setShown] = useState(total)

  function apply(nextQuery: string, nextSize: BreedSize | null) {
    setQuery(nextQuery)
    setSize(nextSize)
    const q = normalize(nextQuery.trim())
    let count = 0
    document.querySelectorAll<HTMLElement>(`#${gridId} [data-race-name]`).forEach((el) => {
      const match = normalize(el.dataset.raceName ?? '').includes(q) && (!nextSize || el.dataset.raceSize === nextSize)
      el.hidden = !match
      if (match) count += 1
    })
    document.querySelectorAll<HTMLElement>(`#${gridId} section`).forEach((sec) => {
      const empty = !sec.querySelector('[data-race-name]:not([hidden])')
      sec.hidden = empty
      const link = document.querySelector<HTMLElement>(`a[href="#${sec.id}"]`)
      if (link?.parentElement) link.parentElement.hidden = empty
    })
    setShown(count)
  }

  const chip = (active: boolean) =>
    `inline-flex min-h-11 items-center gap-1.5 rounded-pill border px-4 text-[15px] font-semibold ${
      active ? 'border-ink bg-ink text-cream' : 'border-line bg-paper text-ink hover:border-ink'
    }`

  return (
    <div className="v2 flex flex-col gap-3">
      <div className="flex max-w-[520px] flex-col gap-1.5">
        <label htmlFor="race-q" className="text-sm font-semibold text-ink">Rechercher une race</label>
        <input
          id="race-q"
          type="search"
          autoComplete="off"
          placeholder="Labrador, Berger…"
          value={query}
          onChange={(e) => apply(e.target.value, size)}
          className="min-h-12 rounded-control border border-line bg-paper px-4 text-base text-ink outline-none focus:border-ink"
        />
      </div>
      <div role="group" aria-label="Filtrer par gabarit" className="flex flex-wrap gap-2">
        <button type="button" aria-pressed={size === null} onClick={() => apply(query, null)} className={chip(size === null)}>
          Toutes
        </button>
        {BREED_SIZES.map(([value, label, hint]) => (
          <button
            key={value}
            type="button"
            aria-pressed={size === value}
            onClick={() => apply(query, size === value ? null : value)}
            className={chip(size === value)}
          >
            {label}
            <span className={`text-sm font-normal ${size === value ? 'text-cream/75' : 'text-ink-2'}`}>{hint}</span>
          </button>
        ))}
      </div>
      <p aria-live="polite" className="m-0 text-sm text-ink-2">
        {shown === 0 ? 'Aucune race trouvée.' : `${shown} race${shown > 1 ? 's' : ''}`}
      </p>
    </div>
  )
}
