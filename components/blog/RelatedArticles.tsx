/**
 * Section "Continuer votre lecture…"
 *
 * Sélection : voir lib/related-articles.ts (voisins de catégorie + proximité
 * par tags + ponts inter-catégories) — répartit les liens sur tous les articles.
 *
 * Rendu : serveur uniquement — CSS scroll-snap sur mobile, grille sur desktop
 */

import { ArticleCard } from '@/components/blog/ArticleCard'
import type { Article } from '@/lib/mdx'
import { selectRelatedArticles } from '@/lib/related-articles'

// @cdc alimentation — composant maillage interne
interface Props {
  currentSlug: string
  categorySlug: string
  allArticles: Article[]
}

export function RelatedArticles({ currentSlug, categorySlug, allArticles }: Props) {
  const related = selectRelatedArticles(currentSlug, categorySlug, allArticles)

  if (related.length === 0) return null

  return (
    <section aria-label="Articles similaires" className="mt-14">
      <h2
        className="mb-6 text-xl font-bold text-[var(--text-primary)]"
        style={{ fontFamily: "'Fraunces', serif" }}
      >
        Continuer votre lecture…
      </h2>

      {/* Carousel scroll-snap sur mobile · grille sur md+ */}
      <div
        className="
          flex gap-4 overflow-x-auto pb-4
          snap-x snap-mandatory scroll-smooth
          md:grid md:grid-cols-3 md:overflow-visible md:pb-0
          [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
        "
      >
        {related.map((article) => (
          <div
            key={article.slug}
            className="snap-start shrink-0 w-[280px] sm:w-[300px] md:w-auto"
          >
            <ArticleCard article={article} variant="vertical" />
          </div>
        ))}
      </div>
    </section>
  )
}
