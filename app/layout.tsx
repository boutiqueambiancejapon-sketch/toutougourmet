import type { Metadata } from 'next'
import Script from 'next/script'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Toutou Gourmet — Comparateur de nourriture premium pour chiens et chats',
    template: '%s | Toutou Gourmet',
  },
  description:
    'Le comparateur indépendant et honnête du pet food premium en France. Quiz personnalisé, comparatif des meilleures marques, avis vétérinaires.',
  metadataBase: new URL('https://toutougourmet.fr'),
  alternates: { canonical: 'https://toutougourmet.fr' },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://toutougourmet.fr',
    siteName: 'Toutou Gourmet',
    title: 'Toutou Gourmet — La bouffe premium pour ton animal, enfin comparée honnêtement',
    description:
      'Quiz personnalisé, comparatif des 4 meilleures marques, avis indépendants. Franklin, Elmut, Petty Well, Dog Chef.',
    images: [{ url: '/images/og/home.webp', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        {/* Google Fonts — chargement asynchrone */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Toutou Gourmet',
              url: 'https://toutougourmet.fr',
              description:
                "Comparateur et guide d'alimentation premium pour chiens et chats en France",
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://toutougourmet.fr/recherche?q={search_term_string}',
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

        <Header />
        <main id="main-content">{children}</main>
        <Footer />

        {/* Plausible Analytics */}
        <Script
          defer
          data-domain="toutougourmet.fr"
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
