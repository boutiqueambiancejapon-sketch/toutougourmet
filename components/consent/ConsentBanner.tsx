'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CONSENT_OPEN_EVENT, applyConsent, readConsent, saveConsent, type ConsentChoice } from '@/lib/consent'

// @cdc legal — bannière de consentement (CNIL) : deux boutons de même poids, aucun cookie
// Google Analytics tant que « Accepter » n'a pas été choisi. Rouvrable depuis le pied de page.
const BUTTON = 'min-h-11 flex-1 rounded-control px-4 text-[15px] font-semibold sm:flex-none'

export function ConsentBanner() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const stored = readConsent()
    // Affichage différé d'un tick : la bannière n'entre pas dans le premier rendu (LCP).
    const timer = stored ? undefined : window.setTimeout(() => setOpen(true), 0)
    if (stored) applyConsent(stored)
    const reopen = () => setOpen(true)
    window.addEventListener(CONSENT_OPEN_EVENT, reopen)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener(CONSENT_OPEN_EVENT, reopen)
    }
  }, [])

  if (!open) return null

  const choose = (choice: ConsentChoice) => {
    saveConsent(choice)
    setOpen(false)
  }

  return (
    <section
      aria-label="Cookies de mesure d'audience"
      className="v2 fixed inset-x-2 bottom-[calc(var(--tabbar-h)+env(safe-area-inset-bottom)+8px)] z-50 mx-auto flex max-w-[640px] flex-col gap-3 rounded-card bg-ink p-4 text-cream shadow-[4px_4px_0_var(--orange)] md:bottom-4 md:p-5"
    >
      <p className="m-0 text-[15px] leading-snug">
        On aimerait mesurer les visites avec Google Analytics, qui dépose un cookie si tu acceptes.
        Refuser ne change rien au site.{' '}
        <Link href="/politique-de-confidentialite#cookies" className="text-cream underline underline-offset-2">
          En savoir plus
        </Link>
      </p>
      <div className="flex gap-3">
        <button type="button" onClick={() => choose('denied')} className={`${BUTTON} bg-cream text-ink`}>
          Refuser
        </button>
        <button type="button" onClick={() => choose('granted')} className={`${BUTTON} bg-cream text-ink`}>
          Accepter
        </button>
      </div>
    </section>
  )
}
