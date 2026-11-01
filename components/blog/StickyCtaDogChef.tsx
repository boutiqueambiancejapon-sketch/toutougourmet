'use client'

import Link from 'next/link'
import { StickyBar, STICKY_BADGE, STICKY_BUTTON } from './StickyBar'

// @cdc 04-pages — bandeau collant Dog Chef (code promo) : une ligne, accroche tronquée sur mobile.
export function StickyCtaDogChef() {
  return (
    <StickyBar>
      <span className={`${STICKY_BADGE} bg-rose`}>-35%</span>
      <p className="m-0 min-w-0 flex-1 truncate text-sm leading-snug text-cream">
        <span className="font-bold">Dog Chef</span>
        <span className="hidden text-cream/75 sm:inline"> · repas frais personnalisés</span>
        {' · Code '}
        <span className="font-mono font-bold text-amber">WZU7090</span>
      </p>
      <Link
        href="https://www.dogchef.com/fr/code/WZU7090"
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={STICKY_BUTTON}
      >
        J&apos;en profite →
      </Link>
    </StickyBar>
  )
}
