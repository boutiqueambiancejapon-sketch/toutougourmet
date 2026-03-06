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
    <div className="min-h-screen py-10 px-6 md:px-10 bg-[var(--bg-primary)]">
      <div className="max-w-[1280px] mx-auto">

        {/* Header sobre */}
        <div className="mb-10 max-w-[640px]">
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--accent-1)] mb-2">
            Le blog
          </p>
          <h1 className="page-title mb-3">
            Nutrition, comparatifs & conseils — sans bullshit.
          </h1>
          <p className="text-base text-[var(--text-secondary)]">
            Des articles de fond sur l&apos;alimentation de ta bestiole. Pas de langue de bois, pas de contenus sponsorisés.
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[var(--text-muted)]">Les premiers articles arrivent très bientôt !</p>
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
