'use client'

import { useId, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CategoryIcon, IconChevron, IconSearch, VerdictIcon, type VerdictKind } from '@/components/icons'

// @cdc 04-pages — recherche du hub Guides (audit design 2026-11-02, hub Guides) : filtre côté
// navigateur une liste titre + lien fournie par le serveur (chaque mot cherché doit commencer
// un mot du titre). Entrée = premier résultat.
export interface GuideEntry {
  title: string
  href: string
  category: string
  verdict?: VerdictKind
}

const MAX_SHOWN = 8
const STOP = new Set(['le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'et', 'au', 'aux', 'mon', 'ma', 'mes', 'son', 'sa', 'ses', 'ton', 'ta', 'il', 'ils', 'elle', 'peut', 'peuvent', 'manger', 'mange', 'chien', 'chiens', 'que', 'quoi', 'est'])

const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()

function termsOf(query: string): string[] {
  return normalize(query)
    .split(' ')
    .filter((t) => t.length > 1 && !STOP.has(t))
    .map((t) => (t.length > 3 && t.endsWith('s') ? t.slice(0, -1) : t))
}

export function GuideSearch({ guides }: { guides: GuideEntry[] }) {
  const id = useId()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const terms = termsOf(query)
  const results =
    terms.length === 0
      ? []
      : guides
          .filter((g) => {
            const words = normalize(g.title).split(' ')
            return terms.every((t) => words.some((w) => w.startsWith(t)))
          })
          .sort((a, b) => a.title.length - b.title.length)

  return (
    <div className="v2 flex flex-col gap-3">
      <form
        role="search"
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (results[0]) router.push(results[0].href)
        }}
      >
        <label htmlFor={id} className="text-[15px] font-semibold text-ink">
          Un aliment, une question
        </label>
        <span className="relative block">
          <IconSearch className="pointer-events-none absolute top-1/2 left-4 size-6 -translate-y-1/2 text-ink" />
          <input
            id={id}
            type="search"
            autoComplete="off"
            enterKeyHint="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Chocolat, fraise, croquettes…"
            className="min-h-14 w-full rounded-box border-2 border-ink bg-paper pr-4 pl-13 text-lg text-ink outline-none placeholder:text-ink-3 focus-visible:ring-4 focus-visible:ring-amber"
          />
        </span>
      </form>
      {terms.length > 0 ? (
        <div aria-live="polite" className="flex flex-col gap-2">
          <p className="m-0 text-sm text-ink-2">
            {results.length === 0
              ? 'Aucun guide ne correspond. Essaie un seul mot, par exemple « raisin ».'
              : `${results.length} guide${results.length > 1 ? 's' : ''}${results.length > MAX_SHOWN ? `, les ${MAX_SHOWN} plus proches` : ''}`}
          </p>
          {results.length > 0 ? (
            <ul role="list" className="m-0 flex list-none flex-col rounded-box border border-line bg-paper p-0">
              {results.slice(0, MAX_SHOWN).map((g) => (
                <li key={g.href} className="border-b border-line last:border-b-0">
                  <Link href={g.href} className="group flex min-h-12 items-center gap-3 px-4 py-2.5 text-ink no-underline">
                    {g.verdict ? <VerdictIcon verdict={g.verdict} className="size-5" /> : <CategoryIcon slug={g.category} className="size-5" />}
                    <span className="grow leading-snug group-hover:underline">{g.title}</span>
                    <IconChevron className="size-4 text-ink-2" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
