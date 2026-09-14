import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getArticlesByCategory } from '@/lib/mdx'
import { ArticleCard } from '@/components/blog/ArticleCard'
import { getNlCategoryBySlug, nlCategories } from '@/lib/i18n/categories'
import { getDictionary } from '@/lib/i18n/dictionary'
import { SITE_URL } from '@/lib/i18n/config'

const LOCALE = 'nl' as const

interface Props {
  params: Promise<{ category: string }>
}

export async function generateStaticParams() {
  return nlCategories.map((c) => ({ category: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  const nlCategory = getNlCategoryBySlug(category)
  if (!nlCategory) return {}
  return {
    title: nlCategory.label,
    description: nlCategory.description,
    alternates: { canonical: `${SITE_URL}/nl/hond/${category}` },
  }
}

export default async function NlCategoryPage({ params }: Props) {
  const { category } = await params
  const nlCategory = getNlCategoryBySlug(category)
  if (!nlCategory) notFound()

  const t = getDictionary(LOCALE)
  const articles = getArticlesByCategory(nlCategory.frSlug, LOCALE)

  return (
    <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-12 md:py-16">
      <header className="max-w-[720px] mb-10">
        <h1
          className="m-0 text-[var(--text-primary)]"
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          {nlCategory.label}
        </h1>
        <p className="mt-4 text-base md:text-lg text-[var(--text-secondary)] leading-relaxed">
          {nlCategory.description}
        </p>
      </header>

      {articles.length === 0 ? (
        <p className="text-[var(--text-secondary)]">{t.hubEmpty}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard
              key={article.slug}
              article={article}
              locale={LOCALE}
              href={`/nl/hond/${category}/${article.slug}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
