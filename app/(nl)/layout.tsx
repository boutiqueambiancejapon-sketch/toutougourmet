import type { Metadata } from 'next'
import { SiteDocument } from '@/components/layout/SiteDocument'
import '../globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Toutou Gourmet — Hondenvoeding eerlijk vergeleken',
    template: '%s | Toutou Gourmet',
  },
  description:
    'De onafhankelijke vergelijker van premium hondenvoeding in België. Voedingsgidsen, merkreviews en advies van dierenartsen.',
  metadataBase: new URL('https://www.toutou-gourmet.com'),
  alternates: { canonical: 'https://www.toutou-gourmet.com/nl' },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-icon.svg', type: 'image/svg+xml' }],
  },
  openGraph: {
    type: 'website',
    locale: 'nl_BE',
    url: 'https://www.toutou-gourmet.com/nl',
    siteName: 'Toutou Gourmet',
    title: 'Toutou Gourmet — Hondenvoeding eerlijk vergeleken',
    description:
      'Voedingsgidsen, merkreviews en onafhankelijk advies voor Belgische hondenbaasjes.',
    images: [{ url: '/images/og/home.webp', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export default function NlRootLayout({ children }: { children: React.ReactNode }) {
  return <SiteDocument locale="nl">{children}</SiteDocument>
}
