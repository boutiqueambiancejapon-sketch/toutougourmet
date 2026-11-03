import { categories } from '@/data/categories'
import { brands, getDuelPairs } from '@/data/brands'
import { BRAND_PAGES_DATE, PAGE_DATES } from '@/data/page-dates'
import { getAllArticles, getComparatif, type Article } from '@/lib/mdx'
import { BRAND_MIN_REVIEWED, RANKING_MIN_REVIEWED } from '@/lib/scanner/seo'
import { groupByBrand, reviewedItemsSafe } from '@/lib/server/scanner-catalog'
import { sitemapTypeOf, type SitemapType } from './types'

// @cdc seo — liste des URL des sitemaps : uniquement des adresses finales en 200 (aucune
// redirection, aucune page noindex). Même périmètre que l'ancien next-sitemap : pas de /compte,
// /tableau-de-bord, /blog/*, /marques*, /comparatifs/*, pages légales, /contact,
// /fiche-aliments-dangereux, /guide-alimentation/livre, /newsletter/*, /dev/*, /en, images.
// Jamais la date du build en lastmod (docs/06-seo.md, « Sitemaps »).

export interface SitemapEntry {
  path: string
  lastmod: Date
}

/** Frontmatter : gray-matter rend une date non entre guillemets en objet Date. */
function toDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  if (typeof value !== 'string' || !value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

const day = (iso: string): Date => new Date(`${iso}T00:00:00Z`)
const latest = (dates: Date[]): Date => new Date(Math.max(...dates.map((d) => d.getTime())))

function articleDate(a: Article): Date {
  const date = toDate(a.frontmatter.updatedAt) ?? toDate(a.frontmatter.date)
  if (!date) throw new Error(`[sitemaps] article sans date ni updatedAt : ${a.slug}`)
  return date
}

function pageDate(path: string): Date {
  const iso = PAGE_DATES[path]
  if (!iso) throw new Error(`[sitemaps] date manquante dans data/page-dates.ts pour ${path}`)
  return day(iso)
}

function brandEntries(): SitemapEntry[] {
  const brandPages = brands.map((b) => ({ path: `/chien/marque/${b.slug}`, lastmod: day(BRAND_PAGES_DATE) }))
  const duels = getDuelPairs().map(([a, b]) => {
    const slug = `${a.slug}-vs-${b.slug}`
    // Duel éditorial (content/comparatifs) : sa date ; duel automatique : date des fiches marque
    const editorial = getComparatif(slug)
    const date = editorial ? toDate(editorial.frontmatter.updatedAt) ?? toDate(editorial.frontmatter.date) : null
    return { path: `/chien/marque/${slug}`, lastmod: date ?? day(BRAND_PAGES_DATE) }
  })
  return [...brandPages, ...duels, { path: '/chien/marque/comparatif', lastmod: pageDate('/chien/marque/comparatif') }]
}

/** Articles MDX, hubs, outils et pages principales (tout sauf les fiches croquettes). */
function contentEntries(): SitemapEntry[] {
  const articles = getAllArticles().filter((a) => a.frontmatter.categorySlug)
  const articleEntries = articles.map((a) => ({
    path: `/chien/${a.frontmatter.categorySlug}/${a.slug}`,
    lastmod: articleDate(a),
  }))
  const newest = latest(articleEntries.map((e) => e.lastmod))

  // Hub de rubrique : date de son article le plus récent (rubrique mère : ses sous-rubriques)
  const hubs = categories.map((c) => {
    const sources = c.subCategorySlugs ?? [c.slug]
    const dates = articles.filter((a) => sources.includes(a.frontmatter.categorySlug)).map(articleDate)
    return { path: `/chien/${c.slug}`, lastmod: dates.length > 0 ? latest(dates) : newest }
  })
  const brandPages = brandEntries()

  const pages = Object.keys(PAGE_DATES)
    .filter((path) => !path.startsWith('/chien/'))
    .map((path) => ({ path, lastmod: pageDate(path) }))
    // Le plan du site liste tous les articles : il change avec le dernier publié
    .map((e) => (e.path === '/plan-du-site' ? { ...e, lastmod: latest([e.lastmod, newest]) } : e))

  return [
    ...pages,
    { path: '/chien', lastmod: newest },
    { path: '/blog', lastmod: newest },
    ...hubs,
    { path: '/chien/marque', lastmod: latest(brandPages.map((e) => e.lastmod)) },
    ...brandPages,
    ...articleEntries,
  ]
}

/** Fiches du scanner relues, classement /croquettes et pages marque au-delà des seuils. */
async function croquettesEntries(): Promise<SitemapEntry[]> {
  const items = await reviewedItemsSafe()
  // Classement et pages marque : aliments complets seulement (les friandises ont leur barème)
  const complete = items.filter((i) => i.kind === 'complete')
  const entries: SitemapEntry[] = []
  if (complete.length >= RANKING_MIN_REVIEWED)
    entries.push({ path: '/croquettes', lastmod: latest(complete.map((i) => i.updatedAt)) })
  for (const b of groupByBrand(complete))
    if (b.items.length >= BRAND_MIN_REVIEWED)
      entries.push({ path: `/croquettes/marque/${b.slug}`, lastmod: latest(b.items.map((i) => i.updatedAt)) })
  for (const i of items) entries.push({ path: `/croquettes/${i.slug}`, lastmod: i.updatedAt })
  return entries
}

export async function sitemapEntries(type: SitemapType): Promise<SitemapEntry[]> {
  if (type === 'croquettes') return croquettesEntries()
  return contentEntries().filter((e) => sitemapTypeOf(e.path) === type)
}
