import type { Metadata } from 'next'
import { SiteDocument } from '@/components/layout/SiteDocument'
import '../globals.css'

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

export default function FrRootLayout({ children }: { children: React.ReactNode }) {
  return <SiteDocument locale="fr">{children}</SiteDocument>
}
