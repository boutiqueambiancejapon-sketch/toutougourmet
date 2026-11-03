import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/sitemaps/xml'

// @cdc seo — robots.txt : mêmes règles que l'ancien fichier de next-sitemap, un seul sitemap
// déclaré (l'index, qui liste les sitemaps par type).

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/dev/'] }],
    host: SITE_URL,
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
