import { getBrandBySlug } from '@/data/brands'
import { CONFIRMED_DISCOUNTS, partnerSlugFromName } from '@/data/partner-discounts'
import { AffiliateNote } from './AffiliateNote'

// @cdc affiliation — bouton partenaire V2 (aussi utilisé dans les articles MDX : garder l'API).
// Les clics sont mesurés par components/analytics/Tracking.tsx ; `place` remplit data-cta.
// Partenaire (Franklin, Dog Chef, Elmut, Dogfy, Ultra Premium Direct) : la remise vient toujours
// de data/partner-discounts.ts ; dans `offer`, seuls les points sans remise sont gardés.

const DISCOUNT_BIT = /[−–-]\s?\d+\s?%|livraison|code|commande|essai/i

function offerLine(brandName: string, offer: string | undefined): string | undefined {
  const slug = partnerSlugFromName(brandName)
  if (!slug) return offer
  const extra = (offer ?? '').split(' · ').filter((s) => s.trim() && !DISCOUNT_BIT.test(s))
  return [CONFIRMED_DISCOUNTS[slug], ...extra].filter(Boolean).join(' · ') || undefined
}

function offerCode(brandName: string, code: string | null | undefined): string | null | undefined {
  const slug = partnerSlugFromName(brandName)
  return code ?? (slug ? getBrandBySlug(slug)?.discountCode : null)
}

interface BrandCTAProps {
  brandName: string
  affiliateUrl: string
  offer?: string
  code?: string | null
  /** primary : bouton orange plein ; secondary : lien souligné discret */
  variant?: 'primary' | 'secondary'
  /** Verbe du bouton : « Essayer » par défaut */
  cta?: string
  /** Masque la mention partenaire (quand une autre mention est déjà visible à côté) */
  hideDisclosure?: boolean
  /** Emplacement mesuré : data-cta="brand-<place>" */
  place?: string
}

export function BrandCTA({
  brandName,
  affiliateUrl,
  offer,
  code,
  variant = 'primary',
  cta = 'Essayer',
  hideDisclosure = false,
  place,
}: BrandCTAProps) {
  const label = `${cta} ${brandName}`
  const line = offerLine(brandName, offer)
  const promo = offerCode(brandName, code)
  return (
    <div
      {...(place ? { 'data-cta': `brand-${place}` } : {})}
      className="v2 not-prose my-6 flex flex-col items-start gap-2"
    >
      {line ? <p className="m-0 text-sm font-semibold text-ink">{line}</p> : null}
      {variant === 'primary' ? (
        <a
          href={affiliateUrl}
          target="_blank"
          rel="sponsored noopener"
          className="inline-flex min-h-12 items-center rounded-control bg-orange px-5 py-3 font-bold text-ink no-underline shadow-[4px_4px_0_var(--ink)] transition-transform hover:-translate-y-0.5"
        >
          {label}&nbsp;→
        </a>
      ) : (
        <a href={affiliateUrl} target="_blank" rel="sponsored noopener" className="font-semibold text-orange-ink underline underline-offset-4">
          {label}&nbsp;→
        </a>
      )}
      {promo ? (
        <p className="m-0 text-sm text-ink-2">
          Code&nbsp;: <span className="font-mono font-bold text-ink">{promo}</span>
        </p>
      ) : null}
      {hideDisclosure ? null : <AffiliateNote />}
    </div>
  )
}
