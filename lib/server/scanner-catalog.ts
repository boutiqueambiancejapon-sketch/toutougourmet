import { cache } from 'react'
import { and, desc, eq, isNotNull, sql } from 'drizzle-orm'
import { foodAnalysis } from '@/db/schema'
import type { ProductKind } from '@/lib/scanner/score'
import { brandSlug } from '@/lib/scanner/seo'
import { getDb } from './drizzle'

// @cdc lot 6 — fiches relues (reviewed = true) pour les pages publiques : classement /croquettes,
// pages marque, « meilleures notes » de /scanner et sitemap. Seule une fiche relue et notée y figure.
// Le volume reste faible (relecture manuelle) : une seule requête, filtres et pages en mémoire.
// kind (details.kind) sépare aliments complets et friandises : deux barèmes, jamais mélangés.

export interface ReviewedItem {
  slug: string
  brand: string | null
  brandSlug: string | null
  product: string | null
  score: number
  kind: ProductKind
  updatedAt: Date
}

export const reviewedItems = cache(async (): Promise<ReviewedItem[]> => {
  const d = getDb()
  if (!d) return []
  const rows = await d
    .select({
      slug: foodAnalysis.slug,
      brand: foodAnalysis.brand,
      product: foodAnalysis.product,
      score: foodAnalysis.score,
      kind: sql<string | null>`${foodAnalysis.details}->>'kind'`,
      updatedAt: foodAnalysis.updatedAt,
    })
    .from(foodAnalysis)
    .where(and(eq(foodAnalysis.reviewed, true), isNotNull(foodAnalysis.score)))
    .orderBy(desc(foodAnalysis.score), foodAnalysis.brand, foodAnalysis.product)
  return rows.map((r) => ({ ...r, score: r.score ?? 0, kind: r.kind === 'treat' ? 'treat' : 'complete', brandSlug: brandSlug(r.brand) }))
})

/** Même liste, sans jamais faire échouer la page qui l'affiche. `kind` : aliments complets ou friandises seulement. */
export async function reviewedItemsSafe(kind?: ProductKind): Promise<ReviewedItem[]> {
  const items = await reviewedItems().catch((err: unknown) => {
    console.error('[scanner] fiches relues indisponibles', err instanceof Error ? err.message : err)
    return []
  })
  return kind ? items.filter((it) => it.kind === kind) : items
}

export interface BrandGroup {
  slug: string
  /** Nom le plus fréquent sur les étiquettes de la marque */
  name: string
  items: ReviewedItem[]
  average: number
}

export function groupByBrand(items: ReviewedItem[]): BrandGroup[] {
  const groups = new Map<string, ReviewedItem[]>()
  for (const it of items) {
    if (!it.brandSlug) continue
    groups.set(it.brandSlug, [...(groups.get(it.brandSlug) ?? []), it])
  }
  return [...groups.entries()]
    .map(([slug, list]) => {
      const names = new Map<string, number>()
      for (const it of list) if (it.brand) names.set(it.brand, (names.get(it.brand) ?? 0) + 1)
      const name = [...names.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? slug
      return { slug, name, items: list, average: Math.round(list.reduce((s, it) => s + it.score, 0) / list.length) }
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
}
