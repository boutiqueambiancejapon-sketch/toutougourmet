'use client'

import { StickyBar } from '@/components/blog/StickyBar'

// @cdc affiliation — bandeau collant d'un duel : les deux offres en liens compacts, même coque que
// les articles (StickyBar). Une marque en rupture n'y figure pas (filtrée par la page).
interface BrandInfo {
  name: string
  affiliateUrl: string
}

const LINK =
  'block min-w-0 truncate rounded-control border border-cream/40 px-3 py-2 text-sm font-semibold text-cream no-underline hover:border-cream'

export function StickyComparatifCTA({ brands }: { brands: BrandInfo[] }) {
  return (
    <StickyBar>
      <p data-cta="brand-duel-sticky" className="m-0 flex min-w-0 flex-1 items-center gap-2">
        <span className="hidden flex-1 text-sm text-cream/75 sm:inline">Voir les offres</span>
        {brands.map((b) => (
          <a key={b.name} href={b.affiliateUrl} target="_blank" rel="sponsored noopener" className={LINK}>
            {b.name}&nbsp;→
          </a>
        ))}
      </p>
    </StickyBar>
  )
}
