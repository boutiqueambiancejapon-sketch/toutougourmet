import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { ArticleTile, articleHref } from '@/components/article/ArticleTile'
import { VerdictBoard } from '@/components/article/VerdictBoard'
import { categories, getCategoryBySlug } from '@/data/categories'
import { getArticlesByCategory, type Article } from '@/lib/mdx'
import { getFoodVerdicts } from '@/lib/food-verdicts'

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
      <BreadcrumbNav items={[{ label: 'Accueil', href: '/' }, { label: 'Chien', href: '/chien' }, { label: cat.label }]} />

      <header className="flex max-w-prose flex-col gap-3">
        <span className="self-start rounded-pill bg-amber px-3.5 py-1.5 text-sm font-semibold text-amber-ink">
          <span aria-hidden="true">{cat.emoji} </span>
          {articles.length} guide{articles.length > 1 ? 's' : ''}
        </span>
        <h1 className="m-0 font-display text-[clamp(1.9rem,3.6vw,2.6rem)] font-black leading-[1.08] tracking-tight text-ink">{cat.label}</h1>
        <p className="m-0 text-lg leading-relaxed text-ink-2">{cat.description}</p>
      </header>

      {subSlugs.length > 0 ? (
        <nav aria-label="Sous-rubriques" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {subSlugs.map((slug) => {
            const sub = getCategoryBySlug(slug)
            return (
              <Link key={slug} href={`/chien/${slug}`} className="flex flex-col gap-1 rounded-card border border-line bg-paper p-5 text-ink no-underline hover:border-ink">
                <span aria-hidden="true" className="text-2xl">{sub?.emoji}</span>
                <span className="font-semibold">{sub?.label ?? slug}</span>
                <span className="text-sm text-ink-2">{getArticlesByCategory(slug).length} guides</span>
              </Link>
            )
          })}
        </nav>
      ) : null}

      {foods.length > 0 ? (
        <section aria-labelledby="verdicts" className="flex flex-col gap-3">
          <h2 id="verdicts" className="m-0 font-display text-2xl font-black text-ink">Oui, avec modération ou danger : le récapitulatif</h2>
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
    </div>
  )
}
