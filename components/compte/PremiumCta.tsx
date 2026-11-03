'use client'

import Link from 'next/link'
import { useSyncExternalStore } from 'react'
import { useFormStatus } from 'react-dom'
import { activatePremiumAction } from '@/app/(fr)/compte/actions'
import { hasSessionHint } from '@/lib/account-hint'
import { btnOutlineBlock, btnPrimaryBlock } from './espace/ui'

// @cdc premium — boutons des cartes de /premium. La page reste statique : le témoin tg_compte dit
// seulement s'il faut proposer l'inscription ou le compte. Premium connecté : l'action serveur
// d'activation, qui revérifie la session et les conditions (adresse confirmée, un chien).

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

function SignUp({ primary, onDark }: { primary: boolean; onDark?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <Link href="/compte/inscription?retour=/compte" className={`${primary ? btnPrimaryBlock : btnOutlineBlock}`}>
        Créer mon compte
      </Link>
      <Link href="/compte/connexion?retour=/compte" className={`inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-2 ${onDark ? 'text-cream' : 'text-orange-ink'}`}>
        J&apos;ai déjà un compte
      </Link>
    </div>
  )
}

/** onDark : bouton posé sur fond encre (bandeau final de /premium). */
export function PlanCta({ plan, onDark }: { plan: PlanId; onDark?: boolean }) {
  const signedIn = useSyncExternalStore(noop, hasSessionHint, () => false)
  if (plan === 'none') {
    return (
      <Link href="/scanner" className={`${btnOutlineBlock}`}>
        Scanner un sac
      </Link>
    )
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
