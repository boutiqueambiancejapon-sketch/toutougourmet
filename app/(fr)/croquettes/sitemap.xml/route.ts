import { reviewedSlugs } from '@/lib/server/scanner'

// @cdc lot 6 — sitemap des fiches croquettes : seulement les fiches relues (reviewed = true).
// Déclaré dans robots.txt (next-sitemap.config.js) ; /croquettes/* est exclu du sitemap statique.

export const revalidate = 3600

const SITE_URL = 'https://www.toutou-gourmet.com'

export async function GET(): Promise<Response> {
  const rows = await reviewedSlugs().catch(() => [])
  const urls = rows
    .map((r) => `  <url><loc>${SITE_URL}/croquettes/${r.slug}</loc><lastmod>${r.updatedAt.toISOString()}</lastmod></url>`)
    .join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}
