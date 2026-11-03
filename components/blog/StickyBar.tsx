'use client'

import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import { IconClose } from '@/components/icons'
import { isPopupOpen, POPUP_EVENT } from '@/lib/guide/popup-state'

// @cdc 04-pages — coque commune des bandeaux collants d'affiliation (StickyCta, StickyCtaDouble,
// bandeau Dog Chef de lib/sticky-cta-config) : une seule ligne compacte sur mobile, au-dessus de la barre d'onglets,
// affichée après 35 % de la page lue (audit design 2026-11-02, page article).
// Mobile : tant que le bandeau est affiché, il prend la place de la barre d'onglets (masquée par
// html[data-sticky] dans globals.css) au lieu de s'y ajouter (audit 2026-11-03, E11 : 225 px
// d'écran pris en permanence).

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

/** Vrai tant que l'encart du milieu d'article est à l'écran : une seule offre visible à la fois. */
function useMidCtaInView(): boolean {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = document.querySelector('[data-cta^="mid-"]')
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return inView
}

// @cdc cro-carte — fermeture mémorisée 7 jours sur l'appareil (localStorage, aucun cookie) :
// le bandeau ne revient pas à chaque article une fois fermé.
const CLOSED_KEY = 'tg-sticky-closed'
const CLOSED_FOR_MS = 7 * 24 * 60 * 60 * 1000

function closedRecently(): boolean {
  try {
    const at = Number(window.localStorage.getItem(CLOSED_KEY))
    return Number.isFinite(at) && at > 0 && Date.now() - at < CLOSED_FOR_MS
  } catch {
    return false
  }
}

function rememberClosed(): void {
  try {
    window.localStorage.setItem(CLOSED_KEY, String(Date.now()))
  } catch {
    // Stockage refusé (navigation privée) : fermé pour cette page seulement.
  }
}

function onPopupChange(cb: () => void): () => void {
  window.addEventListener(POPUP_EVENT, cb)
  return () => window.removeEventListener(POPUP_EVENT, cb)
}

export function StickyBar({ children }: { children: ReactNode }) {
  const visible = useScrolledPast()
  // Panneau du guide ouvert (components/guide/GuidePopup.tsx) : le bandeau s'efface le temps qu'il est là.
  const popupOpen = useSyncExternalStore(onPopupChange, isPopupOpen, () => false)
  const midInView = useMidCtaInView()
  const [dismissed, setDismissed] = useState(false)
  // `visible` n'est vrai que dans le navigateur, après défilement : lire le stockage ici ne crée
  // aucun écart avec le rendu serveur.
  const shown = visible && !dismissed && !midInView && !popupOpen && !closedRecently()
  useEffect(() => {
    if (!shown) return
    document.documentElement.dataset.sticky = '1'
    return () => {
      delete document.documentElement.dataset.sticky
    }
  }, [shown])
  if (!shown) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-2 pb-[calc(8px+env(safe-area-inset-bottom))] md:px-4 md:pb-4">
      <div data-cta="sticky" className="v2 pointer-events-auto mx-auto flex max-w-[720px] items-center gap-2 rounded-box bg-ink py-1.5 pr-1 pl-3 text-cream md:gap-4 md:py-3 md:pr-2 md:pl-4">
        {children}
        <button
          type="button"
          onClick={() => {
            rememberClosed()
            setDismissed(true)
          }}
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
