import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllArticles } from '@/lib/mdx'
import { nlCategories } from '@/lib/i18n/categories'
import { SITE_URL } from '@/lib/i18n/config'

const LOCALE = 'nl' as const

export const metadata: Metadata = {
  title: 'Alle gidsen over hondenvoeding',
  description:
    'Alle rubrieken : wat mag een hond eten, dagelijkse voeding, fruit, groenten, vlees en vis, gevaarlijke voeding, eetgedrag, voeding per ras en gezondheid.',
  alternates: { canonical: `${SITE_URL}/nl/hond` },
}

export default function NlDogHubPage() {
  const articles = getAllArticles(LOCALE)

  return (
    <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-12 md:py-16">
      <h1
        className="m-0 mb-10 text-[var(--text-primary)]"
        style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
        }}
      >
        Alle gidsen over hondenvoeding
      </h1>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 m-0 p-0 list-none">
        {nlCategories.map((category) => {
          const count = articles.filter(
            (a) => a.frontmatter.categorySlug === category.frSlug,
          ).length
          return (
            <li key={category.slug}>
              <Link
                href={`/nl/hond/${category.slug}`}
                className="flex flex-col h-full gap-2 p-5 bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-lg)] hover:-translate-y-0.5 hover:border-[var(--accent-1)] hover:shadow-[var(--shadow-sm)] transition-all"
              >
                <h2
                  className="m-0 font-black text-[var(--text-primary)] text-lg leading-tight"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {category.label}
                </h2>
                <p className="m-0 text-sm text-[var(--text-secondary)] leading-relaxed">
                  {category.description}
                </p>
                <span className="mt-auto pt-2 text-xs text-[var(--text-muted)]">
                  {count} {count === 1 ? 'artikel' : 'artikels'}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
