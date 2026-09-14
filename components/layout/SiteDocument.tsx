/**
 * Document HTML partagé par les deux root layouts (`app/(fr)` et `app/(nl)`).
 *
 * @cdc i18n — l'App Router n'autorise `<html>` que dans un root layout. Pour
 * servir `lang="nl-BE"` sur /nl sans dupliquer le head, chaque route group a son
 * root layout et délègue le document à ce composant.
 */

import Script from 'next/script'
import { Fraunces, DM_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ScrollToTop from '@/components/layout/ScrollToTop'
import GoogleAnalyticsPageView from '@/components/layout/GoogleAnalyticsPageView'
import { LOCALE_CONFIG, SITE_URL, type Locale } from '@/lib/i18n/config'

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

const SKIP_LINK: Record<Locale, string> = {
  fr: 'Aller au contenu principal',
  nl: 'Naar de hoofdinhoud',
}

const SITE_DESCRIPTION: Record<Locale, string> = {
  fr: "Comparateur et guide d'alimentation premium pour chiens et chats en France",
  nl: 'Vergelijker en gids voor premium hondenvoeding in België',
}

export function SiteDocument({
  locale,
  children,
}: {
  locale: Locale
  children: React.ReactNode
}) {
  const config = LOCALE_CONFIG[locale]

  return (
    <html lang={config.htmlLang} className={`${fraunces.variable} ${dmSans.variable}`}>
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
              url: `${SITE_URL}${config.prefix}`,
              inLanguage: config.htmlLang,
              description: SITE_DESCRIPTION[locale],
              ...(locale === 'fr'
                ? {
                    potentialAction: {
                      '@type': 'SearchAction',
                      target: `${SITE_URL}/recherche?q={search_term_string}`,
                      'query-input': 'required name=search_term_string',
                    },
                  }
                : {}),
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
          {SKIP_LINK[locale]}
        </a>

        <ScrollToTop />
        <GoogleAnalyticsPageView />
        <Header locale={locale} />
        <main id="main-content">{children}</main>
        <Footer locale={locale} />

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
