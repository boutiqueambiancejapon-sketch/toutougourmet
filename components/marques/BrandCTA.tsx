import { CONFIRMED_DISCOUNTS, partnerSlugFromName } from '@/data/partner-discounts'
import { PartnerButton } from '@/components/cro/PartnerButton'
import { AffiliateNote } from './AffiliateNote'

// @cdc affiliation — bouton partenaire V2 (aussi utilisé dans les articles MDX : garder l'API).
// Les clics sont mesurés par components/analytics/Tracking.tsx ; `place` remplit data-cta
// (« brand-article » par défaut : les BrandCTA posés dans les articles MDX n'en donnent pas).
// Bouton : components/cro/PartnerButton (« Voir le code promo » qui copie le code, sinon la remise).
// Partenaire (Franklin, Dog Chef, Elmut, Dogfy, Ultra Premium Direct) : la remise vient toujours
// de data/partner-discounts.ts ; dans `offer`, seuls les points sans remise sont gardés.

const DISCOUNT_BIT = /[−–-]\s?\d+\s?%|livraison|code|commande|essai/i

function offerLine(brandName: string, offer: string | undefined): string | undefined {
  const slug = partnerSlugFromName(brandName)
  if (!slug) return offer
  const extra = (offer ?? '').split(' · ').filter((s) => s.trim() && !DISCOUNT_BIT.test(s))
  return [CONFIRMED_DISCOUNTS[slug], ...extra].filter(Boolean).join(' · ') || undefined
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
  variant = 'primary',
  cta = 'Essayer',
  hideDisclosure = false,
  place = 'article',
}: BrandCTAProps) {
  const label = `${cta} ${brandName}`
  const line = offerLine(brandName, offer)
  const primary = variant === 'primary'
  return (
    <div data-cta={`brand-${place}`} className="v2 not-prose my-6 flex flex-col items-start gap-2">
      {line ? (
        <p className="m-0 text-sm font-semibold text-ink">
          {partnerSlugFromName(brandName) ? `${brandName}\u00a0: ${line}` : line}
        </p>
      ) : null}
      <PartnerButton
        href={affiliateUrl}
        fallback={label}
        srLabel={`(${brandName}, nouvel onglet)`}
        after={<span aria-hidden="true">&nbsp;→</span>}
        className={
          primary
            ? 'inline-flex min-h-12 max-w-full items-center rounded-control bg-orange px-5 py-3 font-bold text-ink no-underline shadow-[4px_4px_0_var(--ink)] transition-transform hover:-translate-y-0.5'
            : 'font-semibold text-orange-ink underline underline-offset-4'
        }
      />
      {hideDisclosure ? null : <AffiliateNote />}
    </div>
  )
}
