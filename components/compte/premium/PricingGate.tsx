'use client'

import Link from 'next/link'
import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import type { PremiumStatus } from '@/app/api/compte/premium/route'
import { hasSessionHint } from '@/lib/account-hint'
import { SignUp } from '../PremiumCta'
import { linkInline } from '../espace/ui'

// @cdc premium — bloc de paiement de la page statique /premium. Sans compte : inscription ou
// connexion (retour ici). Connecté : l'état vient de /api/compte/premium ; abonné, bouton du portail
// Stripe ; adresse non confirmée, lien de confirmation ; sinon le formulaire de paiement (rendu
// serveur, passé en enfant). Le serveur revérifie tout à l'envoi.

const noop = () => () => {}

export function PricingGate({ checkout, manage }: { checkout: ReactNode; manage: ReactNode }) {
  const signedIn = useSyncExternalStore(noop, hasSessionHint, () => false)
  const [status, setStatus] = useState<PremiumStatus | null>(null)
  useEffect(() => {
    if (!signedIn) return
    let live = true
    fetch('/api/compte/premium', { cache: 'no-store' })
      .then((r) => (r.ok ? (r.json() as Promise<PremiumStatus>) : null))
      .then((s) => {
        if (live) setStatus(s)
      })
      .catch(() => undefined)
    return () => {
      live = false
    }
  }, [signedIn])

  if (!signedIn) {
    return (
      <div className="flex flex-col gap-3">
        <p className="m-0 text-base leading-relaxed text-ink-2">L&apos;abonnement est rattaché à ton compte : crée-le ou connecte-toi pour continuer.</p>
        <div className="sm:max-w-xs">
          <SignUp primary retour="/premium#tarifs" />
        </div>
      </div>
    )
  }
  if (status?.subscriber) {
    return (
      <div className="flex flex-col gap-3">
        <p className="m-0 text-base font-semibold text-ink">Tu es abonné à Premium.</p>
        {manage}
      </div>
    )
  }
  if (status && !status.verified) {
    return (
      <p className="m-0 text-base leading-relaxed text-ink-2">
        Avant de payer, confirme ton adresse e-mail avec le lien reçu à l&apos;inscription.{' '}
        <Link href="/compte/connexion" className={linkInline}>
          Recevoir un nouveau lien
        </Link>
      </p>
    )
  }
  return <>{checkout}</>
}
