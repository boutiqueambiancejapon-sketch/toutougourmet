'use client'

import Link from 'next/link'
import { MiloAvatar } from '@/components/assistant/MiloAvatar'
import { useGuideSignup } from '@/lib/guide/use-guide-signup'
import { GuideDownloadLink } from './GuideReady'
import { PopupForm } from './PopupForm'

// @cdc guide — fin des pages d'urgence (accord du propriétaire du 2026-11-07, plan CRO) : après la FAQ, une fois le
// danger traité. Rien à vendre : la fiche frigo du guide gratuit, et Milo pour les questions sur la suite.

export function UrgenceSuite({ slug }: { slug: string }) {
  const signup = useGuideSignup('urgence-fin', slug)
  return (
    <aside aria-labelledby="urgence-suite" data-guide-on-page className="v2 not-prose mt-10 flex flex-col gap-3 rounded-card border-2 border-ink bg-cream-2 p-4 print:hidden">
      <h2 id="urgence-suite" className="m-0 font-display text-xl font-black text-ink">Une fois ton chien hors de danger</h2>
      <div data-cta="urgence-guide" className="flex flex-col gap-2.5 rounded-box bg-paper p-3.5">
        {signup.status === 'success' ? (
          <div role="status" className="flex flex-col gap-2">
            <p className="m-0 text-[15px] font-semibold text-ink">C&apos;est envoyé. Le guide arrive aussi par e-mail.</p>
            <GuideDownloadLink place="urgence-fin" />
          </div>
        ) : (
          <>
            <p className="m-0 text-[15px] leading-snug text-ink"><strong>La fiche frigo gratuite</strong> : les aliments dangereux, les gestes et les numéros antipoison sur une page, à imprimer pour la prochaine fois.</p>
            <PopupForm signup={signup} />
          </>
        )}
      </div>
      <Link href="/assistant" data-cta="urgence-milo" className="flex min-h-12 items-center gap-3 rounded-box bg-paper p-3.5 text-ink no-underline hover:underline">
        <MiloAvatar size={40} />
        <span className="flex min-w-0 flex-col">
          <span className="text-[15px] font-semibold">Une question sur la suite ?</span>
          <span className="text-sm text-ink-2">Repas des prochains jours, ce qu&apos;il peut manger : demande à Milo.</span>
        </span>
      </Link>
    </aside>
  )
}
