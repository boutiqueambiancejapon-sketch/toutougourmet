import type { MetadataRoute } from 'next'
import { getAllArticles } from '@/lib/mdx'
import { brands } from '@/data/brands'
import { categories } from '@/data/categories'

const BASE = 'https://www.toutou-gourmet.com'

// @cdc seo — sitemap = uniquement des URL finales (200, canoniques).
// Jamais d'URL qui redirige (/marques/*) ni de route inexistante.
// Pas de lastModified sur les pages statiques : une date de build répétée à
// chaque déploiement apprend à Google à ignorer ce champ. Les articles gardent
// leur vraie date (updatedAt || date).

type Entry = MetadataRoute.Sitemap[number]
const page = (path: string, changeFrequency: Entry['changeFrequency'], priority: number): Entry => ({
  url: `${BASE}${path}`,
  changeFrequency,
  priority,
})

export default function sitemap(): MetadataRoute.Sitemap {
  // ── Pages statiques ─────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    page('', 'daily', 1.0),
    page('/comparateur', 'weekly', 0.9),
    page('/quiz', 'monthly', 0.9),
    page('/chien', 'weekly', 0.8),
    page('/blog', 'weekly', 0.75),
    page('/outils', 'monthly', 0.7),
    page('/outils/budget', 'monthly', 0.65),
    page('/outils/ration', 'monthly', 0.65),
    page('/outils/cout', 'monthly', 0.65),
    page('/outils/poids', 'monthly', 0.65),
    page('/outils/age', 'monthly', 0.65),
    page('/outils/bien-nourri', 'monthly', 0.65),
    page('/auteurs/mathias-c', 'monthly', 0.4),
    page('/plan-du-site', 'weekly', 0.3),
    page('/a-propos', 'monthly', 0.4),
    page('/mentions-legales', 'yearly', 0.2),
    page('/politique-de-confidentialite', 'yearly', 0.2),
  ]

  // ── Marques et comparatifs (/chien/marque/*) ────────────────────────────────
  const brandPages: MetadataRoute.Sitemap = [
    page('/chien/marque', 'weekly', 0.85),
    page('/chien/marque/comparatif', 'weekly', 0.8),
    ...brands.map((b) => page(`/chien/marque/${b.slug}`, 'weekly', 0.85)),
  ]
  const vsPages: MetadataRoute.Sitemap = []
  for (let i = 0; i < brands.length; i++) {
    for (let j = i + 1; j < brands.length; j++) {
      vsPages.push(page(`/chien/marque/${brands[i].slug}-vs-${brands[j].slug}`, 'monthly', 0.75))
    }
  }

  // ── Hubs catégories chien ───────────────────────────────────────────────────
  const categoryPages: MetadataRoute.Sitemap = categories.map((c) =>
    page(`/chien/${c.slug}`, 'weekly', 0.7),
  )

  // ── Articles ─────────────────────────────────────────────────────────────────
  const articlePages: MetadataRoute.Sitemap = getAllArticles().map(({ frontmatter, slug }) => {
    // Les articles avec categorySlug sont canoniques sur /chien/[cat]/[slug]
    const url = frontmatter.categorySlug
      ? `${BASE}/chien/${frontmatter.categorySlug}/${slug}`
      : `${BASE}/blog/${slug}`
    const lastmod = frontmatter.updatedAt || frontmatter.date
    return {
      url,
      ...(lastmod ? { lastModified: new Date(lastmod).toISOString() } : {}),
      changeFrequency: 'monthly',
      priority: 0.75,
    }
  })

  return [...staticPages, ...brandPages, ...vsPages, ...categoryPages, ...articlePages]
}
