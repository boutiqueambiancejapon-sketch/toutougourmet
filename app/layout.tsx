import type { Metadata } from 'next'
import './globals.css'

// @cdc i18n — layout racine neutre. Chaque langue a son layout qui rend <html lang> :
// app/(fr)/layout.tsx (racine, URLs V1 inchangées) et app/(en)/layout.tsx (/en).
// Les métadonnées par défaut restent ici pour que les pages françaises et la page 404
// globale (app/not-found.tsx) gardent exactement celles de la V1.

export const metadata: Metadata = {
  title: {
    default: 'Toutou Gourmet, bien nourrir son chien',
    template: '%s | Toutou Gourmet',
  },
  description:
    'Ration en grammes, aliments à éviter et croquettes comparées, avec les sources citées, pour nourrir ton chien sans deviner.',
  metadataBase: new URL('https://www.toutou-gourmet.com'),
  // Pas de canonical par défaut : chaque page indexable déclare la sienne ; une page en noindex
  // (compte, mentions, 404) n'en a pas, au lieu de pointer vers l'accueil (audit 2026-11-03, E28).
  // Icônes — on ne déclare PLUS /favicon.ico ici. Raison :
  // 1. Le binaire app/favicon.ico contient encore le scaffold Next.js (triangle Vercel).
  // 2. Tant qu'il n'est pas remplacé par un vrai .ico DA, on évite de pointer vers lui
  //    pour ne pas obliger les navigateurs à le fetcher (round-trip via la redirect
  //    /favicon.ico → /icon.svg de next.config.ts).
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
    title: 'Toutou Gourmet, bien nourrir son chien',
    description:
      'Ration en grammes, aliments à éviter et croquettes comparées, avec les sources citées, pour nourrir ton chien sans deviner.',
  },
  twitter: { card: 'summary_large_image' },
  other: {
    linkavista: 'link-6122-9760',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
