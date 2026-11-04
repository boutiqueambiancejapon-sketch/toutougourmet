import { getBrandBySlug } from '@/data/brands'
import { CONFIRMED_DISCOUNTS, type OfferSlug } from '@/data/partner-discounts'
import { PartnerButton } from '@/components/cro/PartnerButton'
import { frTypo } from '@/lib/utils'
import { AffiliateNote } from './AffiliateNote'

// @cdc cro-carte — offre visible sans défiler en haut de /chien/marque (point 4 de la carte des
// conversions ; audit mobile 2026-11-04 : première offre à 1 606 px). Dog Chef et Franklin d'abord :
// remise confirmée seulement, le bouton copie le code s'il y en a un. Marque en rupture : ligne masquée.

const TOP: OfferSlug[] = ['dog-chef', 'franklin']

export function BrandTopOffers() {
  const offers = TOP.flatMap((slug) => {
    const brand = getBrandBySlug(slug)
    return brand && !brand.stockNote ? [{ slug, brand }] : []
  })
  if (offers.length === 0) return null
  return (
    <section aria-label="Nos offres partenaires" data-cta="brand-marques-haut" className="flex flex-col gap-3 rounded-card border-2 border-ink bg-paper p-4 sm:p-5">
      <ul role="list" className="m-0 flex list-none flex-col gap-3 p-0 md:flex-row md:gap-8">
        {offers.map(({ slug, brand }) => (
          <li key={slug} className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
            <p className="m-0 flex flex-wrap items-baseline gap-x-2">
              <span className="font-display text-lg font-black text-ink">{brand.name}</span>
              <span className="text-sm text-ink-2">{frTypo(brand.facts.format)}</span>
            </p>
            <p className="m-0 text-[15px] font-semibold text-ink">{frTypo(CONFIRMED_DISCOUNTS[slug] ?? '')}</p>
            <PartnerButton
              href={brand.affiliateUrl}
              fallback={`Voir l'offre ${brand.name}`}
              srLabel={`(${brand.name}, nouvel onglet)`}
              after={<span aria-hidden="true">&nbsp;→</span>}
              className="inline-flex min-h-12 items-center rounded-control bg-orange px-4 font-bold text-ink no-underline hover:underline"
            />
          </li>
        ))}
      </ul>
      <AffiliateNote single={false} />
    </section>
  )
}
