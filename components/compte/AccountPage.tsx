import Link from 'next/link'
import type { ReactNode } from 'react'
import { IconChevron, IconPaw } from '@/components/icons'

// @cdc lot 4 — gabarit des pages de compte sans session (connexion, inscription, mot de passe,
// au revoir) : une carte centrée, rendue serveur. Les pages connectées passent par
// components/compte/espace/AccountShell.tsx.

interface AccountPageProps {
  title: string
  lead?: ReactNode
  back?: { href: string; label: string }
  /** Bloc posé à droite de la carte (sous la carte sur téléphone), ex. bénéfices de l'inscription */
  aside?: ReactNode
  children: ReactNode
}

export function AccountPage({ title, lead, back, aside, children }: AccountPageProps) {
  return (
    <div className={`v2 mx-auto grid w-full gap-6 px-4 pt-6 pb-16 md:pt-12 ${aside ? 'max-w-4xl md:grid-cols-2 md:items-start' : 'max-w-md'}`}>
      <div className="flex w-full flex-col gap-5 rounded-card border border-line bg-paper p-4 sm:p-6 md:p-8">
        <header className="flex flex-col gap-3">
          {back ? (
            <Link href={back.href} className="inline-flex min-h-11 items-center gap-1 self-start text-sm font-semibold text-orange-ink no-underline hover:underline">
              <IconChevron className="size-4 rotate-180" />
              {back.label}
            </Link>
          ) : null}
          <span aria-hidden="true" className="flex size-12 items-center justify-center rounded-pill bg-amber text-ink">
            <IconPaw className="size-6" />
          </span>
          <h1 className="m-0 font-display text-3xl font-black leading-tight tracking-tight text-ink">{title}</h1>
          {lead ? <div className="m-0 text-base leading-relaxed text-ink-2 [&_p]:m-0">{lead}</div> : null}
        </header>
        {children}
      </div>
      {aside}
    </div>
  )
}

/** Bloc qui porte un formulaire dans la carte. */
export function AccountCard({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <section aria-label={label} className="flex flex-col gap-4">
      {children}
    </section>
  )
}

/** Garde seulement les chemins internes pour ?retour= (pas d'URL externe, pas de //hôte). */
export function safeReturnPath(value: string | string[] | undefined, fallback = '/compte'): string {
  const v = Array.isArray(value) ? value[0] : value
  return v && v.startsWith('/') && !v.startsWith('//') && !v.startsWith('/\\') ? v : fallback
}
