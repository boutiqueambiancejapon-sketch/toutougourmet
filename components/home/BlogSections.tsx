import Link from 'next/link'
import { getAllArticles, type Article } from '@/lib/mdx'
import { BlogFeaturedCard } from '@/components/blog/BlogFeaturedCard'
import { BlogPostCard } from '@/components/blog/BlogPostCard'

/**
 * Configuration des sections de la home — par ordre d'apparition.
 * Le `slug` sert de fallback pour le lien "Voir tout" si la querystring
 * `?cat=` n'est pas comprise par BlogExplorer.
 */
const HOME_CATEGORIES: Array<{ label: string; slug: string }> = [
  { label: 'Alimentation', slug: 'alimentation-quotidienne' },
  { label: 'Avis & Comparatif', slug: 'avis-marques' },
  { label: 'Santé', slug: 'sante' },
  { label: 'Race', slug: 'race' },
  { label: 'Urgences & Intoxications', slug: 'urgences' },
]

const ARTICLES_PER_SECTION = 4

interface Section {
  label: string
  slug: string
  articles: Article[]
}

/**
 * Bloc blog de la home — featured (article le plus récent toutes catégories
 * confondues) + 5 sections par catégorie × 4 cards.
 *
 * Remplace l'ancien `ArticlesGrid` qui n'affichait que 4 articles total.
 * Lien "Voir tout" → `/blog?cat={label}` (BlogExplorer pré-sélectionne le
 * filtre depuis le querystring).
 */
export function BlogSections() {
  const all = getAllArticles()
  if (all.length === 0) return null

  const [featured, ...rest] = all

  const sections: Section[] = HOME_CATEGORIES.map((cat) => ({
    label: cat.label,
    slug: cat.slug,
    articles: rest
      .filter((a) => a.frontmatter.category === cat.label)
      .slice(0, ARTICLES_PER_SECTION),
  })).filter((s) => s.articles.length > 0)

  return (
    <section id="blog" className="py-24 px-6 md:px-10 bg-[var(--bg-blue)]">
      <div className="max-w-[1280px] mx-auto">
        {/* En-tête bloc */}
        <div className="flex items-end justify-between mb-12 gap-6 flex-wrap">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent-blue)] mb-2.5">
              Le blog
            </p>
            <h2 className="section-title m-0">
              On écrit,
              <br />
              tu apprends.
            </h2>
          </div>
          <Link
            href="/blog"
            className="text-sm font-bold text-[var(--accent-blue)] hover:underline whitespace-nowrap"
          >
            Tous les {all.length} articles →
          </Link>
        </div>

        {/* Featured (illustration dédiée, design distinct du reste) */}
        <BlogFeaturedCard article={featured} />

        {/* Sections par catégorie */}
        <div className="flex flex-col gap-16 mt-4">
          {sections.map((section) => (
            <div key={section.label}>
              <div className="flex items-baseline justify-between mb-6 gap-4 flex-wrap">
                <h3
                  className="m-0 text-2xl md:text-3xl font-black text-[var(--text-primary)]"
                  style={{
                    fontFamily: "'Fraunces', serif",
                    letterSpacing: '-0.02em',
                  }}
                >
                  {section.label}
                </h3>
                <Link
                  href={`/blog?cat=${encodeURIComponent(section.label)}`}
                  className="text-sm font-bold text-[var(--accent-blue)] hover:underline whitespace-nowrap"
                >
                  Voir tout →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {section.articles.map((a) => (
                  <BlogPostCard key={a.slug} article={a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
