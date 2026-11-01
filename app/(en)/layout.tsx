import type { Metadata } from 'next'
import { SiteDocument } from '@/components/layout/SiteDocument'
import { MinimalHeader } from '@/components/layout/MinimalHeader'
import { MinimalFooter } from '@/components/layout/MinimalFooter'
import { SITE_URL, ogLocale } from '@/lib/i18n/config'

// @cdc i18n — édition anglaise sous /en. Non indexée tant qu'elle n'a pas de
// contenu rédigé (lot 8 : piliers, outils, hubs race, hreflang, sitemap par langue).
export const metadata: Metadata = {
  // absolute : sans lui, le gabarit du layout racine s'appliquerait au titre par défaut.
  title: {
    absolute: 'Toutou Gourmet — Dog nutrition guides',
    template: '%s | Toutou Gourmet',
  },
  description:
    'Dog nutrition guides with named sources: what a dog can eat, how much, and what to do after an accident.',
  alternates: { canonical: null },
  openGraph: {
    type: 'website',
    locale: ogLocale.en,
    url: `${SITE_URL}/en`,
    siteName: 'Toutou Gourmet',
    title: 'Toutou Gourmet — Dog nutrition guides',
    images: [{ url: '/images/og/home.webp', width: 1200, height: 630 }],
  },
  robots: { index: false, follow: true },
}

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteDocument
      locale="en"
      header={<MinimalHeader locale="en" />}
      footer={<MinimalFooter locale="en" />}
    >
      {children}
    </SiteDocument>
  )
}
