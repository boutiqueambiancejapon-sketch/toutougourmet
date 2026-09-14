import type { MetadataRoute } from 'next'
import { getAllArticles } from '@/lib/mdx'
import { brands } from '@/data/brands'
import { categories } from '@/data/categories'
import { getNlCategoryByFrSlug, nlCategories } from '@/lib/i18n/categories'
import { alternatesForFrArticle, alternatesForNlArticle } from '@/lib/i18n/alternates'

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
    // @cdc i18n — alternates publiés seulement quand la traduction NL existe
    const languages = frontmatter.categorySlug
      ? alternatesForFrArticle(slug, frontmatter.categorySlug)
      : alternatesForFrArticle(slug)
    return {
      url,
      lastModified: new Date(lastmod).toISOString(),
      changeFrequency: 'monthly',
      priority: 0.75,
      ...(languages ? { alternates: { languages } } : {}),
    }
  })

  // ── Miroir NL-BE ─────────────────────────────────────────────────────────────
  const nlArticles = getAllArticles('nl')

  const nlStaticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/nl`, lastModified: NOW, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/nl/hond`, lastModified: NOW, changeFrequency: 'weekly', priority: 0.7 },
  ]

  const nlCategoryPages: MetadataRoute.Sitemap = nlCategories.map((c) => ({
    url: `${BASE}/nl/hond/${c.slug}`,
    lastModified: NOW,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  const nlArticlePages: MetadataRoute.Sitemap = nlArticles.flatMap((a) => {
    const category = getNlCategoryByFrSlug(a.frontmatter.categorySlug)
    if (!category) return []
    const lastmod = a.frontmatter.updatedAt || a.frontmatter.date || NOW
    const languages = alternatesForNlArticle(a)
    return [{
      url: `${BASE}/nl/hond/${category.slug}/${a.slug}`,
      lastModified: new Date(lastmod).toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 0.75,
      ...(languages ? { alternates: { languages } } : {}),
    }]
  })

  return [
    ...staticPages,
    ...brandPages,
    ...categoryPages,
    ...articlePages,
    ...nlStaticPages,
    ...nlCategoryPages,
    ...nlArticlePages,
  ]
}
