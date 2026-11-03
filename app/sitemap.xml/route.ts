import { sitemapEntries } from '@/lib/sitemaps/entries'
import { SITEMAP_TYPES } from '@/lib/sitemaps/types'
import { indexXml, sitemapPath, xmlResponse } from '@/lib/sitemaps/xml'

// @cdc seo — index des sitemaps : un sitemap par type de page (docs/06-seo.md, « Sitemaps »).
// lastmod de chaque sitemap = date la plus récente de ses URL.

export const revalidate = 3600

export async function GET(): Promise<Response> {
  const sitemaps = await Promise.all(
    SITEMAP_TYPES.map(async (type) => {
      const entries = await sitemapEntries(type)
      const lastmod = entries.length > 0 ? new Date(Math.max(...entries.map((e) => e.lastmod.getTime()))) : null
      return { path: sitemapPath(type), lastmod }
    }),
  )
  return xmlResponse(indexXml(sitemaps))
}
