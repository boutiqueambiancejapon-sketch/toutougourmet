import type { FoodAnalysis } from '@/db/schema'
import { nounWords } from '@/lib/scanner/food-noun'
import { gtinProperty } from '@/lib/scanner/gtin'

// @cdc 06-seo — JSON-LD Product de chaque fiche : le code-barres et la marque disent à Google que
// chaque page parle d'un produit distinct. Le Review vient seulement si la fiche est relue (une
// lecture automatique n'est pas une critique publiée). Avis de la rédaction : pas d'aggregateRating.

export function FicheJsonLd({ row, name, url }: { row: FoodAnalysis; name: string; url: string }) {
  if (row.discarded) return null
  const review =
    row.reviewed && row.score !== null
      ? {
          review: {
            '@type': 'Review',
            author: { '@type': 'Organization', name: 'Toutou Gourmet', url: 'https://www.toutou-gourmet.com' },
            datePublished: row.updatedAt.toISOString().slice(0, 10),
            reviewRating: { '@type': 'Rating', ratingValue: row.score, bestRating: 100, worstRating: 0 },
            reviewBody: row.details.band ? `Composition notée ${row.score}/100 avec le barème publié du scanner de Toutou Gourmet.` : undefined,
          },
        }
      : {}
  const product = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#produit`,
    name,
    url,
    category: nounWords(row.extracted, row.details).forDog,
    image: `${url}/og.png`,
    ...(row.brand ? { brand: { '@type': 'Brand', name: row.brand } } : {}),
    ...gtinProperty(row.ean),
    ...review,
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(product) }} />
}
