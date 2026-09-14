import type { MetadataRoute } from 'next'

const BASE = 'https://www.toutou-gourmet.com'

/**
 * robots.txt servi par l'App Router.
 *
 * @cdc seo — remplace le `public/robots.txt` généré par next-sitemap. Un fichier
 * statique dans `public/` masque la route du même nom : c'est ce qui faisait
 * servir un `public/sitemap.xml` figé au 2026-03-09 (66 URLs, dont des /blog/
 * désormais redirigées) à la place de `app/sitemap.ts`. Voir DECISIONS.md.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/api/', '/dev/'] },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  }
}
