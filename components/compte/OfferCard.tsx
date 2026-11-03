import type { AccountOffer } from '@/lib/account-offers'
import { PartnerButton } from '@/components/cro/PartnerButton'

// @cdc premium — une offre partenaire dans le compte : marque, remise confirmée, raison tirée de
// data/brands.ts, lien sponsorisé. Clics mesurés par components/analytics/Tracking.tsx (data-cta).

export const PARTNER_NOTICE = 'Lien partenaire : on touche une commission si tu commandes, sans surcoût pour toi.'

export function OfferCard({ offer, cta = 'account-offer' }: { offer: AccountOffer; cta?: string }) {
  return (
    <div data-cta={cta} className="flex h-full flex-col gap-2 rounded-box border border-line bg-paper p-4">
      <p className="m-0 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="font-display text-lg font-black leading-tight text-ink">{offer.brand}</span>
        {offer.discount ? <span className="rounded-pill bg-amber px-3 py-0.5 text-sm font-semibold text-ink">{offer.discount}</span> : null}
      </p>
      <p className="m-0 text-[15px] leading-relaxed text-ink-2">{offer.reason}</p>
      <span className="flex flex-col gap-1 sm:items-start">
        <PartnerButton
          href={offer.url}
          fallback="Voir l'offre"
          srLabel={`(${offer.brand}, nouvel onglet)`}
          className="inline-flex min-h-11 w-full items-center justify-center whitespace-nowrap rounded-control bg-orange px-4 text-[15px] font-semibold text-ink no-underline sm:w-auto"
        />
      </span>
    </div>
  )
}
