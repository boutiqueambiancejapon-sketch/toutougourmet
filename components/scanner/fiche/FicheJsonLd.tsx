import type { FoodAnalysis } from '@/db/schema'
import { kindOf } from '@/lib/scanner/score'

// @cdc lot 6 — JSON-LD Product + Review d'une fiche, UNIQUEMENT si elle est relue (une lecture
// automatique n'est pas une critique publiée). Avis de la rédaction : pas d'aggregateRating.

export function FicheJsonLd({ row, name, url }: { row: FoodAnalysis; name: string; url: string }) {
  if (!row.reviewed || row.score === null) return null
  const product = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    url,
    category: kindOf(row.details) === 'treat' ? 'Friandises pour chien' : 'Croquettes pour chien',
    image: `${url}/og.png`,
    ...(row.brand ? { brand: { '@type': 'Brand', name: row.brand } } : {}),
    ...(row.ean ? { [row.ean.length === 8 ? 'gtin8' : 'gtin13']: row.ean } : {}),
    review: {
      '@type': 'Review',
      author: { '@type': 'Organization', name: 'Toutou Gourmet', url: 'https://www.toutou-gourmet.com' },
      datePublished: row.updatedAt.toISOString().slice(0, 10),
      reviewRating: { '@type': 'Rating', ratingValue: row.score, bestRating: 100, worstRating: 0 },
      reviewBody: row.details.band ? `Composition notée ${row.score}/100 avec le barème publié du scanner de Toutou Gourmet.` : undefined,
    },
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(product) }} />
}
