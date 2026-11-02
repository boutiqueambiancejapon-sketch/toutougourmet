import Link from 'next/link'
import type { Alternative } from '@/lib/scanner/seo'

// @cdc lot 6 — fiche /croquettes/[slug] sous 55/100 : « Par quoi les remplacer ? ». Une ou deux
// marques partenaires (data/brands.ts), lien sponsorisé déclaré comme tel.

export function FicheAlternatives({ alternatives }: { alternatives: Alternative[] }) {
  if (alternatives.length === 0) return null
  return (
    <section aria-labelledby="remplacer" className="flex flex-col gap-3">
      <h2 id="remplacer" className="m-0 font-display text-2xl font-black text-ink">
        Par quoi les remplacer ?
      </h2>
      <p className="m-0 text-base leading-relaxed text-ink-2">
        {`Sous 55/100, la composition cumule plusieurs défauts. ${alternatives.length > 1 ? 'Deux marques testées par la rédaction, qui vendent' : 'Une marque testée par la rédaction, qui vend'} des croquettes :`}
      </p>
      <ul role="list" className="m-0 flex list-none flex-col gap-3 p-0">
        {alternatives.map(({ brand, reason }) => (
          <li key={brand.slug} className="flex flex-col gap-2 rounded-card border border-line bg-paper p-4">
            <p className="m-0 font-display text-lg font-black text-ink">{brand.name}</p>
            <p className="m-0 text-[15px] leading-relaxed text-ink-2">{reason}</p>
            {brand.discountOffer ? <p className="m-0 text-sm font-semibold text-ink">{brand.discountOffer}</p> : null}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={brand.affiliateUrl}
                rel="sponsored noopener"
                target="_blank"
                data-cta="scan-alternative"
                className="inline-flex min-h-11 items-center rounded-control bg-ink px-4 font-semibold text-cream no-underline hover:underline"
              >
                {`Voir ${brand.name}`}
              </a>
              <Link href={`/chien/marque/${brand.slug}`} className="text-sm text-ink-2 underline underline-offset-2">
                {`Notre avis sur ${brand.name}`}
              </Link>
            </div>
          </li>
        ))}
      </ul>
      <p className="m-0 text-sm text-ink-2">Liens partenaires : on touche une commission si tu commandes, sans surcoût pour toi. La note de cette fiche n&apos;en dépend pas.</p>
    </section>
  )
}
