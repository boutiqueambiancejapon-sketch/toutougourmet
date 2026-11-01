'use client'

import { useState } from 'react'

// Filtre des cartes race côté navigateur. Les cartes sont rendues par le serveur
// (liens indexables) ; ce champ masque celles dont data-race-name ne contient pas la saisie.
const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export function RaceSearch({ gridId, total }: { gridId: string; total: number }) {
  const [shown, setShown] = useState(total)

  function onChange(value: string) {
    const q = normalize(value.trim())
    let count = 0
    document.querySelectorAll<HTMLElement>(`#${gridId} [data-race-name]`).forEach((el) => {
      const match = normalize(el.dataset.raceName ?? '').includes(q)
      el.hidden = !match
      if (match) count += 1
    })
    // Masque les lettres sans résultat (titre de section et lien de l'index)
    document.querySelectorAll<HTMLElement>(`#${gridId} section`).forEach((sec) => {
      const empty = !sec.querySelector('[data-race-name]:not([hidden])')
      sec.hidden = empty
      const link = document.querySelector<HTMLElement>(`a[href="#${sec.id}"]`)
      if (link?.parentElement) link.parentElement.hidden = empty
    })
    setShown(count)
  }

  return (
    <div className="v2 flex max-w-[520px] flex-col gap-1.5">
      <label htmlFor="race-q" className="text-sm font-semibold text-ink">Rechercher une race</label>
      <input
        id="race-q"
        type="search"
        autoComplete="off"
        placeholder="Labrador, Berger…"
        onChange={(e) => onChange(e.target.value)}
        className="min-h-12 rounded-control border border-line bg-paper px-4 text-base text-ink outline-none focus:border-ink"
      />
      <p aria-live="polite" className="m-0 text-sm text-ink-2">
        {shown === 0 ? 'Aucune race trouvée.' : `${shown} race${shown > 1 ? 's' : ''}`}
      </p>
    </div>
  )
}
