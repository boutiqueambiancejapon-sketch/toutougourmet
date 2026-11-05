import type { ReviewedItem } from '@/lib/server/scanner-catalog'

/** `href` : page indexable du produit (son avis). Sans elle, le nom suffit : une fiche en noindex n'a rien à faire ici. */
type JsonLdItem = Pick<ReviewedItem, 'brand' | 'product'> & { href?: string }
import { SITE_URL } from './ranking-copy'

// @cdc 06-seo — ItemList du classement affiché (même ordre, mêmes positions que la liste visible) :
// URL de chaque fiche, nom lu sur l'étiquette. Pas d'AggregateRating ni de Product : la note est
// celle de notre barème, pas un avis client.

/** Marque + produit, sans répéter la marque quand le nom du produit la contient déjà. */
function itemName(it: JsonLdItem): string {
  const brand = it.brand?.trim() ?? ''
  const product = it.product?.trim() ?? ''
  if (brand && product.toLowerCase().startsWith(brand.toLowerCase())) return product
  return [brand, product].filter(Boolean).join(' ') || 'Produit sans nom'
}

export function RankingJsonLd({ name, path, items, start = 1, total }: { name: string; path: string; items: JsonLdItem[]; start?: number; total: number }) {
  if (items.length === 0) return null
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    url: `${SITE_URL}${path}`,
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    numberOfItems: total,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: start + i,
      ...(it.href ? { url: `${SITE_URL}${it.href}` } : {}),
      name: itemName(it),
    })),
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}
