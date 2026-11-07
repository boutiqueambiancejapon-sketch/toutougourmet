'use client'

import Link from 'next/link'
import { signupHref, type SignupPlace } from '@/lib/signup-places'
import { MiloAvatar } from './MiloAvatar'

// @cdc assistant — sans compte : la question est gardée, l'inscription ramène sur /assistant où elle part toute seule.

export function MiloCompte({ question, place }: { question: string; place: SignupPlace }) {
  return (
    <div className="flex flex-col gap-3 rounded-card border-2 border-ink bg-cream-2 p-4">
      <p className="m-0 max-w-[85%] self-end rounded-card rounded-br-sm bg-ink px-3.5 py-2.5 text-[15px] leading-snug text-cream">{question}</p>
      <div className="flex items-start gap-2">
        <MiloAvatar size={32} />
        <div className="flex flex-col gap-1">
          <p className="m-0 text-[15px] font-semibold leading-snug text-ink">J&apos;ai ta question, je la garde au chaud.</p>
          <p className="m-0 text-sm leading-relaxed text-ink-2">Crée ton compte gratuit pour lire ma réponse. Si tu enregistres ton chien, je connaîtrai sa race et son poids sans te les redemander.</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link href={signupHref(place, '/assistant')} className="inline-flex min-h-12 items-center whitespace-nowrap rounded-control bg-orange px-5 font-semibold text-ink no-underline">Créer mon compte</Link>
        <Link href="/compte/connexion?retour=%2Fassistant" className="text-sm font-semibold text-ink underline underline-offset-2">J&apos;ai déjà un compte</Link>
      </div>
      <p className="m-0 text-xs text-ink-2">Ton chien va mal ? N&apos;attends pas de réponse : appelle ton vétérinaire.</p>
    </div>
  )
}
