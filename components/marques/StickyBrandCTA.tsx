'use client'

import { StickyBar, STICKY_BUTTON } from '@/components/blog/StickyBar'

// @cdc affiliation — bandeau collant d'une fiche marque : même coque que les articles (StickyBar),
// une ligne, un bouton. Masqué pour une marque en rupture (la page ne l'affiche pas).
interface StickyBrandCTAProps {
  brandName: string
  affiliateUrl: string
  offer: string
}

export function StickyBrandCTA({ brandName, affiliateUrl, offer }: StickyBrandCTAProps) {
  return (
    <StickyBar>
      <p data-cta="brand-sticky" className="m-0 flex min-w-0 flex-1 items-center gap-3">
        <span className="min-w-0 flex-1 truncate text-sm leading-snug text-cream">
          <span className="font-bold">{brandName}</span>
          <span className="text-cream/75"> · {offer}</span>
        </span>
        <a href={affiliateUrl} target="_blank" rel="sponsored noopener" className={STICKY_BUTTON}>
          Voir l&apos;offre →
        </a>
      </p>
    </StickyBar>
  )
}
