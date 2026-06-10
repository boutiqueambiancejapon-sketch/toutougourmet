import type { MetadataRoute } from 'next'
import { getAllArticles } from '@/lib/mdx'
import { brands } from '@/data/brands'
import { categories } from '@/data/categories'

const BASE = 'https://www.toutou-gourmet.com'
const NOW = new Date().toISOString()

export default function sitemap(): MetadataRoute.Sitemap {
  // ── Pages statiques ─────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: NOW, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/comparateur`, lastModified: NOW, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/quiz`, lastModified: NOW, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/marques`, lastModified: NOW, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE}/chien`, lastModified: NOW, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/blog`, lastModified: NOW, changeFrequency: 'weekly', priority: 0.75 },
    { url: `${BASE}/outils`, lastModified: NOW, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/outils/budget`, lastModified: NOW, changeFrequency: 'monthly', priority: 0.65 },
    { url: `${BASE}/outils/ration`, lastModified: NOW, changeFrequency: 'monthly', priority: 0.65 },
    { url: `${BASE}/outils/cout`, lastModified: NOW, changeFrequency: 'monthly', priority: 0.65 },
    { url: `${BASE}/outils/poids`, lastModified: NOW, changeFrequency: 'monthly', priority: 0.65 },
    { url: `${BASE}/comparatifs/elmut-vs-dog-chef`, lastModified: NOW, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${BASE}/plan-du-site`, lastModified: NOW, changeFrequency: 'weekly', priority: 0.3 },
    { url: `${BASE}/a-propos`, lastModified: NOW, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/mentions-legales`, lastModified: NOW, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE}/politique-de-confidentialite`, lastModified: NOW, changeFrequency: 'yearly', priority: 0.2 },
  ]

  // ── Pages marques ────────────────────────────────────────────────────────────
  const brandPages: MetadataRoute.Sitemap = brands.map((b) => ({
    url: `${BASE}/marques/${b.slug}`,
    lastModified: NOW,
    changeFrequency: 'weekly',
    priority: 0.85,
  }))

  // ── Pages catégories chien ───────────────────────────────────────────────────
  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE}/chien/${c.slug}`,
    lastModified: NOW,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  // ── Articles ─────────────────────────────────────────────────────────────────
  const articles = getAllArticles()
  const articlePages: MetadataRoute.Sitemap = articles.map((a) => {
    const { frontmatter, slug } = a
    const lastmod = frontmatter.updatedAt || frontmatter.date || NOW
    // Les articles avec categorySlug sont canoniques sur /chien/[cat]/[slug]
    const url = frontmatter.categorySlug
      ? `${BASE}/chien/${frontmatter.categorySlug}/${slug}`
      : `${BASE}/blog/${slug}`
    return {
      url,
      lastModified: new Date(lastmod).toISOString(),
      changeFrequency: 'monthly',
      priority: 0.75,
    }
  })

  return [...staticPages, ...brandPages, ...categoryPages, ...articlePages]
}
