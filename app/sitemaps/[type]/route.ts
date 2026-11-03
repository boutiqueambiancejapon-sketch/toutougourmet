import { sitemapEntries } from '@/lib/sitemaps/entries'
import { isSitemapType, SITEMAP_TYPES } from '@/lib/sitemaps/types'
import { urlsetXml, xmlResponse } from '@/lib/sitemaps/xml'

// @cdc seo — un sitemap par type de page : /sitemaps/aliments.xml, /sitemaps/croquettes.xml…
// Liste fermée (dynamicParams = false) : tout autre nom répond 404.

export const revalidate = 3600
export const dynamicParams = false

export function generateStaticParams(): { type: string }[] {
  return SITEMAP_TYPES.map((type) => ({ type: `${type}.xml` }))
}

export async function GET(_request: Request, { params }: { params: Promise<{ type: string }> }): Promise<Response> {
  const name = (await params).type.replace(/\.xml$/, '')
  if (!isSitemapType(name)) return new Response('Not found', { status: 404 })
  return xmlResponse(urlsetXml(await sitemapEntries(name)))
}
