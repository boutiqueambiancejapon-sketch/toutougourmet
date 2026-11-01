import Link from 'next/link'
import { Illustration } from '@/components/ui/Illustration'
import { getArticleSlot } from '@/components/blog/blog-categories'
import { getBreedBySlug, type Breed } from '@/data/breeds'

// @cdc 04-pages — pages race V2 : points de vigilance (accordéons) et races proches (cartes).

export const RACE_HEALTH_ID = 'points-de-vigilance'
export const RACE_NEAR_ID = 'races-proches'

export function RaceHealth({ breed }: { breed: Breed }) {
  if (breed.health.length === 0) return null
  return (
    <section aria-labelledby={RACE_HEALTH_ID} className="v2 mt-12 flex flex-col gap-3">
      <h2 id={RACE_HEALTH_ID} className="m-0 scroll-mt-24 font-display text-2xl font-black text-ink">
        Points de vigilance pour le {breed.name}
      </h2>
      {breed.health.map((h) => (
        <details key={h.title} className="group rounded-box border border-line bg-paper px-4 py-3">
          <summary className="cursor-pointer list-none font-semibold text-ink marker:hidden">
            <span className="flex items-center justify-between gap-3">
              {h.title}
              <span aria-hidden="true" className="text-ink-2 transition-transform group-open:rotate-45">+</span>
            </span>
          </summary>
          <p className="m-0 mt-2 leading-relaxed text-ink-2">{h.text}</p>
        </details>
      ))}
    </section>
  )
}

export function RaceNear({ breed }: { breed: Breed }) {
  const near = breed.near.map(getBreedBySlug).filter((b): b is Breed => Boolean(b))
  if (near.length === 0) return null
  return (
    <section aria-labelledby={RACE_NEAR_ID} className="v2 mt-12 flex flex-col gap-3">
      <h2 id={RACE_NEAR_ID} className="m-0 scroll-mt-24 font-display text-2xl font-black text-ink">Races proches</h2>
      <ul role="list" className="m-0 grid list-none grid-cols-3 gap-3 p-0">
        {near.map((b) => (
          <li key={b.slug}>
            <Link href={`/chien/race/nourriture-${b.slug}`} className="flex flex-col gap-2 text-ink no-underline">
              <span className="relative block aspect-square overflow-hidden rounded-card">
                <Illustration slot={getArticleSlot(`nourriture-${b.slug}`, 'Race')} alt={b.name} fill sizes="(max-width: 768px) 33vw, 200px" className="!rounded-none" />
              </span>
              <span className="text-sm font-semibold">{b.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
