'use client'

import Link from 'next/link'
import { useEffect, useId, useState } from 'react'
import { ProductPhoto } from './ProductPhoto'
import { ScoreBadge } from './ScoreBadge'

// @cdc scanner — chercher un produit par son nom quand le paquet n'est pas sous la main. Après
// 250 ms sans frappe, 8 fiches au plus. Rien trouvé : la photo de l'étiquette crée la fiche.

interface Found {
  slug: string
  name: string
  score: number | null
  imageUrl?: string | null
}

export function ProductSearch({ onPhoto }: { onPhoto: () => void }) {
  const id = useId()
  const [query, setQuery] = useState('')
  const [found, setFound] = useState<{ query: string; items: Found[] } | null>(null)
  const q = query.trim()

  useEffect(() => {
    if (q.length < 2) return
    const ctrl = new AbortController()
    const t = window.setTimeout(() => {
      fetch(`/api/scanner/recherche?q=${encodeURIComponent(q)}`, { cache: 'no-store', signal: ctrl.signal })
        .then(async (res) => (res.ok ? ((await res.json()) as { items: Found[] }).items : []))
        .then((items) => setFound({ query: q, items }))
        .catch(() => undefined)
    }, 250)
    return () => {
      window.clearTimeout(t)
      ctrl.abort()
    }
  }, [q])

  const items = found && found.query === q && q.length >= 2 ? found.items : null
  return (
    <div className="flex min-w-0 flex-col gap-2 border-t border-cream/25 pt-3">
      <label htmlFor={id} className="text-sm font-semibold">
        Ou cherche un produit par son nom
      </label>
      <input
        id={id}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoComplete="off"
        maxLength={80}
        placeholder="ex. Edgard Cooper poulet"
        className="h-12 w-full min-w-0 rounded-control border-2 border-ink bg-paper px-4 text-base text-ink outline-none focus-visible:ring-4 focus-visible:ring-orange"
      />
      {items && items.length > 0 ? (
        <ul role="list" aria-label="Produits trouvés" className="m-0 flex list-none flex-col divide-y divide-line rounded-box bg-paper p-0 px-3 text-ink">
          {items.map((f) => (
            <li key={f.slug}>
              <Link href={`/croquettes/${f.slug}`} className="flex min-h-14 items-center gap-3 py-2 text-ink no-underline">
                <ProductPhoto src={f.imageUrl} />
                <ScoreBadge score={f.score} />
                <span className="min-w-0 text-[15px] leading-snug [overflow-wrap:anywhere]">{f.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      {items && items.length === 0 ? (
        <div className="flex flex-col gap-2 rounded-box bg-paper p-3 text-ink">
          <p className="m-0 text-[15px]">Pas encore analysé. Prends l&apos;étiquette en photo : la fiche servira aussi aux suivants.</p>
          <button type="button" onClick={onPhoto} className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-control bg-ink px-4 font-semibold text-cream">
            Prendre l&apos;étiquette en photo
          </button>
        </div>
      ) : null}
    </div>
  )
}
