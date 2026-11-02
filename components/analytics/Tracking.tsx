'use client'

import { useEffect } from 'react'
import { affiliateBrand, track } from '@/lib/analytics'

// Écoute globale des clics : liens partenaires (par marque) et éléments marqués data-track.
export function Tracking() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target instanceof Element ? e.target : null
      const link = target?.closest('a[href]')
      if (link instanceof HTMLAnchorElement) {
        const brand = affiliateBrand(link.href)
        if (brand) {
          const place = link.closest<HTMLElement>('[data-cta]')?.dataset.cta
          track('Affiliate Click', place ? { brand, place } : { brand })
        }
      }
    }
    document.addEventListener('click', onClick, { capture: true })
    return () => document.removeEventListener('click', onClick, { capture: true })
  }, [])
  return null
}
