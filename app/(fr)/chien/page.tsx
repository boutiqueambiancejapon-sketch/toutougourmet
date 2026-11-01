import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllArticles, getArticlesByCategory } from '@/lib/mdx'
import { categories } from '@/data/categories'
import { getCategoryPill, type OgTone } from '@/lib/og/tokens'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { ArticleTile } from '@/components/article/ArticleTile'

export const metadata: Metadata = {
  title: 'Alimentation et santé du chien — Guides & Conseils',
  description:
    'Tout ce que ton chien peut manger, comment bien le nourrir et quels aliments éviter. Guides pratiques par thème.',
  alternates: { canonical: 'https://www.toutou-gourmet.com/chien' },
}

// @cdc 04-pages — hub Guides V2 (prototype) : rubriques en tuiles colorées, puis les derniers guides.
const TONE: Record<OgTone, string> = {
  rose: 'bg-rose-bg hover:border-rose-ink',
  green: 'bg-green-bg hover:border-green-ink',
  amber: 'bg-amber-bg hover:border-amber-ink',
  blue: 'bg-blue-bg hover:border-blue-ink',
}

/** Ordre d'affichage : questions les plus fréquentes d'abord. */
const ORDER = ['peut-manger', 'urgences', 'alimentation-quotidienne', 'sante', 'race', 'comportement-alimentaire', 'avis-marques']

export default function ChienPage() {
  const rubriques = ORDER.map((slug) => categories.find((c) => c.slug === slug))
    .filter((c): c is (typeof categories)[number] => Boolean(c))
    .map((cat) => {
      const slugs = cat.subCategorySlugs?.length ? cat.subCategorySlugs : [cat.slug]
      const count = slugs.reduce((n, s) => n + getArticlesByCategory(s).length, 0)
      const href = cat.slug === 'race' ? '/chien/race' : `/chien/${cat.slug}`
      return { ...cat, count, href, tone: getCategoryPill(slugs[0]).tone }
    })
  const latest = [...getAllArticles()]
    .sort((a, b) => (b.frontmatter.updatedAt || b.frontmatter.date).localeCompare(a.frontmatter.updatedAt || a.frontmatter.date))
    .slice(0, 6)

  return (
    <div className="v2 mx-auto flex max-w-page flex-col gap-10 px-4 pt-6 pb-16 md:px-8 md:pt-10">
      <BreadcrumbNav items={[{ label: 'Accueil', href: '/' }, { label: 'Guides' }]} />
      <header className="flex max-w-prose flex-col gap-3">
        <h1 className="m-0 font-display text-[clamp(1.9rem,3.6vw,2.6rem)] font-black leading-[1.08] tracking-tight text-ink">
          Guides nutrition et santé pour chien
        </h1>
        <p className="m-0 text-lg leading-relaxed text-ink-2">
          Choisis une rubrique, ou commence par les derniers guides mis à jour.
        </p>
      </header>

      <nav aria-label="Rubriques">
        <ul role="list" className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {rubriques.map((r) => (
            <li key={r.slug}>
              <Link href={r.href} className={`flex h-full items-start gap-4 rounded-card border border-transparent p-5 text-ink no-underline ${TONE[r.tone]}`}>
                <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-control bg-paper text-2xl">{r.emoji}</span>
                <span className="flex flex-col gap-1">
                  <span className="font-display text-lg font-black leading-tight">{r.label}</span>
                  <span className="line-clamp-2 text-sm text-ink-2">{r.description}</span>
                  <span className="text-xs font-semibold text-ink-2">{r.count} guides</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <section aria-labelledby="derniers" className="flex flex-col gap-4">
        <h2 id="derniers" className="m-0 font-display text-2xl font-black text-ink">Les derniers guides</h2>
        <ul role="list" className="m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((a) => (
            <li key={a.slug}>
              <ArticleTile article={a} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
