import Link from 'next/link'
import { brands } from '@/data/brands'

// @cdc 04-pages — marques recommandées (liens affiliés via leurs fiches), avec mention de l'affiliation.
// Bande encre pleine largeur : casse la suite de sections pastel (audit design 2026-11-02, §2.1).
export function HomeBrands() {
  return (
    <section aria-labelledby="marques" className="v2 bg-ink text-cream">
      <div className="mx-auto flex max-w-page flex-col gap-5 px-4 py-12 md:px-8 md:py-16">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="marques" className="m-0 font-display text-[clamp(1.6rem,3vw,2.2rem)] font-black text-cream">{"Les marques qu'on recommande"}</h2>
          <Link href="/chien/marque" className="text-sm font-semibold text-amber no-underline hover:underline">Toutes les marques →</Link>
        </div>
        <ul role="list" className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((b) => (
            <li key={b.slug}>
              <Link href={`/chien/marque/${b.slug}`} className="flex h-full flex-col gap-1.5 rounded-card border border-cream/20 p-5 text-cream no-underline hover:border-cream">
                <span className="font-display text-xl font-black">{b.name}</span>
                <span className="text-sm text-cream/75">{b.tagline}</span>
                {b.discountOffer ? <span className="mt-auto self-start rounded-pill bg-amber px-3 py-1 text-xs font-semibold text-amber-ink">{b.discountOffer}</span> : null}
              </Link>
            </li>
          ))}
        </ul>
        <p className="m-0 text-xs text-cream/70">
          {"Liens partenaires : on touche une commission si tu commandes, sans surcoût pour toi. "}
          <Link href="/a-propos#affiliation" className="text-cream/80 underline">Comment on travaille</Link>
        </p>
      </div>
    </section>
  )
}
