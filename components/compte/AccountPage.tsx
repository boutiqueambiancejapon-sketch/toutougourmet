import Link from 'next/link'
import type { ReactNode } from 'react'

// @cdc lot 4 — gabarit des pages /compte (rendu serveur) : lien retour, H1, chapô, contenu.
// Colonne étroite : ce sont des formulaires, lus surtout sur téléphone.

interface AccountPageProps {
  title: string
  lead?: ReactNode
  back?: { href: string; label: string }
  children: ReactNode
}

export function AccountPage({ title, lead, back, children }: AccountPageProps) {
  return (
    <div className="v2 mx-auto flex w-full max-w-[34rem] flex-col gap-6 px-4 pt-6 pb-16 md:pt-10">
      <header className="flex flex-col gap-2">
        {back ? (
          <Link href={back.href} className="self-start text-sm font-semibold text-orange-ink underline underline-offset-2">
            {`← ${back.label}`}
          </Link>
        ) : null}
        <h1 className="m-0 font-display text-[clamp(1.75rem,4.2vw,2.25rem)] font-black leading-[1.08] tracking-tight text-ink">{title}</h1>
        {lead ? <div className="m-0 text-base leading-relaxed text-ink-2 [&_p]:m-0">{lead}</div> : null}
      </header>
      {children}
    </div>
  )
}

/** Carte blanche qui porte un formulaire ou une liste. */
export function AccountCard({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <section aria-label={label} className="flex flex-col gap-4 rounded-card border border-line bg-paper p-4 sm:p-6">
      {children}
    </section>
  )
}

/** Garde seulement les chemins internes pour ?retour= (pas d'URL externe, pas de //hôte). */
export function safeReturnPath(value: string | string[] | undefined, fallback = '/compte'): string {
  const v = Array.isArray(value) ? value[0] : value
  return v && v.startsWith('/') && !v.startsWith('//') && !v.startsWith('/\\') ? v : fallback
}
