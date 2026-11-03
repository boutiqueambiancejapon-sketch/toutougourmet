import type { Metadata } from 'next'
import { getAllArticles, toCardArticle } from '@/lib/mdx'
import { BlogHero } from '@/components/blog/BlogHero'
import { BlogExplorer } from '@/components/blog/BlogExplorer'
import { AuthorsBlock } from '@/components/blog/AuthorsBlock'
import { GuideOffer } from '@/components/guide/GuideOffer'
import { bookSummary } from '@/lib/guide/book'

export const metadata: Metadata = {
  title: 'Tous les guides alimentation chien',
  description:
    "Les articles de Toutou Gourmet sur l'alimentation du chien : aliments autorisés ou toxiques, ration, santé, races et marques de croquettes comparées.",
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
      <BlogExplorer articles={articles.map(toCardArticle)} featured={toCardArticle(featured)} />
      <AuthorsBlock />
      <section className="py-20 px-6 bg-[var(--bg-primary)]">
        <div className="max-w-[640px] mx-auto">
          <GuideOffer place="blog" summary={bookSummary()} className="" />
        </div>
      </section>
    </>
  )
}
