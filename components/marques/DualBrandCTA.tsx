import type { Brand } from '@/data/brands'
import { brandOfferLabel } from '@/data/brands'
import { AffiliateNote } from './AffiliateNote'

// @cdc affiliation — les deux offres d'un duel, côte à côte, en liens discrets (pas deux gros boutons
// identiques, audit design-cro §3). `place` remplit data-cta pour savoir d'où vient le clic.
export function DualBrandCTA({ brandA, brandB, place }: { brandA: Brand; brandB: Brand; place: string }) {
  return (
    <div data-cta={`brand-${place}`} className="v2 flex flex-col gap-3 border-y border-line py-4">
      <ul role="list" className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 sm:gap-8">
        {[brandA, brandB].map((b) => (
          <li key={b.slug} className="flex flex-col gap-1">
            <span className="font-semibold text-ink">{b.name}</span>
            <span className={`text-sm ${b.stockNote ? 'text-orange-ink' : 'text-ink-2'}`}>{brandOfferLabel(b)}</span>
            {b.stockNote ? null : (
              <a
                href={b.affiliateUrl}
                target="_blank"
                rel="sponsored noopener"
                className="self-start font-semibold text-orange-ink underline underline-offset-4 hover:text-ink"
              >
                Voir l&apos;offre {b.name}&nbsp;→
              </a>
            )}
          </li>
        ))}
      </ul>
      <AffiliateNote single={false} />
    </div>
  )
}
