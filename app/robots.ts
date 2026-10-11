import type { MetadataRoute } from 'next'

// @cdc seo — robots.txt généré par Next (remplace next-sitemap, qui produisait
// un second sitemap figé dans /public en concurrence avec app/sitemap.ts).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/dev/'] },
    sitemap: 'https://www.toutou-gourmet.com/sitemap.xml',
    host: 'https://www.toutou-gourmet.com',
  }
}
