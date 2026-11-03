'use client'

import Link from 'next/link'
import { useSyncExternalStore } from 'react'
import { useFormStatus } from 'react-dom'
import { activatePremiumAction } from '@/app/(fr)/compte/actions'
import { hasSessionHint } from '@/lib/account-hint'
import type { PremiumMode } from '@/lib/server/membership'
import { btnOutlineBlock, btnPrimaryBlock } from './espace/ui'

// @cdc premium — boutons des cartes de /premium. La page reste statique : le témoin tg_compte dit
// seulement s'il faut proposer l'inscription ou le compte. Premium, offre du lancement : l'action
// serveur d'activation, qui revérifie la session et les conditions (adresse confirmée, un chien).
// Offre payante : renvoi vers le choix mensuel ou annuel (#tarifs). Bientôt : simple mention.

export type PlanId = 'none' | 'free' | 'premium'

const noop = () => () => {}

function ActivateButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className={`${btnPrimaryBlock} disabled:opacity-60`}>
      {pending ? 'Activation…' : 'Activer Premium'}
    </button>
  )
}

export function SignUp({ primary, onDark, retour = '/compte' }: { primary: boolean; onDark?: boolean; retour?: string }) {
  const back = encodeURIComponent(retour)
  return (
    <div className="flex flex-col items-center gap-1">
      <Link href={`/compte/inscription?retour=${back}`} className={`${primary ? btnPrimaryBlock : btnOutlineBlock}`}>
        Créer mon compte
      </Link>
      <Link href={`/compte/connexion?retour=${back}`} className={`inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-2 ${onDark ? 'text-cream' : 'text-orange-ink'}`}>
        J&apos;ai déjà un compte
      </Link>
    </div>
  )
}

/** onDark : bouton posé sur fond encre (bandeau final de /premium). */
export function PlanCta({ plan, mode, onDark }: { plan: PlanId; mode: PremiumMode; onDark?: boolean }) {
  const signedIn = useSyncExternalStore(noop, hasSessionHint, () => false)
  if (plan === 'none') {
    return (
      <Link href="/scanner" className={`${btnOutlineBlock}`}>
        Scanner un sac
      </Link>
    )
  }
  if (plan === 'premium' && mode === 'paid') {
    return (
      <Link href="/premium#tarifs" className={btnPrimaryBlock}>
        Choisir ma formule
      </Link>
    )
  }
  if (plan === 'premium' && mode === 'soon') {
    return <p className={`m-0 text-center text-base font-semibold ${onDark ? 'text-cream' : 'text-ink'}`}>Paiement en ligne bientôt disponible</p>
  }
  if (!signedIn) return <SignUp primary={plan === 'premium'} onDark={onDark} />
  if (plan === 'free') {
    return (
      <Link href="/compte" className={`${btnOutlineBlock}`}>
        Ouvrir mon compte
      </Link>
    )
  }
  return (
    <form action={activatePremiumAction}>
      <ActivateButton />
    </form>
  )
}
