import type { SitemapEntry } from './entries'
import type { SitemapType } from './types'

// @cdc seo — rendu XML des sitemaps (schéma sitemaps.org 0.9). Pas de priority ni de changefreq :
// Google les ignore ; seul lastmod compte, et seulement s'il est exact.

export const SITE_URL = 'https://www.toutou-gourmet.com'

export const sitemapPath = (type: SitemapType): string => `/sitemaps/${type}.xml`

const escapeXml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

/** Date seule si l'heure est minuit UTC (dates de frontmatter), sinon horodatage complet. */
function w3cDate(d: Date): string {
  const iso = d.toISOString()
  return iso.endsWith('T00:00:00.000Z') ? iso.slice(0, 10) : iso
}

const HEADER = '<?xml version="1.0" encoding="UTF-8"?>\n'
const NS = 'http://www.sitemaps.org/schemas/sitemap/0.9'

export function urlsetXml(entries: SitemapEntry[]): string {
  const urls = entries.map(
    (e) => `  <url><loc>${escapeXml(SITE_URL + e.path)}</loc><lastmod>${w3cDate(e.lastmod)}</lastmod></url>`,
  )
  return `${HEADER}<urlset xmlns="${NS}">\n${urls.join('\n')}\n</urlset>\n`
}

export function indexXml(sitemaps: { path: string; lastmod: Date | null }[]): string {
  const items = sitemaps.map((s) => {
    const lastmod = s.lastmod ? `<lastmod>${w3cDate(s.lastmod)}</lastmod>` : ''
    return `  <sitemap><loc>${escapeXml(SITE_URL + s.path)}</loc>${lastmod}</sitemap>`
  })
  return `${HEADER}<sitemapindex xmlns="${NS}">\n${items.join('\n')}\n</sitemapindex>\n`
}

export function xmlResponse(xml: string): Response {
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}
