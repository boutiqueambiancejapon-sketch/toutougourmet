import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { ArticleTile, articleHref } from '@/components/article/ArticleTile'
import { VerdictBoard } from '@/components/article/VerdictBoard'
import { categories, getCategoryBySlug } from '@/data/categories'
import { getArticlesByCategory, type Article } from '@/lib/mdx'
import { getFoodVerdicts } from '@/lib/food-verdicts'
import { getPillar } from '@/data/pillars'
import { PillarIntro, PillarFaqAndSources } from '@/components/pillar/PillarSections'
import { RubricRows } from '@/components/pillar/RubricRows'

// @cdc 04-pages — page pilier V2 d'une rubrique : en-tête, verdicts (rubriques aliments),
// article à la une, grille d'articles, JSON-LD CollectionPage + ItemList. Les URL ne changent pas.

interface Props {
  params: Promise<{ category: string }>
}

const SITE_URL = 'https://www.toutou-gourmet.com'
/** Rubriques d'aliments : un tableau des verdicts ouvre la page. */
const FOOD_CATEGORIES = new Set(['fruit', 'legumes', 'viandes', 'urgences'])
/** Ancienne rubrique sans page propre, regroupée ici (ses URL d'articles ne changent pas). */
const MERGED: Record<string, string[]> = { 'alimentation-quotidienne': ['alimentation'] }

export async function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  const cat = getCategoryBySlug(category)
  if (!cat) return {}
  return {
    title: `${cat.label} — Guides pour chiens`,
    description: cat.description,
    alternates: { canonical: `${SITE_URL}/chien/${category}` },
  }
}

const byUpdate = (a: Article, b: Article) =>
  (b.frontmatter.updatedAt || b.frontmatter.date).localeCompare(a.frontmatter.updatedAt || a.frontmatter.date)

export default async function CategoryPage({ params }: Props) {
  const { category } = await params
  const cat = getCategoryBySlug(category)
  if (!cat) notFound()

  const subSlugs = cat.subCategorySlugs ?? []
  const sourceSlugs = subSlugs.length > 0 ? subSlugs : [category, ...(MERGED[category] ?? [])]
  const articles = sourceSlugs.flatMap((s) => getArticlesByCategory(s)).sort(byUpdate)
  const isFood = subSlugs.length > 0 || FOOD_CATEGORIES.has(category)
  const foods = isFood ? getFoodVerdicts().filter((f) => sourceSlugs.includes(f.categorySlug)) : []
  const [featured, ...rest] = articles
  const pillar = getPillar(category)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: cat.label,
    description: cat.description,
    url: `${SITE_URL}/chien/${category}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: articles.length,
      itemListElement: articles.slice(0, 50).map((a, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}${articleHref(a)}`, name: a.frontmatter.title })),
    },
  }

  return (
    <div className="v2 mx-auto flex max-w-page flex-col gap-8 px-4 pt-6 pb-16 md:px-8 md:pt-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BreadcrumbNav items={[{ label: 'Accueil', href: '/' }, { label: 'Guides', href: '/chien' }, { label: cat.label }]} />

      <header className="flex max-w-prose flex-col gap-3">
        <h1 className="m-0 font-display text-[clamp(1.9rem,3.6vw,2.6rem)] font-black leading-[1.08] tracking-tight text-ink">{cat.label}</h1>
        <p className="m-0 text-lg leading-relaxed text-ink-2">{cat.description}</p>
        <p className="m-0 text-sm text-ink-2">
          {articles.length} guide{articles.length > 1 ? 's' : ''} dans cette rubrique, du plus récent au plus ancien.
        </p>
      </header>

      {subSlugs.length > 0 ? (
        <RubricRows
          label="Sous-rubriques"
          columns={3}
          rows={subSlugs.map((slug) => ({
            slug,
            href: `/chien/${slug}`,
            label: getCategoryBySlug(slug)?.label ?? slug,
            count: getArticlesByCategory(slug).length,
          }))}
        />
      ) : null}

      {foods.length > 0 ? (
        <section aria-labelledby="verdicts" className="flex flex-col gap-3">
          <h2 id="verdicts" className="m-0 font-display text-2xl font-black text-ink">Le verdict, aliment par aliment</h2>
          <VerdictBoard foods={foods} max={60} />
        </section>
      ) : null}

      {featured ? <ArticleTile article={featured} featured /> : null}

      {rest.length > 0 ? (
        <section aria-labelledby="tous-les-guides" className="flex flex-col gap-4">
          <h2 id="tous-les-guides" className="m-0 font-display text-2xl font-black text-ink">Tous les guides</h2>
          <ul role="list" className="m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((a) => (
              <li key={a.slug}>
                <ArticleTile article={a} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {pillar ? <PillarIntro pillar={pillar} /> : null}
      {pillar ? <PillarFaqAndSources pillar={pillar} /> : null}
    </div>
  )
}
