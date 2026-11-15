import Link from 'next/link'
import { getBrandBySlug } from '@/data/brands'
import { BF_PAGES, bfPath } from '@/data/black-friday'
import { CONFIRMED_DISCOUNTS, isOfferSlug } from '@/data/partner-discounts'
import { PromoButton } from '@/components/promo/PromoOffer'
import { frTypo } from '@/lib/utils'

// @cdc affiliation — pilier Black Friday : une carte par marque, offre confirmée, bouton partenaire, lien vers la page fille.

export function BfOffers() {
  return (
    <ul role="list" className="m-0 grid list-none gap-3 p-0 md:grid-cols-2" data-cta="black-friday">
      {BF_PAGES.map((p) => {
        const brand = isOfferSlug(p.slug) ? getBrandBySlug(p.slug) : undefined
        const offer = isOfferSlug(p.slug) ? CONFIRMED_DISCOUNTS[p.slug] : 'Promotions affichées sur les produits, sans code'
        return (
          <li key={p.slug} className="flex flex-col items-start gap-3 rounded-card border border-line bg-paper p-5">
            <h3 className="m-0 font-display text-xl font-black text-ink">{p.name}</h3>
            <p className="m-0 leading-relaxed text-ink">{frTypo(offer ?? '')}</p>
            {brand && isOfferSlug(p.slug) ? (
              <PromoButton brand={brand} slug={p.slug} />
            ) : (
              <Link
                href={bfPath(p.slug)}
                className="inline-flex min-h-12 items-center whitespace-nowrap rounded-control bg-orange px-5 py-3 font-bold text-ink no-underline shadow-[4px_4px_0_var(--ink)]"
              >
                Voir les promos Maxi Zoo&nbsp;→
              </Link>
            )}
            <Link href={bfPath(p.slug)} className="text-sm font-semibold text-orange-ink underline underline-offset-4 hover:text-ink">
              {`Black Friday ${p.name} : ce qu'on sait`}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
