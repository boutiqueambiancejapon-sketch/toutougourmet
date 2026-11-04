'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// @cdc outils — après le calcul, le résultat vient se placer sous l'en-tête collant et prend le focus
// (audit mobile 2026-11-04) : sans ça, il tombait sous la barre d'onglets et la page semblait ne pas
// réagir. Défilement instantané avec prefers-reduced-motion. Rien au chargement de la page : seul
// l'appui sur le bouton déclenche `reveal` (un résultat pré-rempli par une adresse ne bouge pas la page).

/** `ref` sur la zone du résultat ; la cible est son `[data-tool-result]`, sinon la zone elle-même. */
export function useResultReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null)
  const [requests, setRequests] = useState(0)

  useEffect(() => {
    if (requests === 0) return
    const zone = ref.current
    const target = zone?.querySelector<HTMLElement>('[data-tool-result]') ?? zone
    if (!target) return
    target.focus({ preventScroll: true })
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' })
  }, [requests])

  const reveal = useCallback(() => setRequests((n) => n + 1), [])
  return [ref, reveal] as const
}
