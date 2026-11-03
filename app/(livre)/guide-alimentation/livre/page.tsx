import { Book } from '@/components/guide/book/Book'
import { buildBook } from '@/lib/guide/book'

// @cdc guide — route d'impression privée du livre (noindex, hors sitemap, exclue dans
// next-sitemap.config.js). Rendue au build à partir des articles ; scripts/build-guide.mjs
// l'ouvre avec Playwright et l'imprime en A4 dans public/guides/guide-de-la-gamelle.pdf.

export const dynamic = 'force-static'

export default function GuideBookPage() {
  const edition = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date())
  return <Book book={buildBook()} edition={edition} />
}
