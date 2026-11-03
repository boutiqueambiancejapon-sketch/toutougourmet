import type { Metadata } from 'next'

// @cdc lot 4 — espace compte : jamais indexé, jamais mis en cache (contenu propre à chaque
// visiteur), absent du sitemap (liste des sitemaps, lib/sitemaps/entries.ts).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children
}
