import type { Metadata } from 'next'
import { getAllArticles, getArticlesByCategory } from '@/lib/mdx'
import { categories } from '@/data/categories'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { ArticleTile, articleHref } from '@/components/article/ArticleTile'
import { GuideSearch, type GuideEntry } from '@/components/guides/GuideSearch'
import { TopQuestions } from '@/components/guides/TopQuestions'
import { RubricRows } from '@/components/pillar/RubricRows'

export const metadata: Metadata = {
  title: 'Alimentation et santé du chien — Guides & Conseils',
  description:
    'Tout ce que ton chien peut manger, comment bien le nourrir et quels aliments éviter. Guides pratiques par thème.',
  alternates: { canonical: 'https://www.toutou-gourmet.com/chien' },
}

// @cdc 04-pages — hub Guides V2 (audit design 2026-11-02) : recherche d'abord, puis les questions
// les plus posées, les rubriques en lignes compactes et les derniers guides. Rendu serveur,
// seul le champ de recherche est un composant client.

/** Ordre d'affichage : questions les plus fréquentes d'abord. */
const ORDER = ['peut-manger', 'urgences', 'alimentation-quotidienne', 'sante', 'race', 'comportement-alimentaire', 'avis-marques']
/** Plafond de la liste envoyée au navigateur pour la recherche. */
const SEARCH_MAX = 400

export default function ChienPage() {
  const articles = getAllArticles()
  const rubriques = ORDER.map((slug) => categories.find((c) => c.slug === slug))
    .filter((c): c is (typeof categories)[number] => Boolean(c))
    .map((cat) => {
      const slugs = cat.subCategorySlugs?.length ? cat.subCategorySlugs : [cat.slug]
      const count = slugs.reduce((n, s) => n + getArticlesByCategory(s).length, 0)
      const href = cat.slug === 'race' ? '/chien/race' : `/chien/${cat.slug}`
      return { slug: cat.slug, label: cat.label, count, href }
    })
  const byUpdate = [...articles].sort((a, b) =>
    (b.frontmatter.updatedAt || b.frontmatter.date).localeCompare(a.frontmatter.updatedAt || a.frontmatter.date),
  )
  const searchList: GuideEntry[] = byUpdate.slice(0, SEARCH_MAX).map((a) => ({
    title: a.frontmatter.title,
    href: articleHref(a),
    category: a.frontmatter.categorySlug,
    ...(a.frontmatter.verdict ? { verdict: a.frontmatter.verdict } : {}),
  }))

  return (
    <div className="v2 mx-auto flex max-w-page flex-col gap-12 px-4 pt-6 pb-16 md:px-8 md:pt-10">
      <div className="flex flex-col gap-6">
        <BreadcrumbNav items={[{ label: 'Accueil', href: '/' }, { label: 'Guides' }]} />
        <header className="flex max-w-prose flex-col gap-3">
          <h1 className="m-0 font-display text-[clamp(1.9rem,3.6vw,2.6rem)] font-black leading-[1.08] tracking-tight text-ink">
            Guides nutrition et santé pour chien
          </h1>
          <p className="m-0 text-lg leading-relaxed text-ink-2">
            {articles.length} guides, chacun avec ses sources. Tape un aliment ou une question pour trouver le bon.
          </p>
        </header>
        <div className="max-w-prose">
          <GuideSearch guides={searchList} />
        </div>
      </div>

      <TopQuestions articles={articles} />

      <section aria-labelledby="rubriques" className="flex flex-col gap-3">
        <h2 id="rubriques" className="m-0 font-display text-2xl font-black text-ink">Par rubrique</h2>
        <RubricRows rows={rubriques} label="Rubriques" />
      </section>

      <section aria-labelledby="derniers" className="flex flex-col gap-4">
        <h2 id="derniers" className="m-0 font-display text-2xl font-black text-ink">Les derniers guides</h2>
        <ul role="list" className="m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {byUpdate.slice(0, 6).map((a) => (
            <li key={a.slug}>
              <ArticleTile article={a} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
