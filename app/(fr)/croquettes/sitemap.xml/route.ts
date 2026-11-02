import { BRAND_MIN_REVIEWED, RANKING_MIN_REVIEWED } from '@/lib/scanner/seo'
import { groupByBrand, reviewedItemsSafe } from '@/lib/server/scanner-catalog'

// @cdc lot 6 — sitemap des croquettes : fiches relues (reviewed = true), classement /croquettes
// dès RANKING_MIN_REVIEWED fiches relues, pages marque dès BRAND_MIN_REVIEWED. Déclaré dans
// robots.txt (next-sitemap.config.js) ; /croquettes et /croquettes/* sont exclus du sitemap statique.

export const revalidate = 3600

const SITE_URL = 'https://www.toutou-gourmet.com'

const latest = (dates: Date[]) => new Date(Math.max(...dates.map((d) => d.getTime())))
const url = (path: string, lastmod: Date) => `  <url><loc>${SITE_URL}${path}</loc><lastmod>${lastmod.toISOString()}</lastmod></url>`

export async function GET(): Promise<Response> {
  const items = await reviewedItemsSafe()
  const lines: string[] = []
  if (items.length >= RANKING_MIN_REVIEWED) lines.push(url('/croquettes', latest(items.map((i) => i.updatedAt))))
  for (const b of groupByBrand(items))
    if (b.items.length >= BRAND_MIN_REVIEWED) lines.push(url(`/croquettes/marque/${b.slug}`, latest(b.items.map((i) => i.updatedAt))))
  for (const i of items) lines.push(url(`/croquettes/${i.slug}`, i.updatedAt))
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${lines.join('\n')}\n</urlset>\n`
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}
