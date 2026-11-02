'use client'

import Link from 'next/link'
import type { Prefill } from '@/lib/scanner/result'

// @cdc lot 6 — l'analyse par photos demande un compte (quota, appel payant à l'IA). Le code-barres
// et la marque déjà connus sont gardés le temps de la connexion (sessionStorage, rien sur le serveur).

export const PREFILL_KEY = 'tg-scan-prefill'

export function AccountGate({ prefill, monthlyLimit, onBack }: { prefill: Prefill; monthlyLimit: number; onBack: () => void }) {
  const retour = encodeURIComponent('/scanner?photos=1')
  const keep = () => {
    try {
      sessionStorage.setItem(PREFILL_KEY, JSON.stringify(prefill))
    } catch {
      // navigation privée : on repartira du code-barres
    }
  }
  return (
    <section aria-label="Analyse par photos" className="flex flex-col gap-3 rounded-card border border-line bg-paper p-4 sm:p-6">
      <p className="m-0 font-display text-xl font-black leading-tight text-ink">Analyse par photos</p>
      <p className="m-0 text-[15px] leading-relaxed text-ink-2">
        {`Une IA lit l'étiquette sur tes photos : il faut un compte gratuit, avec ${monthlyLimit} analyses par photo chaque mois. Tes résultats restent dans ton espace.`}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          href={`/compte/inscription?retour=${retour}`}
          onClick={keep}
          className="inline-flex min-h-12 items-center justify-center rounded-control bg-orange px-5 text-[15px] font-semibold text-ink no-underline"
        >
          Créer un compte gratuit
        </Link>
        <Link
          href={`/compte/connexion?retour=${retour}`}
          onClick={keep}
          className="inline-flex min-h-12 items-center justify-center rounded-control border-2 border-ink px-5 text-[15px] font-semibold text-ink no-underline"
        >
          J&apos;ai déjà un compte
        </Link>
      </div>
      <button type="button" onClick={onBack} className="min-h-11 self-start text-[15px] text-ink-2 underline underline-offset-2">
        Revenir au code-barres
      </button>
    </section>
  )
}
