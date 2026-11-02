'use client'

import { useEffect } from 'react'

// @cdc perf — gtag.js (≈ 180 Ko) chargé hors du chemin critique : à la première interaction
// (toucher, clic, touche, défilement) ou, à défaut, quelques secondes après le chargement de la
// page, quand le navigateur est libre. Les appels gtag() faits avant (consentement, page_view)
// attendent dans window.dataLayer et partent dès que le script arrive : aucune mesure perdue
// pour un visiteur qui reste sur la page.

const SRC = 'https://www.googletagmanager.com/gtag/js?id=G-MDHMHXVJRZ'
const INTERACTIONS = ['pointerdown', 'keydown', 'touchstart', 'scroll'] as const
const IDLE_DELAY_MS = 3500

export function GtagLoader() {
  useEffect(() => {
    let done = false
    let timer: number | undefined

    const load = () => {
      if (done) return
      done = true
      cleanup()
      const s = document.createElement('script')
      s.src = SRC
      s.async = true
      document.head.appendChild(s)
    }

    const whenIdle = () => {
      timer = window.setTimeout(() => {
        if ('requestIdleCallback' in window) window.requestIdleCallback(load, { timeout: 2000 })
        else load()
      }, IDLE_DELAY_MS)
    }

    function cleanup() {
      for (const e of INTERACTIONS) window.removeEventListener(e, load)
      window.removeEventListener('load', whenIdle)
      window.clearTimeout(timer)
    }

    for (const e of INTERACTIONS) window.addEventListener(e, load, { once: true, passive: true })
    if (document.readyState === 'complete') whenIdle()
    else window.addEventListener('load', whenIdle, { once: true })

    return cleanup
  }, [])

  return null
}
