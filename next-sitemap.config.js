/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://toutou-gourmet.com',
  generateRobotsTxt: true,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/api/*', '/contact'],
  additionalPaths: async (config) => [
    { loc: '/', priority: 1.0, changefreq: 'daily' },
    { loc: '/quiz', priority: 0.9, changefreq: 'monthly' },
    { loc: '/comparateur', priority: 0.9, changefreq: 'weekly' },
    { loc: '/marques', priority: 0.8, changefreq: 'weekly' },
  ],
  robotsTxtOptions: {
    additionalSitemaps: [],
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/api/'] },
    ],
  },
}
