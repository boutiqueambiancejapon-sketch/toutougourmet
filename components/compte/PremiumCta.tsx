'use client'

import Link from 'next/link'
import { useSyncExternalStore } from 'react'
import { hasSessionHint } from '@/lib/account-hint'

// @cdc premium — bouton de /premium. La page reste statique : le témoin tg_compte dit seulement
// s'il faut envoyer vers le compte (activation) ou vers l'inscription.

const noop = () => () => {}
const btn = 'inline-flex min-h-12 items-center justify-center rounded-control px-5 text-[15px] font-semibold no-underline'

export function PremiumCta() {
  const signedIn = useSyncExternalStore(noop, hasSessionHint, () => false)
  if (signedIn) {
    return (
      <Link href="/compte#premium" className={`${btn} self-start bg-orange text-ink`}>
        Activer Premium dans mon compte
      </Link>
    )
  }
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link href="/compte/inscription?retour=/compte" className={`${btn} bg-orange text-ink`}>
        Créer mon compte
      </Link>
      <Link href="/compte/connexion?retour=/compte" className="inline-flex min-h-11 items-center text-[15px] font-semibold text-orange-ink underline underline-offset-2">
        J&apos;ai déjà un compte
      </Link>
    </div>
  )
}
