import Link from 'next/link'
import { ArticleCard } from '@/components/blog/ArticleCard'
import { getAllArticles } from '@/lib/mdx'

export function BlogPreview() {
  const articles = getAllArticles().slice(0, 3)

  return (
    <section className="py-16 px-4 bg-[var(--bg-surface-2)]">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex items-center justify-between mb-8 gap-4">
          <h2 style={{ fontFamily: "'Fraunces', serif" }}>
            Nos derniers articles
          </h2>
          <Link href="/blog" className="text-sm font-semibold text-[var(--accent-1)] hover:underline whitespace-nowrap">
            Voir tout →
          </Link>
        </div>

        {articles.length === 0 ? (
          <p className="text-center text-[var(--text-muted)] py-8">
            Les premiers articles arrivent très bientôt !
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
