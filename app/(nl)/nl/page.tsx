import type { Metadata } from 'next'
import { getAllArticles } from '@/lib/mdx'
import { ArticleCard } from '@/components/blog/ArticleCard'
import { getDictionary } from '@/lib/i18n/dictionary'
import { getNlCategoryByFrSlug, nlCategories } from '@/lib/i18n/categories'
import { SITE_URL } from '@/lib/i18n/config'
import Link from 'next/link'

const LOCALE = 'nl' as const

export const metadata: Metadata = {
  title: 'Hondenvoeding, eerlijk uitgelegd',
  description:
    'Voedingsgidsen voor honden, geschreven voor Belgische baasjes : wat mag je hond eten, welke brokken kies je en welke voeding is gevaarlijk.',
  alternates: { canonical: `${SITE_URL}/nl` },
}

export default function NlHomePage() {
  const t = getDictionary(LOCALE)
  const articles = getAllArticles(LOCALE)

  return (
    <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-12 md:py-16">
      <header className="max-w-[720px]">
        <h1
          className="m-0 text-[var(--text-primary)]"
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          {t.hubTitle}
        </h1>
        <p className="mt-4 text-base md:text-lg text-[var(--text-secondary)] leading-relaxed">
          {t.hubDescription}
        </p>
      </header>

      <nav aria-label={t.mainNavLabel} className="flex flex-wrap gap-2 mt-8">
        {nlCategories.map((category) => (
          <Link
            key={category.slug}
            href={`/nl/hond/${category.slug}`}
            className="text-sm font-semibold px-3 py-1.5 rounded-full border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-1)]"
          >
            {category.label}
          </Link>
        ))}
      </nav>

      <h2
        className="mt-12 mb-6 text-xl font-bold text-[var(--text-primary)]"
        style={{ fontFamily: "'Fraunces', serif" }}
      >
        {t.hubLatest}
      </h2>

      {articles.length === 0 ? (
        <p className="text-[var(--text-secondary)]">{t.hubEmpty}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => {
            const category = getNlCategoryByFrSlug(article.frontmatter.categorySlug)
            return (
              <ArticleCard
                key={article.slug}
                article={article}
                locale={LOCALE}
                href={category ? `/nl/hond/${category.slug}/${article.slug}` : '/nl'}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
