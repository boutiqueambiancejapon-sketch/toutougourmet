import type { Metadata } from 'next'
import Link from 'next/link'
import { getArticlesByCategory } from '@/lib/mdx'
import { getBreedForArticle } from '@/data/breeds'
import { getArticleSlot } from '@/components/blog/blog-categories'
import { Illustration } from '@/components/ui/Illustration'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { RaceSearch } from '@/components/race/RaceSearch'

export const metadata: Metadata = {
  title: 'Alimentation par race de chien — guides nutritionnels',
  description:
    'Labrador, Golden Retriever, Berger Allemand, Bouledogue Français… Trouvez les conseils nutritionnels adaptés à la race de votre chien.',
  alternates: { canonical: 'https://www.toutou-gourmet.com/chien/race' },
}

// @cdc 04-pages — hub race V2 (prototype) : recherche + grille de cartes (photo, nom, poids).
// Route statique prioritaire sur /chien/[category].
const GRID_ID = 'races'

function nameFromTitle(title: string): string {
  return title.replace(/^Quelle nourriture pour (un|une) /i, '').replace(/\s*\?$/, '').trim()
}

export default function RaceHubPage() {
  const breeds = getArticlesByCategory('race')
    .map((a) => {
      const data = getBreedForArticle(a.slug)
      const [min, max] = data?.weightKg ?? [0, 0]
      return {
        slug: a.slug,
        name: data?.name ?? nameFromTitle(a.frontmatter.title),
        weight: min && max ? `${min}–${max} kg` : null,
      }
    })
    .sort((x, y) => x.name.localeCompare(y.name, 'fr'))

  return (
    <div className="v2 mx-auto flex max-w-page flex-col gap-6 px-4 pt-6 pb-16 md:px-8 md:pt-10">
      <BreadcrumbNav items={[{ label: 'Accueil', href: '/' }, { label: 'Chien', href: '/chien' }, { label: 'Alimentation par race' }]} />
      <div className="flex max-w-prose flex-col gap-3">
        <h1 className="m-0 font-display text-[clamp(1.9rem,3.6vw,2.6rem)] font-black leading-[1.08] tracking-tight text-ink">
          Quelle nourriture selon la race de votre chien ?
        </h1>
        <p className="m-0 leading-relaxed text-ink-2">
          {breeds.length} races, avec pour chacune son poids adulte, ses prédispositions et les aliments à surveiller.
        </p>
      </div>
      <RaceSearch gridId={GRID_ID} total={breeds.length} />
      <ul id={GRID_ID} role="list" className="m-0 grid list-none grid-cols-2 gap-4 p-0 sm:grid-cols-3 lg:grid-cols-4">
        {breeds.map((b) => (
          <li key={b.slug} data-race-name={b.name}>
            <Link href={`/chien/race/${b.slug}`} className="flex flex-col gap-1.5 text-ink no-underline">
              <span className="relative block aspect-square overflow-hidden rounded-card bg-cream-2">
                <Illustration slot={getArticleSlot(b.slug, 'Race')} alt={b.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 270px" className="!rounded-none" />
              </span>
              <span className="font-semibold">{b.name}</span>
              {b.weight ? <span className="text-sm text-ink-2">{b.weight}</span> : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
