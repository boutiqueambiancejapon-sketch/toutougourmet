import Link from 'next/link'
import { brands } from '@/data/brands'

// @cdc 04-pages — marques recommandées (liens affiliés via leurs fiches), avec mention de l'affiliation.
export function HomeBrands() {
  return (
    <section aria-labelledby="marques" className="v2 flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="marques" className="m-0 font-display text-2xl font-black text-ink">{"Les marques qu'on recommande"}</h2>
        <Link href="/chien/marque" className="text-sm font-semibold text-orange-ink no-underline hover:underline">Toutes les marques →</Link>
      </div>
      <ul role="list" className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((b) => (
          <li key={b.slug}>
            <Link href={`/chien/marque/${b.slug}`} className="flex h-full flex-col gap-1.5 rounded-card border border-line bg-paper p-5 text-ink no-underline hover:border-ink">
              <span className="font-display text-xl font-black">{b.name}</span>
              <span className="text-sm text-ink-2">{b.tagline}</span>
              {b.discountOffer ? <span className="mt-auto self-start rounded-pill bg-amber px-3 py-1 text-xs font-semibold text-amber-ink">{b.discountOffer}</span> : null}
            </Link>
          </li>
        ))}
      </ul>
      <p className="m-0 text-xs text-ink-2">
        {"Liens partenaires : on touche une commission si tu commandes, sans surcoût pour toi. "}
        <Link href="/a-propos#affiliation" className="text-ink-2 underline">Comment on travaille</Link>
      </p>
    </section>
  )
}
