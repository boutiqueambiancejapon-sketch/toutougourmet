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
      // ── Favicon ─────────────────────────────────────
      // Le binaire `app/favicon.ico` contient le triangle Next.js scaffold
      // (jamais remplacé). On le bypass via redirect vers /icon.svg qui est
      // aux couleurs de la DA. Next.js évalue les redirects AVANT le filesystem
      // donc le binaire scaffold ne sera plus jamais servi.
      // Quand on aura généré un vrai favicon.ico aux couleurs DA, on remplacera
      // le binaire et on virera ce redirect.
      { source: '/favicon.ico', destination: '/icon.svg', permanent: true },

      // ── Partenariat Petty Well → Ultra Premium Direct (mai 2026) ─────────
      // Petty Well a été retiré du comparateur au profit d'Ultra Premium Direct.
      // On redirige les anciennes URLs (slug 'petty-well') vers le nouveau slug
      // pour préserver le SEO et les backlinks externes. Placé AVANT le
      // redirect catch-all /marques/:slug → /chien/marque/:slug pour éviter le
      // double hop sur /marques/petty-well.
      { source: '/marques/petty-well', destination: '/chien/marque/ultra-premium-direct', permanent: true },
      { source: '/chien/marque/petty-well', destination: '/chien/marque/ultra-premium-direct', permanent: true },

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

      // ── Audit SEO 22/08/2026 — 404 confirmées : mauvais préfixe de catégorie ─
      // Ces 13 URL utilisaient un ancien slug de catégorie ou un slug plausible
      // mais faux (categorySlug réel du frontmatter vérifié article par article).
      { source: '/chien/alimentation/alimentation-chiot-0-2-mois', destination: '/chien/alimentation-quotidienne/alimentation-chiot-0-2-mois', permanent: true },
      { source: '/chien/alimentation/alimentation-chiot-2-6-mois', destination: '/chien/alimentation-quotidienne/alimentation-chiot-2-6-mois', permanent: true },
      { source: '/chien/alimentation/alimentation-chiot-6-12-mois', destination: '/chien/alimentation-quotidienne/alimentation-chiot-6-12-mois', permanent: true },
      { source: '/chien/peut-manger/chien-peut-manger-piment', destination: '/chien/urgences/chien-peut-manger-piment', permanent: true },
      { source: '/chien/peut-manger/chien-peut-manger-riz', destination: '/chien/legumes/chien-peut-manger-riz', permanent: true },
      { source: '/chien/peut-manger/chien-peut-manger-oeufs', destination: '/chien/viandes/chien-peut-manger-oeufs', permanent: true },
      { source: '/chien/peut-manger/chien-peut-manger-champignons', destination: '/chien/legumes/chien-peut-manger-champignons', permanent: true },
      { source: '/chien/peut-manger/chien-peut-manger-cerises', destination: '/chien/fruit/chien-peut-manger-cerises', permanent: true },
      { source: '/chien/peut-manger/chien-peut-manger-pates', destination: '/chien/legumes/chien-peut-manger-pates', permanent: true },
      { source: '/chien/peut-manger/chien-peut-manger-sardines', destination: '/chien/viandes/chien-peut-manger-sardines', permanent: true },
      { source: '/chien/peut-manger/chien-peut-manger-pain', destination: '/chien/legumes/chien-peut-manger-pain', permanent: true },
      { source: '/chien/comportement-alimentaire/chien-mange-trop-vite-solutions', destination: '/chien/alimentation-quotidienne/chien-mange-trop-vite-solutions', permanent: true },
      { source: '/chien/alimentation-quotidienne/chien-barbecue-securite-aliments-eviter', destination: '/chien/sante/chien-barbecue-securite-aliments-eviter', permanent: true },

      // Marques comparatif → Petty Well retiré (voir plus haut) : les 3 pages
      // de comparaison "-vs-petty-well" n'ont plus d'équivalent direct après
      // le remplacement de la marque. On redirige vers le comparatif général.
      { source: '/chien/marque/elmut-vs-petty-well', destination: '/chien/marque/comparatif', permanent: true },
      { source: '/chien/marque/dog-chef-vs-petty-well', destination: '/chien/marque/comparatif', permanent: true },
      { source: '/chien/marque/franklin-vs-petty-well', destination: '/chien/marque/comparatif', permanent: true },
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
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' plausible.io https://www.googletagmanager.com https://pagead2.googlesyndication.com https://fundingchoicesmessages.google.com; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: blob: https://www.google-analytics.com https://pagead2.googlesyndication.com; connect-src 'self' plausible.io https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://pagead2.googlesyndication.com https://fundingchoicesmessages.google.com; frame-src https://fundingchoicesmessages.google.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com;",
          },
        ],
      },
    ]
  },
}

export default withMDX(nextConfig)
