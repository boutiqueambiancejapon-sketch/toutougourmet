import Link from 'next/link'
import { ArticleCard } from '@/components/blog/ArticleCard'
import { getAllArticles } from '@/lib/mdx'

export function BlogPreview() {
  const articles = getAllArticles().slice(0, 3)

  return (
    <section className="py-20 px-6 md:px-10 bg-[var(--bg-surface-2)]">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-[var(--accent-1)] mb-2">Le blog</p>
            <h2 style={{ fontFamily: "'Fraunces', serif" }}>Nos derniers articles</h2>
          </div>
          <Link href="/blog" className="text-sm font-semibold text-[var(--accent-1)] hover:underline whitespace-nowrap shrink-0">
            Voir tout →
          </Link>
        </div>

        {articles.length === 0 ? (
          <p className="text-center text-[var(--text-muted)] py-8">
            Les premiers articles arrivent très bientôt !
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
