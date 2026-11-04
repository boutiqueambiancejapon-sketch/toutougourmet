'use client'

import { PartnerButton } from '@/components/cro/PartnerButton'
import { StickyBar, STICKY_BUTTON } from './StickyBar'

// @cdc cro-carte — barre collante d'une seule marque : fiche race (« Notre choix » du comparatif),
// avis et comparatif centrés sur une marque, fiche marque. Elle s'efface au bloc d'offre de la page
// (`stopAt`, voir useBeforeOffer). Le texte se limite au nom et à la remise confirmée : ni note, ni
// nombre d'avis. Clic mesuré par components/analytics/Tracking.tsx : place « sticky » (data-cta de StickyBar).

export interface StickyOfferProps {
  brandName: string
  href: string
  offer: string
  /** Marque désignée « Notre choix » par le comparatif de la page */
  pick?: boolean
  /** Sélecteur du bloc d'offre de la page */
  stopAt: string
}

export function StickyOffer({ brandName, href, offer, pick = false, stopAt }: StickyOfferProps) {
  return (
    <StickyBar stopAt={stopAt}>
      <div className="min-w-0 flex-1">
        <p className="m-0 truncate text-sm leading-snug text-cream">
          {pick ? <span className="text-cream/75">Notre choix&nbsp;: </span> : null}
          <span className="font-bold">{brandName}</span>
        </p>
        <p className="m-0 truncate text-xs leading-snug text-cream/75">
          {offer}
          <span className="hidden md:inline"> · Lien partenaire</span>
        </p>
      </div>
      <PartnerButton
        href={href}
        fallback="Voir l'offre"
        srLabel={`(${brandName}, nouvel onglet)`}
        className={STICKY_BUTTON}
        statusClassName="absolute right-2 bottom-full mb-1 rounded-control bg-ink px-3 py-1.5 text-cream md:right-4"
      />
    </StickyBar>
  )
}
