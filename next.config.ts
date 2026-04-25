import type { NextConfig } from 'next'
import createMDX from '@next/mdx'

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
    turbopackUseSystemTlsCerts: true,
  },
  async redirects() {
    return [
      // Anciennes URLs marques → nouvelle structure /chien/marque/
      { source: '/marques', destination: '/chien/marque', permanent: true },
      { source: '/marques/:slug', destination: '/chien/marque/:slug', permanent: true },

      // Fusion catégorie "Santé & nutrition" → "Santé"
      // Les 2 articles concernés migrent de /chien/sante-nutrition/ vers /chien/sante/
      { source: '/chien/sante-nutrition/:slug', destination: '/chien/sante/:slug', permanent: true },

      // Articles chien /blog/ → /chien/[category]/[slug]
      { source: '/blog/avis-croquettes-orlando-lidl', destination: '/chien/alimentation-quotidienne/avis-croquettes-orlando-lidl', permanent: true },
      { source: '/blog/croquettes-sans-cereales-chien', destination: '/chien/alimentation-quotidienne/croquettes-sans-cereales-chien', permanent: true },
      { source: '/blog/meilleure-nourriture-bichon-maltais', destination: '/chien/alimentation-quotidienne/meilleure-nourriture-bichon-maltais', permanent: true },
      { source: '/blog/meilleures-croquettes-chien-de-chasse', destination: '/chien/alimentation-quotidienne/meilleures-croquettes-chien-de-chasse', permanent: true },
      { source: '/blog/croquettes-ou-patee', destination: '/chien/alimentation-quotidienne/croquettes-ou-patee', permanent: true },
      { source: '/blog/repas-frais-vs-croquettes-chien', destination: '/chien/alimentation-quotidienne/repas-frais-vs-croquettes-chien', permanent: true },
      { source: '/blog/chien-mange-couche-normal', destination: '/chien/comportement-alimentaire/chien-mange-couche-normal', permanent: true },
      { source: '/blog/chien-peut-manger-abricots', destination: '/chien/fruit/chien-peut-manger-abricots', permanent: true },
      { source: '/blog/chien-peut-manger-fraises', destination: '/chien/fruit/chien-peut-manger-fraises', permanent: true },
      { source: '/blog/chien-peut-manger-framboises', destination: '/chien/fruit/chien-peut-manger-framboises', permanent: true },
      { source: '/blog/chien-peut-manger-mures', destination: '/chien/fruit/chien-peut-manger-mures', permanent: true },
      { source: '/blog/chien-peut-manger-myrtilles', destination: '/chien/fruit/chien-peut-manger-myrtilles', permanent: true },
      { source: '/blog/chien-peut-manger-peches', destination: '/chien/fruit/chien-peut-manger-peches', permanent: true },
      { source: '/blog/chien-peut-manger-poires', destination: '/chien/fruit/chien-peut-manger-poires', permanent: true },

      // Article alimentation chat (anciennement catégorie "Guide", à /blog/) → reclassé en Alimentation
      { source: '/blog/choisir-alimentation-chat-guide', destination: '/chien/alimentation-quotidienne/choisir-alimentation-chat-guide', permanent: true },
    ]
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' plausible.io; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: blob:; connect-src 'self' plausible.io;",
          },
        ],
      },
    ]
  },
}

export default withMDX(nextConfig)
