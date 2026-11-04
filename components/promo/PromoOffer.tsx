import type { Brand } from '@/data/brands'
import { CONFIRMED_DISCOUNTS, shortDiscount, type OfferSlug } from '@/data/partner-discounts'
import { AffiliateNote } from '@/components/marques/AffiliateNote'
import { CopyCode } from './CopyCode'

// @cdc affiliation — bloc offre des pages « code promo » : remise confirmée, code s'il existe,
// bouton vers le lien partenaire. Rendu serveur. Le clic est mesuré par
// components/analytics/Tracking.tsx (Affiliate Click : brand, place = data-cta, pageType).

export const PROMO_PLACE = 'promo-page'

interface Props {
  brand: Brand
  slug: OfferSlug
  code: string | null
  /** compact : ligne de carte du hub ; full : bloc encre de la page marque */
  variant?: 'full' | 'compact'
}

export function PromoButton({ brand, slug }: { brand: Brand; slug: OfferSlug }) {
  const short = shortDiscount(slug)
  return (
    <a
      href={brand.affiliateUrl}
      target="_blank"
      rel="sponsored noopener"
      className="inline-flex min-h-12 items-center rounded-control bg-orange px-5 py-3 font-bold text-ink no-underline shadow-[4px_4px_0_var(--ink)] transition-transform hover:-translate-y-0.5"
    >
      {short ? `Profiter de ${short.replace(' ', '\u00a0')}` : "Voir l'offre"}
      <span className="sr-only"> chez {brand.name}</span>
      &nbsp;→
    </a>
  )
}

export function PromoOffer({ brand, slug, code, variant = 'full' }: Props) {
  const discount = CONFIRMED_DISCOUNTS[slug]
  if (variant === 'compact') {
    return (
      <div data-cta={PROMO_PLACE} className="flex flex-col items-start gap-2">
        <PromoButton brand={brand} slug={slug} />
      </div>
    )
  }
  return (
    <section
      aria-label={`Offre ${brand.name}`}
      data-cta={PROMO_PLACE}
      className="flex max-w-prose flex-col items-start gap-3 rounded-card bg-ink px-5 py-6 text-cream md:px-8"
    >
      <p className="m-0 font-display text-2xl font-black leading-tight text-cream">{discount}</p>
      {code ? (
        <p className="m-0 flex flex-wrap items-center gap-2 text-cream">
          Code à taper&nbsp;:
          <CopyCode code={code} onDark />
        </p>
      ) : (
        <p className="m-0 text-cream">Pas de code à taper&nbsp;: la remise passe par notre lien.</p>
      )}
      <PromoButton brand={brand} slug={slug} />
      <AffiliateNote className="text-cream/80" />
    </section>
  )
}
