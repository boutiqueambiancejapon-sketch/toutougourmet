import { sitemapEntries } from '@/lib/sitemaps/entries'
import { urlsetXml, xmlResponse } from '@/lib/sitemaps/xml'

// @cdc lot 6 — ancienne adresse du sitemap des croquettes, gardée pour la Search Console qui l'a
// peut-être reçue : même contenu que /sitemaps/croquettes.xml (déclaré dans l'index /sitemap.xml).

export const revalidate = 3600

export async function GET(): Promise<Response> {
  return xmlResponse(urlsetXml(await sitemapEntries('croquettes')))
}
