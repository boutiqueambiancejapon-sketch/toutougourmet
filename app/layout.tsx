import type { Metadata } from 'next'
import Script from 'next/script'
import { Fraunces, DM_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ScrollToTop from '@/components/layout/ScrollToTop'
import GoogleAnalyticsPageView from '@/components/layout/GoogleAnalyticsPageView'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['700', '900'],
  display: 'swap',
  variable: '--font-fraunces',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-dm-sans',
})

export const metadata: Metadata = {
  title: {
    default: 'Toutou Gourmet — Comparateur de nourriture premium pour chiens et chats',
    template: '%s | Toutou Gourmet',
  },
  description:
    'Le comparateur indépendant et honnête du pet food premium en France. Quiz personnalisé, comparatif des meilleures marques, avis vétérinaires.',
  metadataBase: new URL('https://www.toutou-gourmet.com'),
  alternates: { canonical: 'https://www.toutou-gourmet.com' },
  // Icônes — on ne déclare PLUS /favicon.ico ici. Raison :
  // 1. Le binaire app/favicon.ico contient encore le scaffold Next.js (triangle Vercel).
  // 2. Tant qu'il n'est pas remplacé par un vrai .ico DA, on évite de pointer vers lui
  //    pour ne pas obliger les navigateurs à le fetcher (round-trip via la redirect
  //    /favicon.ico → /icon.svg de next.config.ts).
  // 3. /icon.svg en première position couvre tous les navigateurs modernes (Chrome,
  //    Firefox, Safari 12+, Edge). Pour les navigateurs très anciens qui ignorent le
  //    <link rel="icon"> et requêtent /favicon.ico en aveugle, la redirect prend le relais.
  // 4. Quand le binaire favicon.ico sera remplacé par le fichier DA, on pourra
  //    le réintégrer ici et virer la redirect.
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-icon.svg', type: 'image/svg+xml' }],
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://www.toutou-gourmet.com',
    siteName: 'Toutou Gourmet',
    title: 'Toutou Gourmet — La bouffe premium pour ton animal, enfin comparée honnêtement',
    description:
      'Quiz personnalisé, comparatif des 4 meilleures marques, avis indépendants. Franklin, Elmut, Petty Well, Dog Chef.',
    images: [{ url: '/images/og/home.webp', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  other: {
    linkavista: 'link-6122-9760',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${dmSans.variable}`}>
      <head>
        {/* Google tag (gtag.js) — GA4 */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-MDHMHXVJRZ"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-MDHMHXVJRZ', { send_page_view: false });
          `}
        </Script>

        {/* Google AdSense — dans <head> pour validation par le robot Google */}
        {/* @cdc §CSP — script tiers approuvé, exception documentée */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7295690633751101"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Toutou Gourmet',
              url: 'https://www.toutou-gourmet.com',
              description:
                "Comparateur et guide d'alimentation premium pour chiens et chats en France",
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://www.toutou-gourmet.com/recherche?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body>
        {/* Skip link accessibilité */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-md focus:font-semibold"
          style={{ backgroundColor: 'var(--accent-1)', color: '#fff' }}
        >
          Aller au contenu principal
        </a>

        <ScrollToTop />
        <GoogleAnalyticsPageView />
        <Header />
        <main id="main-content">{children}</main>
        <Footer />

        {/* Plausible Analytics */}
        <Script
          defer
          data-domain="toutou-gourmet.com"
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />

        {/* Vercel Web Analytics */}
        <Analytics />
      </body>
    </html>
  )
}
