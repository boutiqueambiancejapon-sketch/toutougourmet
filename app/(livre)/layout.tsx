import type { Metadata } from 'next'
import { fraunces, dmSans } from '@/lib/fonts'
import './livre.css'

// @cdc guide — groupe de routes du livre imprimable : son propre <html>, sans en-tête, pied de
// page, barre d'onglets ni mesure d'audience. Jamais indexé.

export const metadata: Metadata = {
  title: { absolute: 'Le guide de la gamelle — Toutou Gourmet' },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  alternates: { canonical: null },
}

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${dmSans.variable}`}>
      <body className="bk">{children}</body>
    </html>
  )
}
