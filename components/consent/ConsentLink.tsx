'use client'

import { CONSENT_OPEN_EVENT } from '@/lib/consent'

/** Lien du pied de page pour revenir sur son choix de cookies. */
export function ConsentLink({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))} className={className}>
      Gérer les cookies
    </button>
  )
}
