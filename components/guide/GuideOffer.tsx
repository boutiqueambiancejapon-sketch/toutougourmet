'use client'

import { useId } from 'react'
import { useGuideSignup } from '@/lib/guide/use-guide-signup'
import type { GuidePlace } from '@/lib/guide/config'
import type { BookSummary } from '@/lib/guide/book'
import { GuideForm } from './GuideForm'
import { GuideReady } from './GuideReady'

// @cdc guide — encart « Recevoir le guide gratuit » : seul appel à l'action de fin d'article sur
// les aliments autorisés ou à limiter et sur les recettes (remplace la fiche bonus et l'encart
// compte, voir lib/article-cro.ts), et en bas de /fiche-aliments-dangereux. Après inscription :
// « Ton guide est prêt » et le lien direct vers le PDF.

interface GuideOfferProps {
  place: GuidePlace
  summary: BookSummary
  /** Article d'origine, mesuré avec l'inscription */
  slug?: string
  className?: string
}

export function GuideOffer({ place, summary, slug, className = 'mt-10' }: GuideOfferProps) {
  const id = useId()
  const signup = useGuideSignup(place, slug)
  return (
    <section
      aria-labelledby={`${id}-t`}
      data-cta={`guide-${place}`}
      className={`v2 flex flex-col gap-4 rounded-card border-2 border-ink bg-paper p-4 shadow-[5px_5px_0_var(--orange)] sm:p-6 print:hidden ${className}`}
    >
      {signup.status === 'success' ? (
        <GuideReady place={place} />
      ) : (
        <>
          <div className="flex items-start gap-4">
            <div
              aria-hidden="true"
              className="hidden aspect-[210/297] w-16 shrink-0 rounded-tile bg-ink p-1.5 font-display text-[9px] font-black leading-[1.1] text-cream shadow-[3px_3px_0_var(--orange)] min-[400px]:block"
            >
              Le guide de la <span className="text-orange">gamelle</span>
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <span className="self-start rounded-pill bg-amber px-2.5 py-0.5 text-xs font-semibold text-ink">
                Guide gratuit · PDF de {summary.pageCount} pages
              </span>
              <h2 id={`${id}-t`} className="m-0 font-display text-xl font-black leading-tight text-ink md:text-2xl">
                Recevoir le guide de la gamelle
              </h2>
              <p className="m-0 text-[15px] leading-relaxed text-ink-2">
                {summary.foodCount} aliments classés en autorisé, à limiter et interdit, les numéros antipoison et {summary.recipeCount}{' '}
                recettes maison avec les doses par taille de chien.
              </p>
            </div>
          </div>
          <GuideForm signup={signup} row />
        </>
      )}
    </section>
  )
}
