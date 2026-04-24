import type { Metadata } from 'next'
import { getAllArticles } from '@/lib/mdx'
import { BlogHero } from '@/components/blog/BlogHero'
import { BlogExplorer } from '@/components/blog/BlogExplorer'
import { AuthorsBlock } from '@/components/blog/AuthorsBlock'
import { NewsletterBlock } from '@/components/blog/NewsletterBlock'

export const metadata: Metadata = {
  title: 'Blog alimentation chien et chat — Conseils & Guides',
  description:
    "Articles de fond sur l'alimentation premium pour chiens et chats. Comparatifs, guides pratiques, décryptage des étiquettes.",
  alternates: { canonical: 'https://www.toutou-gourmet.com/blog' },
}

export default function BlogPage() {
  const articles = getAllArticles()
  const featured = articles[0]

  if (!featured) {
    return (
      <>
        <BlogHero articleCount={0} />
        <section className="py-16 px-6 md:px-10 bg-[var(--bg-primary)]">
          <div className="max-w-[1280px] mx-auto text-center">
            <p className="text-[var(--text-muted)]">
              Les premiers articles arrivent très bientôt !
            </p>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <BlogHero articleCount={articles.length} />
      <BlogExplorer articles={articles} featured={featured} />
      <AuthorsBlock />
      <section className="py-20 px-6 bg-[var(--bg-primary)]">
        <div className="max-w-[640px] mx-auto">
          <NewsletterBlock />
        </div>
      </section>
    </>
  )
}
