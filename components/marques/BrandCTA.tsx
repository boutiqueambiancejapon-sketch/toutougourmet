import { CONFIRMED_DISCOUNTS, partnerSlugFromName, shortDiscount } from '@/data/partner-discounts'
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
  /** primary : encadré sombre avec bouton ; secondary : bandeau compact sur une ligne */
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
  const slug = partnerSlugFromName(brandName)
  if (variant === 'primary') {
    const remise = slug ? shortDiscount(slug) : ''
    return (
      <aside data-cta={`brand-${place}`} aria-label={brandName} className="v2 not-prose relative my-8 flex flex-col items-start gap-3 rounded-card bg-ink p-5 shadow-[6px_6px_0_var(--orange)] sm:p-7">
        {remise ? (
          <p aria-hidden="true" className="absolute -top-5 right-3 m-0 flex size-20 rotate-6 flex-col items-center justify-center rounded-pill bg-orange text-ink shadow-[3px_3px_0_var(--ink)] sm:right-5 sm:size-24">
            <span className="whitespace-nowrap font-display text-xl font-black leading-none sm:text-2xl">{remise.replace(' ', '\u00a0')}</span>
          </p>
        ) : null}
        <p className="m-0 text-sm font-semibold text-amber">{slug ? 'Notre partenaire' : 'Où l\'acheter'}</p>
        <p className={`m-0 font-display text-2xl font-black leading-tight text-paper sm:text-3xl ${remise ? 'pr-20 sm:pr-24' : ''}`}>{brandName}</p>
        {line ? <p className="m-0 text-base leading-relaxed text-cream">{line}</p> : null}
        <PartnerButton
          href={affiliateUrl}
          fallback={label}
          srLabel={`(${brandName}, nouvel onglet)`}
          after={<span aria-hidden="true">&nbsp;→</span>}
          statusClassName="text-cream"
          className="mt-1 inline-flex min-h-12 max-w-full items-center whitespace-nowrap rounded-control bg-amber px-5 py-3 font-bold text-ink no-underline shadow-[4px_4px_0_var(--orange)] transition-transform hover:-translate-y-0.5"
        />
        {hideDisclosure ? null : <AffiliateNote className="text-cream" />}
      </aside>
    )
  }
  const remise = slug ? shortDiscount(slug) : ''
  return (
    <div data-cta={`brand-${place}`} className="v2 not-prose my-5 flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-box border border-line bg-paper px-3 py-2.5">
        {remise ? <span className="shrink-0 whitespace-nowrap rounded-pill bg-amber px-2.5 py-1 text-sm font-bold text-ink">{remise}</span> : null}
        <p className="m-0 min-w-[12rem] flex-1 text-sm leading-snug text-ink-2">
          <strong className="font-semibold text-ink">{brandName}</strong>
          {line ? ` · ${remise ? line.replace(remise, '').replace(/^\s*/, '') : line}` : ''}
        </p>
        <PartnerButton
          href={affiliateUrl}
          fallback={slug ? label : cta}
          srLabel={`(${brandName}, nouvel onglet)`}
          after={<span aria-hidden="true">&nbsp;→</span>}
          className="inline-flex min-h-10 shrink-0 items-center whitespace-nowrap rounded-control bg-ink px-3.5 text-sm font-semibold text-cream no-underline hover:underline"
        />
      </div>
      {hideDisclosure ? null : <AffiliateNote court />}
    </div>
  )
}
