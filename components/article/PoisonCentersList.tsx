'use client'

import { POISON_COUNTRIES } from '@/data/poison-centers'
import { usePoisonCountry } from '@/lib/use-poison-country'

// @cdc urgences — numéros du pays du visiteur, avec onglets France / Belgique / Canada.
// Rendu serveur en France (indexé), puis pays détecté côté navigateur.
export function PoisonCentersList({ callLabel }: { callLabel: string }) {
  const [country, choose] = usePoisonCountry()
  const current = POISON_COUNTRIES.find((c) => c.code === country) ?? POISON_COUNTRIES[0]
  return (
    <>
      <div role="group" aria-label="Pays" className="flex gap-1 rounded-control bg-paper p-1">
        {POISON_COUNTRIES.map((c) => (
          <button
            key={c.code}
            type="button"
            aria-pressed={c.code === current.code}
            onClick={() => choose(c.code)}
            className="min-h-10 flex-1 rounded-control px-2 text-sm font-semibold text-ink-2 aria-pressed:bg-ink aria-pressed:text-cream"
          >
            {c.label}
          </button>
        ))}
      </div>
      <ul role="list" className="m-0 flex list-none flex-col gap-2 p-0">
        {current.centers.map((c) => (
          <li key={c.tel}>
            <a
              href={`tel:${c.tel}`}
              className="flex min-h-14 flex-col gap-2 rounded-box border border-line bg-paper px-4 py-3 no-underline md:flex-row md:items-center md:gap-3"
            >
              <span className="flex min-w-0 grow flex-col">
                <span className="font-semibold text-ink">
                  {c.name} · {c.city}
                  {c.hours ? ` · ${c.hours}` : ''}
                </span>
                <span className="text-xs text-ink-2">{c.fullName}</span>
                {c.note ? <span className="text-xs font-semibold text-rose-ink">{c.note}</span> : null}
              </span>
              <span className="flex shrink-0 items-baseline justify-between gap-3 md:block md:text-right">
                <span className="block whitespace-nowrap font-display text-xl font-black tabular-nums text-ink">{c.phone}</span>
                <span className="block text-sm font-semibold text-orange-ink">{callLabel}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      {current.advice ? <p className="m-0 text-sm text-ink-2">{current.advice}</p> : null}
    </>
  )
}
