import type { ReactNode } from 'react'
import Script from 'next/script'
import ScrollToTop from './ScrollToTop'
import { Tracking } from '@/components/analytics/Tracking'
import GoogleAnalyticsPageView from './GoogleAnalyticsPageView'
import { fraunces, dmSans } from '@/lib/fonts'
import { SITE_URL, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'

// @cdc i18n — document HTML commun à toutes les langues : <html lang>, scripts
// tiers, lien d'évitement, en-tête et pied de page fournis par le layout de la langue.

interface SiteDocumentProps {
  locale: Locale
  header: ReactNode
  footer: ReactNode
  children: ReactNode
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Toutou Gourmet',
  url: SITE_URL,
  description: "Comparateur et guide d'alimentation premium pour chiens et chats en France",
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/recherche?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
}

export function SiteDocument({ locale, header, footer, children }: SiteDocumentProps) {
  const t = getDictionary(locale)

  return (
    <html lang={locale} className={`${fraunces.variable} ${dmSans.variable}`}>
      {/* eslint-disable-next-line @next/next/no-head-element -- App Router : ce composant n'est rendu que par les layouts de langue et app/not-found.tsx */}
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
        {locale === 'fr' && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
          />
        )}
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-control focus:font-semibold bg-orange text-ink"
        >
          {t.common.skipLink}
        </a>

        {/* Code de vérification de propriété du site (commentaire HTML brut, les commentaires JSX ne sont pas rendus) */}
        <div hidden dangerouslySetInnerHTML={{ __html: '<!-- 5a788ca4d5c1972a86be2ed1757febf2 -->' }} />

        <ScrollToTop />
        <GoogleAnalyticsPageView />
        {header}
        <main id="main-content">{children}</main>
        {footer}

        {/* Plausible Analytics : file d'attente pour les événements envoyés avant le chargement */}
        <Script id="plausible-queue" strategy="afterInteractive">
          {`window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments) }`}
        </Script>
        <Tracking />
        <Script
          defer
          data-domain="toutou-gourmet.com"
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />

      </body>
    </html>
  )
}
