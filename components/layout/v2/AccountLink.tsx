'use client'

import Link from 'next/link'
import { useSyncExternalStore } from 'react'
import { UserRound } from 'lucide-react'
import { hasSessionHint } from '@/lib/account-hint'

// @cdc lot 4 — lien compte de l'en-tête V2. Lit le témoin de session (cookie non sensible) :
// aucune requête serveur, l'en-tête et les pages publiques restent statiques. Rendu serveur et
// premier rendu : « Se connecter » ; le libellé passe à « Mon compte » une fois hydraté.

const noop = () => () => {}

export function AccountLink() {
  const signedIn = useSyncExternalStore(noop, hasSessionHint, () => false)
  const label = signedIn ? 'Mon compte' : 'Se connecter'
  return (
    <Link
      href={signedIn ? '/compte' : '/compte/connexion'}
      className="ml-auto inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-control px-2 text-[15px] font-semibold text-ink no-underline hover:bg-cream-2 md:px-3"
    >
      <UserRound aria-hidden="true" className="size-5" />
      <span className="sr-only md:not-sr-only">{label}</span>
    </Link>
  )
}
