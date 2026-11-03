import type { Metadata } from 'next'
import { fraunces, dmSans } from '@/lib/fonts'

// @cdc fiche de garde — groupe de routes de la page du gardien : son propre <html>, sans en-tête,
// sans GA ni mesure maison (le jeton est dans l'adresse : il ne doit partir nulle part), sans
// Referer sur les liens sortants. Jamais indexé (en plus de X-Robots-Tag posé par proxy.ts).

export const metadata: Metadata = {
  title: { absolute: 'Fiche de garde — Toutou Gourmet' },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  alternates: { canonical: null },
  referrer: 'no-referrer',
  openGraph: null,
}

export default function SitterLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${dmSans.variable}`}>
      <body className="v2 min-h-dvh bg-cream-2 font-body text-ink">{children}</body>
    </html>
  )
}
