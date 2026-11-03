import { brands, brandOfferLabel } from '@/data/brands'
import { AffiliateNote } from './AffiliateNote'

// @cdc affiliation — offres de bienvenue des marques en lignes sobres : un lien par marque,
// aucun pour une marque en rupture. data-cta="brand-<place>" pour savoir d'où vient le clic.
export function BrandOfferList({ place }: { place: string }) {
  return (
    <div data-cta={`brand-${place}`} className="v2 flex flex-col gap-3">
      <ul role="list" className="m-0 list-none border-t border-line p-0">
        {brands.map((b) => (
          <li key={b.slug} className="flex flex-col gap-1 border-b border-line py-3 sm:flex-row sm:items-center sm:gap-6">
            <span className="font-semibold text-ink sm:w-48 sm:shrink-0">{b.name}</span>
            <span className={`grow text-sm ${b.stockNote ? 'font-semibold text-orange-ink' : 'text-ink-2'}`}>{brandOfferLabel(b)}</span>
            {b.stockNote ? null : (
              <a
                href={b.affiliateUrl}
                target="_blank"
                rel="sponsored noopener"
                className="inline-flex min-h-11 items-center self-start whitespace-nowrap font-semibold text-orange-ink underline underline-offset-4 hover:text-ink sm:self-auto"
              >
                Voir l&apos;offre&nbsp;→
              </a>
            )}
          </li>
        ))}
      </ul>
      <AffiliateNote single={false} />
    </div>
  )
}
