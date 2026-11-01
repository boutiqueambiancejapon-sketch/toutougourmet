import type { ReactNode } from 'react'

// @cdc seo-geo §2.7 — section « Que faire si… » : étapes numérotées, rendues côté serveur.
// Le H2 en question reste dans le MDX ; ce composant met les étapes en forme.
// role="list" : Safari retire la sémantique de liste quand list-style vaut none.

export function WhatToDo({ children }: { children: ReactNode }) {
  return (
    <ol role="list" className="v2 my-6 flex list-none flex-col gap-3 p-0 [counter-reset:step]">
      {children}
    </ol>
  )
}

interface StepProps {
  /** L'action à l'impératif : « Appelle ton vétérinaire ». */
  title: string
  /** Étape d'appel ou d'urgence : mise en avant en rose. */
  urgent?: boolean
  children?: ReactNode
}

export function Step({ title, urgent = false, children }: StepProps) {
  return (
    <li
      className={`flex gap-3 rounded-box border p-4 [counter-increment:step] ${
        urgent ? 'border-rose bg-rose-bg' : 'border-line bg-paper'
      }`}
    >
      <span
        aria-hidden="true"
        className={`grid size-8 shrink-0 place-items-center rounded-pill text-sm font-semibold before:content-[counter(step)] ${
          urgent ? 'bg-rose-ink text-paper' : 'bg-ink text-cream'
        }`}
      />
      <div className="flex min-w-0 flex-col gap-1">
        <p className="font-semibold leading-snug text-ink">{title}</p>
        {children && (
          <div className="text-ink-2 [&_a]:text-orange-ink [&_a]:underline [&_a]:underline-offset-2 [&_p+p]:mt-2 [&_strong]:text-ink">
            {children}
          </div>
        )}
      </div>
    </li>
  )
}
