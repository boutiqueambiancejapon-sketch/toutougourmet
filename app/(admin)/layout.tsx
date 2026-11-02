import type { Metadata } from 'next'
import { fraunces, dmSans } from '@/lib/fonts'

// @cdc tableau de bord — groupe de routes privé : son propre <html>, sans en-tête du site,
// sans GA ni AdSense (on ne mesure pas le propriétaire qui lit ses chiffres).

export const metadata: Metadata = {
  title: { absolute: 'Tableau de bord — Toutou Gourmet' },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  alternates: { canonical: null },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${dmSans.variable}`}>
      <body className="min-h-dvh bg-cream font-body text-ink">{children}</body>
    </html>
  )
}
