'use client'

import { useEffect } from 'react'
import { affiliateBrand, track } from '@/lib/analytics'

// Écoute globale des clics : liens partenaires (par marque) et éléments marqués data-track.
// Chaque clic partenaire porte brand, place et pageType (ajouté par track()). place : data-cta le
// plus proche (le lien lui-même compris) ; sans lui, « article-texte » dans le corps d'un article,
// sinon « autre ». Avant le 2026-11-03, les BrandCTA des articles MDX et les liens Markdown
// n'avaient aucun data-cta : leurs clics partaient sans place.

function placeOf(link: HTMLAnchorElement): string {
  const tagged = link.closest<HTMLElement>('[data-cta]')?.dataset.cta
  if (tagged) return tagged
  return link.closest('.mdx-content') ? 'article-texte' : 'autre'
}

export function Tracking() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target instanceof Element ? e.target : null
      const link = target?.closest('a[href]')
      if (link instanceof HTMLAnchorElement) {
        const brand = affiliateBrand(link.href)
        if (brand) {
          track('Affiliate Click', { brand, place: placeOf(link) })
        }
      }
    }
    document.addEventListener('click', onClick, { capture: true })
    return () => document.removeEventListener('click', onClick, { capture: true })
  }, [])
  return null
}
