import type { Metadata } from 'next'
import { getAllArticles, getArticlesByCategory } from '@/lib/mdx'
import { BlogFilter } from '@/components/blog/BlogFilter'
import { HubCards } from '@/components/blog/HubCards'
import { categories } from '@/data/categories'

export const metadata: Metadata = {
  title: 'Blog alimentation chien et chat — Conseils & Guides',
  description:
    "Articles de fond sur l'alimentation premium pour chiens et chats. Comparatifs, guides pratiques, décryptage des étiquettes.",
  alternates: { canonical: 'https://www.toutou-gourmet.com/blog' },
}

// Couleurs par hub — system pill/accent du site
const HUB_COLORS: Record<string, { band: string; accent: string }> = {
  'peut-manger':              { band: 'var(--pill-rose)',  accent: 'var(--accent-rose)' },
  'alimentation-quotidienne': { band: 'var(--pill-amber)', accent: 'var(--accent-2)'   },
  'urgences':                 { band: '#FFE0D5',           accent: 'var(--accent-1)'   },
  'comportement-alimentaire': { band: 'var(--pill-blue)',  accent: 'var(--accent-blue)' },
  'avis-marques':             { band: 'var(--pill-amber)', accent: 'var(--accent-2)'   },
  'fruit':                    { band: 'var(--pill-rose)',  accent: 'var(--accent-rose)' },
  'legumes':                  { band: 'var(--pill-green)', accent: 'var(--accent-3)'   },
  'viandes':                  { band: '#FFE0D5',           accent: 'var(--accent-1)'   },
}

const HUB_SLUGS = ['peut-manger', 'alimentation-quotidienne', 'urgences', 'comportement-alimentaire', 'avis-marques']
const SUB_SLUGS  = ['fruit', 'legumes', 'viandes']

function buildHubs(slugs: string[]) {
  return slugs.map((slug) => {
    const cat = categories.find((c) => c.slug === slug)!
    const count = cat.subCategorySlugs
      ? cat.subCategorySlugs.reduce((acc, s) => acc + getArticlesByCategory(s).length, 0)
      : getArticlesByCategory(slug).length
    const colors = HUB_COLORS[slug] ?? { band: 'var(--bg-surface-2)', accent: 'var(--text-muted)' }
    return { slug, label: cat.label, description: cat.description, emoji: cat.emoji, count, colors }
  })
}

export default function BlogPage() {
  const articles = getAllArticles()
  const hubs = buildHubs(HUB_SLUGS)
  const subHubs = buildHubs(SUB_SLUGS)

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
        <section className="mb-6" aria-label="Explorer par thème">
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)] mb-5">
            Explorer par thème
          </p>
          <HubCards hubs={hubs} />
        </section>

        {/* Sous-thèmes — fruit / légumes / viandes — depth 3 depuis /blog */}
        <section className="mb-14" aria-label="Explorer par aliment">
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">
            Par aliment
          </p>
          <HubCards hubs={subHubs} columns={3} />
        </section>

        {/* Tous les articles + pagination */}
        <section aria-label="Tous les articles">
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)] mb-6">
            Tous les articles
          </p>
          {articles.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[var(--text-muted)]">Les premiers articles arrivent très bientôt !</p>
            </div>
          ) : (
            <BlogFilter articles={articles} />
          )}
        </section>

      </div>
    </div>
  )
}
