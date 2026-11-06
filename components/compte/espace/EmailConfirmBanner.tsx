'use client'

import { useState } from 'react'
import { authClient } from '@/lib/auth-client'

// @cdc compte — adresse pas encore confirmée : le compte est ouvert, ce rappel reste affiché jusqu'au clic sur le lien.

export function EmailConfirmBanner({ email }: { email: string }) {
  const [etat, setEtat] = useState<'idle' | 'pending' | 'sent' | 'error'>('idle')

  async function renvoyer() {
    setEtat('pending')
    const { error } = await authClient.sendVerificationEmail({ email, callbackURL: '/compte?bienvenue=1' })
    setEtat(error ? 'error' : 'sent')
  }

  return (
    <aside aria-label="Confirmation de ton adresse" className="flex flex-wrap items-center gap-3 rounded-card bg-amber-bg p-4">
      <p className="m-0 min-w-[14rem] flex-1 text-[15px] leading-relaxed text-ink">
        {etat === 'sent'
          ? `Lien envoyé à ${email}. Pense à regarder dans les indésirables.`
          : etat === 'error'
            ? "L'envoi a échoué. Réessaie dans quelques minutes."
            : 'Confirme ton adresse pour recevoir nos e-mails et lancer des analyses par photo. Un compte non confirmé est supprimé au bout de 30 jours.'}
      </p>
      {etat === 'sent' ? null : (
        <button type="button" onClick={() => void renvoyer()} disabled={etat === 'pending'} className="min-h-11 shrink-0 whitespace-nowrap rounded-control bg-ink px-4 text-sm font-semibold text-cream disabled:opacity-60">
          Renvoyer le lien
        </button>
      )}
    </aside>
  )
}
