'use client'

import { useEffect } from 'react'

// @cdc 04-pages — contournement Safari iOS 26 : après un défilement ou la fermeture du clavier, la
// barre `fixed bottom-0` reste parfois accrochée au milieu de l'écran (WebKit 297779, FB20249802).
// On la ramène au bas de la zone visible avec visualViewport ; décalage nul sur les autres navigateurs.
export function TabBarViewportFix() {
  useEffect(() => {
    const vv = window.visualViewport
    const bar = document.querySelector<HTMLElement>('[data-tabbar]')
    if (!vv || !bar) return
    let frame = 0
    const place = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        // Position naturelle de la barre (décalage actuel retiré) comparée au bas de la zone visible.
        // Seulement vers le bas : clavier ouvert (écart négatif), la barre reste derrière lui.
        const current = Number(bar.dataset.shift ?? 0)
        const naturalBottom = bar.getBoundingClientRect().bottom - current
        const gap = Math.round(vv.offsetTop + vv.height - naturalBottom)
        const shift = gap > 1 && vv.scale <= 1.01 ? gap : 0
        bar.dataset.shift = String(shift)
        bar.style.transform = shift ? `translateY(${shift}px)` : ''
      })
    }
    place()
    vv.addEventListener('resize', place)
    vv.addEventListener('scroll', place)
    window.addEventListener('scroll', place, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      vv.removeEventListener('resize', place)
      vv.removeEventListener('scroll', place)
      window.removeEventListener('scroll', place)
    }
  }, [])
  return null
}
