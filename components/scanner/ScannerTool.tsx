'use client'

import Link from 'next/link'
import { useSyncExternalStore } from 'react'
import { hasSessionHint } from '@/lib/account-hint'
import { ScanForm } from './ScanForm'

// @cdc lot 6 — point d'entrée du scanner sur /scanner. La page reste statique (indexable) :
// le témoin de session (cookie lisible, sans secret) choisit entre le formulaire et l'invitation
// à se connecter. Le serveur revérifie la session à chaque analyse.

const noop = () => () => {}

export function ScannerTool({ monthlyLimit }: { monthlyLimit: number }) {
  const signedIn = useSyncExternalStore(noop, hasSessionHint, () => false)
  if (signedIn) return <ScanForm />
  const retour = encodeURIComponent('/scanner')
  return (
    <section aria-label="Lancer une analyse" className="flex flex-col gap-3 rounded-card border border-line bg-paper p-4 sm:p-6">
      <p className="m-0 font-display text-xl font-black leading-tight text-ink">Analyser une étiquette</p>
      <p className="m-0 text-[15px] leading-relaxed text-ink-2">
        {`L'analyse demande un compte gratuit : ${monthlyLimit} analyses par mois, et tes résultats restent dans ton espace.`}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          href={`/compte/inscription?retour=${retour}`}
          className="inline-flex min-h-12 items-center justify-center rounded-control bg-orange px-5 text-[15px] font-semibold text-ink no-underline"
        >
          Créer un compte et analyser
        </Link>
        <Link
          href={`/compte/connexion?retour=${retour}`}
          className="inline-flex min-h-12 items-center justify-center rounded-control border-2 border-ink px-5 text-[15px] font-semibold text-ink no-underline"
        >
          J&apos;ai déjà un compte
        </Link>
      </div>
    </section>
  )
}
