import type { Metadata } from 'next'
import { getAllArticles } from '@/lib/mdx'
import { ArticleCard } from '@/components/blog/ArticleCard'

export const metadata: Metadata = {
  title: 'Blog — Nutrition et conseils pour chiens et chats',
  description:
    "Articles de fond sur l'alimentation premium pour chiens et chats. Comparatifs, guides pratiques, décryptage des étiquettes.",
  alternates: { canonical: 'https://toutougourmet.fr/blog' },
}

export default function BlogPage() {
  const articles = getAllArticles()

  return (
    <div className="min-h-screen py-12 px-4 bg-[var(--bg-primary)]">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-10">
          <h1 className="mb-3" style={{ fontFamily: "'Fraunces', serif" }}>
            Le blog Toutou Gourmet
          </h1>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
            Nutrition, comparatifs, conseils vétérinaires — sans blabla, sans langue de bois.
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">🐾</span>
            <p className="text-[var(--text-muted)]">Les premiers articles arrivent très bientôt !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
