'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { IconClose } from '@/components/icons'

// @cdc 04-pages — coque commune des bandeaux collants d'affiliation (StickyCta, StickyCtaDouble,
// StickyCtaDogChef) : une seule ligne compacte sur mobile, au-dessus de la barre d'onglets,
// affichée après 35 % de la page lue (audit design 2026-11-02, page article).
// pb-8 sur mobile : le bandeau passe au-dessus du bouton central de la barre d'onglets.

const SHOW_AT = 0.35

/** Vrai dès que le lecteur a fait défiler `threshold` de la page (reste vrai ensuite). */
export function useScrolledPast(threshold = SHOW_AT): boolean {
  const [past, setPast] = useState(false)
  useEffect(() => {
    if (past) return
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (max > 0 && window.scrollY / max >= threshold) setPast(true)
    }
    const frame = requestAnimationFrame(onScroll)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [past, threshold])
  return past
}

export function StickyBar({ children }: { children: ReactNode }) {
  const visible = useScrolledPast()
  const [dismissed, setDismissed] = useState(false)
  if (!visible || dismissed) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--tabbar-h)+env(safe-area-inset-bottom))] z-30 px-2 pb-8 md:bottom-0 md:px-4 md:pb-4">
      <div className="v2 pointer-events-auto mx-auto flex max-w-[720px] items-center gap-2 rounded-box bg-ink py-1.5 pr-1 pl-3 text-cream md:gap-4 md:py-3 md:pr-2 md:pl-4">
        {children}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Fermer"
          className="grid size-9 shrink-0 place-items-center rounded-control text-cream/70 hover:text-cream"
        >
          <IconClose className="size-4" />
        </button>
      </div>
    </div>
  )
}

/** Bouton d'action du bandeau : orange plein, texte encre. */
export const STICKY_BUTTON =
  'inline-flex min-h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-control bg-orange px-3.5 text-sm font-semibold text-ink no-underline hover:underline md:px-4'

/** Badge promo (-35 %, GRATUIT…). */
export const STICKY_BADGE = 'shrink-0 whitespace-nowrap rounded-tile px-2 py-1 text-xs font-black text-ink'
