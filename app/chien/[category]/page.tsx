import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticleCard } from '@/components/blog/ArticleCard'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { categories, getCategoryBySlug } from '@/data/categories'
import { getArticlesByCategory } from '@/lib/mdx'

interface Props {
  params: Promise<{ category: string }>
}

export async function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  const cat = getCategoryBySlug(category)
  if (!cat) return {}
  return {
    title: `${cat.label} — Articles & Guides pour chiens`,
    description: cat.description,
    alternates: { canonical: `https://www.toutou-gourmet.com/chien/${category}` },
  }
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params
  const cat = getCategoryBySlug(category)
  if (!cat) notFound()

  const articles = getArticlesByCategory(category)

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

        {articles.length === 0 ? (
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
