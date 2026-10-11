import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArticleCard } from '@/components/blog/ArticleCard'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { categories, getCategoryBySlug } from '@/data/categories'
import { getAllArticles, getArticlesByCategory } from '@/lib/mdx'
import { collections, getCollectionBySlug, PARENT_THEME_CATEGORY } from '@/data/collections'
import { collectionMetadata, getCollectionContent, getPublishedCollections } from '@/lib/collections'
import { CollectionPage } from '@/components/hubs/CollectionPage'
import { ThemedCategoryHub } from '@/components/hubs/ThemedCategoryHub'

interface Props {
  params: Promise<{ category: string }>
}

export async function generateStaticParams() {
  return [...categories, ...collections].map((c) => ({ category: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  const col = getCollectionBySlug(category)
  if (col) return collectionMetadata(col, getAllArticles())
  const cat = getCategoryBySlug(category)
  if (!cat) return {}
  return {
    title: `${cat.label} — Guides pour chiens`,
    description: cat.description,
    alternates: { canonical: `https://www.toutou-gourmet.com/chien/${category}` },
  }
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params
  const col = getCollectionBySlug(category)
  if (col) {
    const all = getAllArticles()
    const content = getCollectionContent(col, all)
    const siblings = getPublishedCollections(all, col.kind).filter((s) => s.collection.slug !== col.slug)
    return <CollectionPage content={content} siblings={siblings} />
  }
  const cat = getCategoryBySlug(category)
  if (!cat) notFound()
  const isThemed = category === PARENT_THEME_CATEGORY

  const isHub = Boolean(cat.subCategorySlugs?.length)

  // Pour un hub : charger articles + sous-catégories
  const subCats = isHub
    ? (cat.subCategorySlugs ?? []).map((slug) => {
        const sub = getCategoryBySlug(slug)
        const articles = getArticlesByCategory(slug)
        return { slug, cat: sub, articles }
      })
    : []

  const articles = isHub ? [] : getArticlesByCategory(category)

  return (
    <div className="min-h-screen py-12 px-4 bg-[var(--bg-primary)]">
      <div className="max-w-[1280px] mx-auto">
        <Breadcrumb items={[
          { label: 'Accueil', href: '/' },
          { label: 'Chien', href: '/chien' },
          { label: cat.label },
        ]} />

        <div className="mb-10 max-w-[640px]">
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--accent-1)] mb-2">
            {cat.emoji} {cat.label}
          </p>
          <h1 className="page-title mb-3">{cat.label}</h1>
          <p className="text-[var(--text-secondary)]">{cat.description}</p>
        </div>

        {isHub ? (
          // Rendu hub : cartes sous-catégories puis articles groupés
          <div className="space-y-14">
            {/* Cartes sous-catégories */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {subCats.map(({ slug, cat: sub, articles: subArticles }) => (
                <Link
                  key={slug}
                  href={`/chien/${slug}`}
                  className="group bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 hover:border-[var(--accent-1)] hover:-translate-y-1 hover:shadow-[var(--shadow-md)] transition-all"
                >
                  <p className="text-2xl mb-3">{sub?.emoji ?? '📂'}</p>
                  <p className="font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-1)] transition-colors mb-1">
                    {sub?.label ?? slug}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">
                    {subArticles.length} article{subArticles.length > 1 ? 's' : ''}
                  </p>
                </Link>
              ))}
            </div>

            {/* Articles groupés par sous-catégorie */}
            {subCats.map(({ slug, cat: sub, articles: subArticles }) =>
              subArticles.length > 0 ? (
                <section key={slug}>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">
                      {sub?.emoji} {sub?.label ?? slug}
                    </h2>
                    <Link
                      href={`/chien/${slug}`}
                      className="text-sm text-[var(--accent-1)] hover:underline"
                    >
                      Voir tout →
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {subArticles.slice(0, 3).map((article) => (
                      <ArticleCard key={article.slug} article={article} />
                    ))}
                  </div>
                </section>
              ) : null
            )}
          </div>
        ) : isThemed ? (
          <ThemedCategoryHub articles={articles} all={getAllArticles()} />
        ) : articles.length === 0 ? (
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-10 text-center">
            <p className="text-[var(--text-muted)]">Les premiers articles arrivent très bientôt.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
