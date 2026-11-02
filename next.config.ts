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
    // @cdc sécurité (audit 2026-11) — WebP seul : l'encodage AVIF de l'optimiseur d'images est visé
    // par des failles de Next 16.1.6 (GHSA-2xp9-vwfh-vxw4) et coûte cher en CPU sur le VPS.
    formats: ['image/webp'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
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
      // Anciens comparatifs V1 (/comparatifs/a-vs-b) : pages déplacées sous /chien/marque
      { source: '/comparatifs/:slug', destination: '/chien/marque/:slug', permanent: true },
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
      { source: '/blog/repas-frais-vs-croquettes-chien', destination: '/chien/avis-marques/repas-frais-vs-croquettes-chien', permanent: true },
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
      { source: '/chien/peut-manger/chien-peut-manger-riz', destination: '/chien/feculents/chien-peut-manger-riz', permanent: true },
      { source: '/chien/peut-manger/chien-peut-manger-oeufs', destination: '/chien/viandes/chien-peut-manger-oeufs', permanent: true },
      { source: '/chien/peut-manger/chien-peut-manger-champignons', destination: '/chien/legumes/chien-peut-manger-champignons', permanent: true },
      { source: '/chien/peut-manger/chien-peut-manger-cerises', destination: '/chien/fruit/chien-peut-manger-cerises', permanent: true },
      { source: '/chien/peut-manger/chien-peut-manger-pates', destination: '/chien/feculents/chien-peut-manger-pates', permanent: true },
      { source: '/chien/peut-manger/chien-peut-manger-sardines', destination: '/chien/viandes/chien-peut-manger-sardines', permanent: true },
      { source: '/chien/peut-manger/chien-peut-manger-pain', destination: '/chien/feculents/chien-peut-manger-pain', permanent: true },
      { source: '/chien/comportement-alimentaire/chien-mange-trop-vite-solutions', destination: '/chien/alimentation-quotidienne/chien-mange-trop-vite-solutions', permanent: true },
      { source: '/chien/alimentation-quotidienne/chien-barbecue-securite-aliments-eviter', destination: '/chien/sante/chien-barbecue-securite-aliments-eviter', permanent: true },

      // ── Ancienne rubrique « alimentation » (2026-11-02) ──────────────────
      // /chien/alimentation n'a pas de page propre (fusionnée dans
      // « alimentation-quotidienne »). Les 8 articles restés en
      // categorySlug "alimentation" passent en "alimentation-quotidienne" ;
      // les 3 guides chiot étaient déjà redirigés plus haut (audit 22/08),
      // les 5 autres l'ont été ici.
      { source: '/chien/alimentation/a-quelle-heure-donner-manger-chien', destination: '/chien/alimentation-quotidienne/a-quelle-heure-donner-manger-chien', permanent: true },
      { source: '/chien/alimentation/combien-fois-par-jour-donner-manger-chien', destination: '/chien/alimentation-quotidienne/combien-fois-par-jour-donner-manger-chien', permanent: true },
      { source: '/chien/alimentation/comment-preparer-repas-chien-soi-meme', destination: '/chien/alimentation-quotidienne/comment-preparer-repas-chien-soi-meme', permanent: true },
      { source: '/chien/alimentation/quand-promener-chien-apres-manger', destination: '/chien/alimentation-quotidienne/quand-promener-chien-apres-manger', permanent: true },
      { source: '/chien/alimentation/quelle-quantite-donner-manger-chien-selon-poids', destination: '/chien/alimentation-quotidienne/quelle-quantite-donner-manger-chien-selon-poids', permanent: true },

      // ── Rubrique « Féculents et céréales » (2026-11-02) ─────────────────
      // Pain, pâtes, riz et maïs quittent « Légumes », l'avoine quitte
      // « Alimentation » ; lentilles et petits pois (légumineuses) passent
      // d'« Alimentation » à « Légumes ».
      { source: '/chien/legumes/chien-peut-manger-pain', destination: '/chien/feculents/chien-peut-manger-pain', permanent: true },
      { source: '/chien/legumes/chien-peut-manger-pommes-de-terre', destination: '/chien/feculents/chien-peut-manger-pommes-de-terre', permanent: true },
      { source: '/chien/legumes/chien-peut-manger-patate-douce', destination: '/chien/feculents/chien-peut-manger-patate-douce', permanent: true },
      { source: '/chien/legumes/chien-peut-manger-pates', destination: '/chien/feculents/chien-peut-manger-pates', permanent: true },
      { source: '/chien/legumes/chien-peut-manger-riz', destination: '/chien/feculents/chien-peut-manger-riz', permanent: true },
      { source: '/chien/legumes/chien-peut-manger-mais', destination: '/chien/feculents/chien-peut-manger-mais', permanent: true },
      { source: '/chien/alimentation-quotidienne/chien-peut-manger-avoine', destination: '/chien/feculents/chien-peut-manger-avoine', permanent: true },
      { source: '/chien/alimentation-quotidienne/chien-peut-manger-lentilles', destination: '/chien/legumes/chien-peut-manger-lentilles', permanent: true },
      { source: '/chien/alimentation-quotidienne/chien-peut-manger-petits-pois', destination: '/chien/legumes/chien-peut-manger-petits-pois', permanent: true },

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
          // @cdc sécurité (audit 2026-11) — 'unsafe-eval' retiré (ni Next en production, ni gtag.js
          // n'en ont besoin) ; 'wasm-unsafe-eval' garde le lecteur zxing (.wasm) du scanner.
          // 'unsafe-inline' reste : scripts en ligne de Next sans nonce (pages statiques).
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com; connect-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com; frame-src 'none'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self';",
          },
        ],
      },
      {
        // @cdc perf — fichiers de public/images : noms non versionnés (une cover peut être régénérée
        // sous le même nom), donc 7 jours + revalidation en arrière-plan, pas « immutable ».
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }],
      },
      {
        // @cdc perf — public/vendor : le numéro de version est dans le nom du fichier (zxing_reader-3.1.6.wasm).
        source: '/vendor/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        // @cdc lot 6 — le scanner lit le code-barres à la caméra (flux traité dans le navigateur).
        // Déclaré après la règle générale : pour une même clé, Next garde la dernière.
        source: '/scanner',
        headers: [{ key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=()' }],
      },
    ]
  },
}

export default withMDX(nextConfig)
