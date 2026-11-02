'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSyncExternalStore } from 'react'
import { hasSessionHint } from '@/lib/account-hint'

// @cdc premium — invitation discrète à créer un compte (une seule par page). Masquée quand un
// compte est connecté (témoin tg_compte), donc rendue côté navigateur : la page reste statique.
// `retour` : où revenir après l'inscription (par défaut la page courante, ?retour= respecté).

const noop = () => () => {}

interface AccountInviteProps {
  title: string
  text: string
  cta?: string
  retour?: string
  /** Emplacement mesuré : data-cta="invite-<place>" */
  place: string
}

export function AccountInvite({ title, text, cta = 'Créer mon compte', retour, place }: AccountInviteProps) {
  const pathname = usePathname()
  const signedIn = useSyncExternalStore(noop, hasSessionHint, () => true)
  if (signedIn) return null
  const back = retour ?? pathname
  return (
    <aside aria-label={title} data-cta={`invite-${place}`} className="v2 flex flex-col gap-2 rounded-box border border-line bg-cream-2 p-4">
      <p className="m-0 font-display text-lg font-black leading-tight text-ink">{title}</p>
      <p className="m-0 text-[15px] leading-relaxed text-ink-2">{text}</p>
      <p className="m-0 flex flex-wrap items-center gap-x-4 gap-y-1">
        <Link href={`/compte/inscription?retour=${encodeURIComponent(back)}`} className="inline-flex min-h-11 items-center font-semibold text-orange-ink underline underline-offset-2">
          {cta}
        </Link>
        <Link href={`/compte/connexion?retour=${encodeURIComponent(back)}`} className="inline-flex min-h-11 items-center text-sm text-ink-2 underline underline-offset-2">
          J&apos;ai déjà un compte
        </Link>
      </p>
    </aside>
  )
}
