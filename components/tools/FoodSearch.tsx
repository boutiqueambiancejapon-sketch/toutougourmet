'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { track } from '@/lib/analytics'
import { IconChevron, IconSearch, VerdictIcon } from '@/components/icons'
import type { FoodVerdict } from '@/lib/food-verdicts'

// @cdc 04-pages — « Mon chien peut-il manger… ? » (audit design-CRO, §3 Accueil) : filtre côté
// navigateur la liste des aliments classés (getFoodVerdicts, fournie par le serveur).
// Entrée = premier résultat. Événement « Food Search » à la validation, au clic, ou 1,5 s
// après la dernière frappe ; une seule fois par requête.
type Food = Pick<FoodVerdict, 'label' | 'href' | 'verdict'>

const MAX_SHOWN = 6
const IDLE_MS = 1500
const VERDICT: Record<Food['verdict'], { text: string; tone: string }> = {
  oui: { text: 'Oui', tone: 'bg-green-bg text-green-ink' },
  moderation: { text: 'Avec modération', tone: 'bg-amber-bg text-amber-ink' },
  danger: { text: 'Dangereux', tone: 'bg-rose-bg text-rose-ink' },
}

const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()

function search(foods: Food[], query: string): Food[] {
  const q = normalize(query)
  if (q.length < 2) return []
  const rank = (f: Food) => {
    const label = normalize(f.label)
    if (label.startsWith(q)) return 0
    return label.split(' ').some((w) => w.startsWith(q)) ? 1 : -1
  }
  return foods
    .map((f) => ({ f, r: rank(f) }))
    .filter((x) => x.r >= 0)
    .sort((a, b) => a.r - b.r || a.f.label.length - b.f.label.length)
    .map((x) => x.f)
}

interface FoodSearchProps {
  foods: Food[]
  /** Exemples affichés dans le champ vide (par défaut : aliments de l'accueil) */
  placeholder?: string
}

export function FoodSearch({ foods, placeholder = 'Raisin, banane, fromage…' }: FoodSearchProps) {
  const id = useId()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const tracked = useRef('')
  const results = search(foods, query)
  const q = normalize(query)

  const report = (value: string, found: boolean) => {
    const key = normalize(value)
    if (key.length < 2 || tracked.current === key) return
    tracked.current = key
    track('Food Search', { query: key, found })
  }

  useEffect(() => {
    if (q.length < 2) return
    const timer = setTimeout(() => report(q, results.length > 0), IDLE_MS)
    return () => clearTimeout(timer)
  })

  return (
    <div className="flex flex-col gap-3">
      <form
        role="search"
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          report(query, results.length > 0)
          if (results[0]) router.push(results[0].href)
        }}
      >
        <label htmlFor={id} className="text-[15px] font-semibold text-ink">
          Tape un aliment
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
            placeholder={placeholder}
            className="min-h-14 w-full rounded-box border-2 border-ink bg-paper pr-4 pl-13 text-lg text-ink outline-none placeholder:text-ink-3 focus-visible:ring-4 focus-visible:ring-amber"
          />
        </span>
      </form>
      <div aria-live="polite">
        {q.length >= 2 && results.length === 0 ? (
          <p className="m-0 text-[15px] text-ink">
            {'Pas encore de guide sur cet aliment. '}
            <Link href="/chien/peut-manger" className="font-semibold text-orange-ink">
              Voir tous les aliments classés
            </Link>
          </p>
        ) : null}
        {results.length > 0 ? (
          <ul role="list" className="m-0 flex list-none flex-col rounded-box border border-line bg-paper p-0">
            {results.slice(0, MAX_SHOWN).map((f) => (
              <li key={f.href} className="border-b border-line last:border-b-0">
                <Link
                  href={f.href}
                  onClick={() => report(query, true)}
                  className="group flex min-h-12 items-center gap-3 px-4 py-2 text-ink no-underline"
                >
                  <VerdictIcon verdict={f.verdict} className="size-5 shrink-0" />
                  <span className="grow font-semibold leading-snug group-hover:underline">{f.label}</span>
                  <span className={`shrink-0 rounded-pill px-2.5 py-0.5 text-xs font-semibold ${VERDICT[f.verdict].tone}`}>
                    {VERDICT[f.verdict].text}
                  </span>
                  <IconChevron className="size-4 shrink-0 text-ink-2" />
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
}
