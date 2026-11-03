'use client'

import Link from 'next/link'
import { useSyncExternalStore } from 'react'
import { hasSessionHint } from '@/lib/account-hint'
import { track } from '@/lib/analytics'

// @cdc CRO — objectif secondaire du résultat du test (carte des conversions) : le compte, sans
// demande d'e-mail (le clic partenaire reste l'objectif principal). Masqué si un compte est ouvert.

const noop = () => () => {}

export function QuizAccountInvite({ retour }: { retour: string }) {
  const signedIn = useSyncExternalStore(noop, hasSessionHint, () => false)
  if (signedIn) return null
  return (
    <p className="m-0 rounded-box bg-cream-2 p-4 text-[15px] leading-relaxed text-ink-2 sm:p-5">
      <Link
        href={`/compte/inscription?retour=${encodeURIComponent(retour)}`}
        onClick={() => track('Account Invite Click', { place: 'quiz' })}
        className="font-semibold text-orange-ink underline underline-offset-2"
      >
        Garde ce résultat et le profil de ton chien
      </Link>{' '}
      dans un compte gratuit : sa ration est calculée, son poids suivi et les offres choisies pour lui.
    </p>
  )
}
