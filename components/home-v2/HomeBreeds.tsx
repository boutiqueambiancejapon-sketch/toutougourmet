import Link from 'next/link'
import { Illustration } from '@/components/ui/Illustration'
import { getArticleSlot } from '@/components/blog/blog-categories'
import { getBreedBySlug, type Breed } from '@/data/breeds'

// @cdc 04-pages — « Par race » (prototype) : 6 races parmi les plus recherchées, vers leurs pages.
const FEATURED = ['labrador-retriever', 'golden-retriever', 'berger-australien', 'bouledogue-francais', 'border-collie', 'berger-belge-malinois']

export function HomeBreeds() {
  const breeds = FEATURED.map(getBreedBySlug).filter((b): b is Breed => Boolean(b))
  return (
    <section aria-labelledby="par-race" className="v2 flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="par-race" className="m-0 font-display text-2xl font-black text-ink">Par race</h2>
        <Link href="/chien/race" className="text-sm font-semibold text-orange-ink no-underline hover:underline">Toutes les races →</Link>
      </div>
      <ul role="list" className="m-0 grid list-none grid-cols-3 gap-3 p-0 md:grid-cols-6">
        {breeds.map((b) => (
          <li key={b.slug}>
            <Link href={`/chien/race/nourriture-${b.slug}`} className="flex flex-col gap-1.5 text-ink no-underline">
              <span className="relative block aspect-square overflow-hidden rounded-card bg-cream-2">
                <Illustration slot={getArticleSlot(`nourriture-${b.slug}`, 'Race')} alt={b.name} fill sizes="(max-width: 768px) 33vw, 180px" className="!rounded-none" />
              </span>
              <span className="text-sm font-semibold">{b.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
