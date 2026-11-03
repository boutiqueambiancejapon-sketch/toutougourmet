'use client'

import Link from 'next/link'
import { useGuideSignup } from '@/lib/guide/use-guide-signup'
import { GuideForm, BUTTON_CLASS } from './GuideForm'
import { GuideReady } from './GuideReady'

// @cdc guide — bloc d'inscription de /guide-alimentation : formulaire, puis « Ton guide est prêt »
// et la carte « Et maintenant ? » vers le calculateur de ration (maquette validée).

export function GuideSignup() {
  const signup = useGuideSignup('page-guide')
  if (signup.status !== 'success') return <GuideForm signup={signup} />
  return (
    <div className="flex flex-col gap-4">
      <GuideReady place="page-guide" />
      <div className="flex flex-col gap-1 rounded-card border-2 border-ink bg-paper p-4 shadow-[4px_4px_0_var(--orange)]">
        <p className="m-0 font-display text-lg font-black text-ink">Et maintenant ?</p>
        <p className="m-0 mb-2.5 text-[15px] text-ink-2">Calcule sa ration en grammes, selon son poids et son activité.</p>
        <Link href="/outils/ration" className={`${BUTTON_CLASS} bg-orange text-ink shadow-[0_3px_0_var(--orange-ink)]`}>
          Calculer sa ration
        </Link>
      </div>
    </div>
  )
}
