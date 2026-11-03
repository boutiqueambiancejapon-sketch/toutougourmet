'use client'

import { useGuideSignup } from '@/lib/guide/use-guide-signup'
import { GuideDownloadLink } from './GuideReady'
import { PopupForm } from './PopupForm'

// @cdc guide — encart court du haut d'article (components/guide/GuideTop.tsx) : place « inline-guide ».
// Après inscription : lien direct vers le PDF, l'e-mail part en parallèle.

export function GuideInline({ line, slug }: { line: string; slug: string }) {
  const signup = useGuideSignup('inline-guide', slug)
  return (
    <aside
      aria-label="Le guide de la gamelle"
      data-cta="guide-inline-guide"
      className="v2 not-prose my-6 flex flex-col gap-2.5 rounded-box border-2 border-ink bg-amber-bg p-3.5 sm:p-4 print:hidden"
    >
      {signup.status === 'success' ? (
        <div role="status" className="flex flex-col gap-2">
          <p className="m-0 text-[15px] font-semibold text-ink">C&apos;est envoyé. Le guide arrive aussi par e-mail.</p>
          <GuideDownloadLink place="inline-guide" />
        </div>
      ) : (
        <>
          <p className="m-0 text-[15px] leading-snug text-ink">{line}</p>
          <PopupForm signup={signup} />
        </>
      )}
    </aside>
  )
}
