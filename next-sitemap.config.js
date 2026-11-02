/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.toutou-gourmet.com',
  generateRobotsTxt: true,
  changefreq: 'weekly',
  priority: 0.7,
  // /en : édition anglaise non indexée tant qu'elle n'a pas de contenu (lot 8)
  // opengraph-image : images de partage, pas des pages
  // /compte : espace personnel (noindex)
  // /croquettes/* : fiches du scanner, listées par leur propre sitemap (relues seulement)
  exclude: ['/api/*', '/tableau-de-bord', '/tableau-de-bord/*', '/compte', '/compte/*', '/croquettes/*', '/blog/*', '/icon.svg', '/mentions-legales', '/politique-de-confidentialite', '/marques/*', '/comparatifs/*', '/contact', '/fiche-aliments-dangereux', '/dev/*', '/en', '/en/*', '*/opengraph-image*', '/marques'],
  additionalPaths: async (config) => [
    { loc: '/', priority: 1.0, changefreq: 'daily' },
    { loc: '/quiz', priority: 0.9, changefreq: 'monthly' },
    { loc: '/comparateur', priority: 0.9, changefreq: 'weekly' },
  ],
  robotsTxtOptions: {
    additionalSitemaps: ['https://www.toutou-gourmet.com/croquettes/sitemap.xml'],
    policies: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/dev/'] },
    ],
  },
}
