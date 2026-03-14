import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllArticles, getArticlesByCategory } from '@/lib/mdx'
import { BlogFilter } from '@/components/blog/BlogFilter'
import { categories } from '@/data/categories'

export const metadata: Metadata = {
  title: 'Blog alimentation chien et chat — Conseils & Guides',
  description:
    "Articles de fond sur l'alimentation premium pour chiens et chats. Comparatifs, guides pratiques, décryptage des étiquettes.",
  alternates: { canonical: 'https://www.toutou-gourmet.com/blog' },
}

// Catégories affichées comme hubs sur la page blog (pas les sous-catégories)
const HUB_SLUGS = ['peut-manger', 'alimentation-quotidienne', 'urgences', 'comportement-alimentaire']

export default function BlogPage() {
  const articles = getAllArticles()

  const hubs = HUB_SLUGS.map((slug) => {
    const cat = categories.find((c) => c.slug === slug)!
    // Pour les hubs avec sous-catégories, sommer les articles des enfants
    const count = cat.subCategorySlugs
      ? cat.subCategorySlugs.reduce((acc, s) => acc + getArticlesByCategory(s).length, 0)
      : getArticlesByCategory(slug).length
    return { slug, label: cat.label, emoji: cat.emoji, count }
  })

  return (
    <div className="min-h-screen py-10 px-6 md:px-10 bg-[var(--bg-primary)]">
      <div className="max-w-[1280px] mx-auto">

        {/* Header */}
        <div className="mb-10 max-w-[640px]">
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--accent-1)] mb-2">
            Le blog
          </p>
          <h1 className="page-title mb-3">
            Nutrition, comparatifs & conseils — sans bullshit.
          </h1>
          <p className="text-base text-[var(--text-secondary)]">
            Des articles de fond sur l&apos;alimentation de ton animal. Pas de langue de bois, pas de contenus sponsorisés.
          </p>
        </div>

        {/* Hub cards — thèmes principaux */}
        <section className="mb-12" aria-label="Explorer par thème">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">
            Explorer par thème
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {hubs.map(({ slug, label, emoji, count }) => (
              <Link
                key={slug}
                href={`/chien/${slug}`}
                className="group bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-4 hover:border-[var(--accent-1)] hover:-translate-y-1 hover:shadow-[var(--shadow-md)] transition-all"
              >
                <p className="text-xl mb-2">{emoji}</p>
                <p className="font-bold text-sm text-[var(--text-primary)] group-hover:text-[var(--accent-1)] transition-colors leading-snug mb-1">
                  {label}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {count} article{count > 1 ? 's' : ''}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Tous les articles + pagination */}
        <section aria-label="Tous les articles">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)] mb-6">
            Tous les articles
          </h2>
          {articles.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[var(--text-muted)]">Les premiers articles arrivent très bientôt !</p>
            </div>
          ) : (
            <BlogFilter articles={articles} />
          )}
        </section>

        {/* Lien comparatifs */}
        <div className="mt-12 bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-bold text-[var(--text-primary)] mb-1">Comparatifs marque vs marque</p>
            <p className="text-sm text-[var(--text-muted)]">Elmut vs Dog Chef, Franklin vs Petty Well… tous nos comparatifs détaillés.</p>
          </div>
          <Link href="/chien/marque/comparatif" className="btn-outline text-sm whitespace-nowrap">
            Voir les comparatifs →
          </Link>
        </div>
      </div>
    </div>
  )
}
