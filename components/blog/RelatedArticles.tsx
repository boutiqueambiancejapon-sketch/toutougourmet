/**
 * Section "Continuer votre lecture…"
 *
 * Algorithme de sélection :
 *  1. Jusqu'à 3 articles de la même catégorie (pertinence éditoriale)
 *  2. Compléter jusqu'à 6 avec des articles d'autres catégories
 *     sélectionnés via un pseudo-aléatoire seedé sur le slug courant
 *     → résultat stable entre les renders (SSR-safe, pas de CLS)
 *
 * Rendu : serveur uniquement — CSS scroll-snap sur mobile, grille sur desktop
 */

import { ArticleCard } from '@/components/blog/ArticleCard'
import type { Article } from '@/lib/mdx'
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionary'

// @cdc alimentation — composant maillage interne
interface Props {
  currentSlug: string
  categorySlug: string
  allArticles: Article[]
  locale?: Locale
  /** Construit le href d'une card — défaut : route FR `/chien/[cat]/[slug]` */
  hrefBuilder?: (article: Article) => string
}

/** Pseudo-aléatoire déterministe — stable entre les renders côté serveur */
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const x = Math.sin(seed + i) * 10000
    const j = Math.floor((x - Math.floor(x)) * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function slugToSeed(slug: string): number {
  return slug.split('').reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 1), 0)
}

export function RelatedArticles({
  currentSlug,
  categorySlug,
  allArticles,
  locale = DEFAULT_LOCALE,
  hrefBuilder,
}: Props) {
  const t = getDictionary(locale)
  const others = allArticles.filter((a) => a.slug !== currentSlug)

  // Même catégorie en priorité (max 3)
  const sameCategory = others
    .filter((a) => a.frontmatter.categorySlug === categorySlug)
    .slice(0, 3)

  // Autres catégories — shufflées de façon déterministe
  const otherCategory = others.filter((a) => a.frontmatter.categorySlug !== categorySlug)
  const seed = slugToSeed(currentSlug)
  const shuffled = seededShuffle(otherCategory, seed)

  const fillCount = Math.max(0, 6 - sameCategory.length)
  const related = [...sameCategory, ...shuffled.slice(0, fillCount)]

  if (related.length === 0) return null

  return (
    <section aria-label={t.relatedLabel} className="mt-14">
      <h2
        className="mb-6 text-xl font-bold text-[var(--text-primary)]"
        style={{ fontFamily: "'Fraunces', serif" }}
      >
        {t.relatedTitle}
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
            <ArticleCard
              article={article}
              variant="vertical"
              locale={locale}
              href={hrefBuilder?.(article)}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
