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
import { GuideList } from '@/components/pillar/GuideList'
import { FoodSearch } from '@/components/tools/FoodSearch'
import type { FoodVerdict } from '@/lib/food-verdicts'

// @cdc 04-pages — page pilier V2 d'une rubrique : en-tête, recherche d'aliment + verdicts
// (rubriques aliments), article à la une, 3 cartes récentes, puis liste dense « question →
// verdict » (audit design-CRO, §3 Page pilier). JSON-LD CollectionPage + ItemList. URL inchangées.

interface Props {
  params: Promise<{ category: string }>
}

const SITE_URL = 'https://www.toutou-gourmet.com'
/** Rubriques d'aliments : un tableau des verdicts ouvre la page. */
const FOOD_CATEGORIES = new Set(['fruit', 'legumes', 'viandes', 'feculents', 'urgences'])
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
    title: `${cat.label} : nos guides`,
    description: cat.description,
    alternates: { canonical: `${SITE_URL}/chien/${category}` },
  }
}

/** Cartes illustrées après la carte à la une ; les autres guides passent en liste dense. */
const RECENT_TILES = 3

/** Exemples du champ de recherche : un aliment par verdict quand la rubrique en a. */
function searchPlaceholder(foods: FoodVerdict[]): string {
  const picks = (['danger', 'moderation', 'oui'] as const)
    .map((v) => foods.find((f) => f.verdict === v)?.label)
    .filter((l): l is string => Boolean(l))
  const examples = picks.length >= 2 ? picks : foods.slice(0, 3).map((f) => f.label)
  return `${examples.map((l, i) => (i === 0 ? l : l.toLowerCase())).join(', ')}…`
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
  const recent = rest.slice(0, RECENT_TILES)
  const older = rest.slice(RECENT_TILES)
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

      {foods.length > 0 ? (
        <section aria-labelledby="verdicts" className="flex flex-col gap-4">
          <div className="flex max-w-[560px] flex-col gap-2">
            <h2 id="verdicts" className="m-0 font-display text-2xl font-black text-ink">
              {category === 'urgences' ? "Qu'a-t-il avalé\u00a0?" : 'Mon chien peut-il manger…\u00a0?'}
            </h2>
            <p className="m-0 text-base text-ink-2">{`${foods.length} aliments classés dans cette rubrique, chacun avec son guide.`}</p>
            <FoodSearch foods={foods.map(({ label, href, verdict }) => ({ label, href, verdict }))} placeholder={searchPlaceholder(foods)} />
          </div>
          <VerdictBoard foods={foods} max={60} />
        </section>
      ) : null}

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

      {featured ? <ArticleTile article={featured} featured /> : null}

      {recent.length > 0 ? (
        <section aria-labelledby="recents" className="flex flex-col gap-4">
          <h2 id="recents" className="m-0 font-display text-2xl font-black text-ink">Les derniers guides</h2>
          <ul role="list" className="m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((a) => (
              <li key={a.slug}>
                <ArticleTile article={a} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {older.length > 0 ? (
        <section aria-labelledby="tous-les-guides" className="flex flex-col gap-4">
          <h2 id="tous-les-guides" className="m-0 font-display text-2xl font-black text-ink">Tous les guides</h2>
          <GuideList articles={older} />
        </section>
      ) : null}

      {pillar ? <PillarIntro pillar={pillar} /> : null}
      {pillar ? <PillarFaqAndSources pillar={pillar} /> : null}
    </div>
  )
}
