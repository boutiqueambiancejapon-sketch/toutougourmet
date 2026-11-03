import type { ReactNode } from 'react'
import { AccountNav } from './AccountNav'
import { PlanBadge } from './PlanBadge'

// @cdc compte — gabarit de l'espace compte (rendu serveur) : en-tête avec l'initiale et la formule,
// navigation (onglets en haut sur téléphone, colonne à gauche sur ordinateur), contenu de la page.

interface AccountShellProps {
  name: string
  email: string
  premium: boolean
  children: ReactNode
}

export function AccountShell({ name, email, premium, children }: AccountShellProps) {
  const initial = name.trim().charAt(0).toLocaleUpperCase('fr-FR') || '?'
  return (
    <div className="v2 mx-auto flex w-full max-w-page flex-col gap-4 px-4 pt-4 pb-16 md:gap-8 md:px-8 md:pt-8">
      <header className="flex flex-wrap items-center gap-3 rounded-card border border-line bg-paper p-4 md:gap-4 md:p-5">
        <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-pill bg-orange font-display text-2xl font-black text-ink">
          {initial}
        </span>
        <div className="flex min-w-0 flex-1 basis-32 flex-col">
          <p className="m-0 font-display text-xl font-black leading-tight text-ink md:text-2xl">{`Bonjour ${name}`}</p>
          <p className="m-0 truncate text-sm text-ink-2">{email}</p>
        </div>
        <PlanBadge premium={premium} />
      </header>
      <div className="flex flex-col gap-6 md:grid md:grid-cols-4 md:items-start md:gap-8">
        <AccountNav />
        <div className="flex min-w-0 flex-col gap-6 md:col-span-3">{children}</div>
      </div>
    </div>
  )
}
