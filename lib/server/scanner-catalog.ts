import { cache } from 'react'
import { and, desc, isNotNull, sql } from 'drizzle-orm'
import { foodAnalysis } from '@/db/schema'
import { BAREMES_ACTIFS } from '@/lib/scanner/baremes/config'
import { horsListes, NOM_CLASSEMENT, noteCourante } from '@/lib/scanner/baremes/fiche'
import { isTherapeutic } from '@/lib/scanner/fiche-lists'
import { foodNoun, type FoodNoun } from '@/lib/scanner/food-noun'
import { betterEnough } from '@/lib/scanner/seo'
import type { ProductKind } from '@/lib/scanner/score'
import { brandSlug } from '@/lib/scanner/seo'
import { getDb } from './drizzle'
import { publishedWhere } from './scanner-published'

// @cdc lot 6 — fiches publiées pour les pages publiques : classement /croquettes, pages marque,
// « meilleures notes » de /scanner et sitemap. Seule une fiche publiée (relue, ou fiche Open Pet
// Food Facts complète si OPFF_INDEX_POLICY=complete : lib/server/scanner-published.ts) et notée y figure.
// Le volume reste faible (relecture manuelle) : une seule requête, filtres et pages en mémoire.
// kind (details.kind) sépare aliments complets et friandises : deux barèmes, jamais mélangés.

export interface ReviewedItem {
  slug: string
  brand: string | null
  brandSlug: string | null
  product: string | null
  score: number
  imageUrl: string | null
  kind: ProductKind
  noun: FoodNoun
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
      imageUrl: foodAnalysis.imageUrl,
      kind: sql<string | null>`${foodAnalysis.details}->>'kind'`,
      updatedAt: foodAnalysis.updatedAt,
      extracted: foodAnalysis.extracted,
      details: foodAnalysis.details,
    })
    .from(foodAnalysis)
    .where(and(publishedWhere(), isNotNull(foodAnalysis.score)))
    .orderBy(desc(foodAnalysis.score), foodAnalysis.brand, foodAnalysis.product)
  const items = rows.flatMap(({ extracted, details, ...r }) => {
    const note = noteCourante({ score: r.score, details, extracted })
    if (horsListes(note.details) || (note.details.bareme && note.score === null)) return []
    const noun = note.details.bareme?.classement ? NOM_CLASSEMENT[note.details.bareme.classement] : foodNoun(extracted, note.details)
    return [{ ...r, score: note.score ?? 0, kind: (note.details.bareme ? note.details.kind === 'treat' : r.kind === 'treat') ? ('treat' as const) : ('complete' as const), noun, brandSlug: brandSlug(r.brand) }]
  })
  // Sans recalcul en base, l'ordre de la requête ne suit pas la nouvelle note.
  return BAREMES_ACTIFS ? items.sort((a, b) => b.score - a.score) : items
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

export interface BetterProduct {
  slug: string
  name: string
  score: number
  imageUrl: string | null
  buyUrl: string
}

/** Sous une note faible : le mieux noté de la même catégorie chez Maxi Zoo, d'une autre marque, avec son lien exact. */
export async function betterAtMaxiZoo(noun: FoodNoun, brand: string | null, score: number | null): Promise<BetterProduct | null> {
  const d = getDb()
  const type = noun === 'croquettes' ? 'sec' : noun === 'patee' ? 'humide' : null
  if (!d || score === null || !type) return null
  const rows = await d
    .select({ slug: foodAnalysis.slug, brand: foodAnalysis.brand, product: foodAnalysis.product, score: foodAnalysis.score, imageUrl: foodAnalysis.imageUrl, buyUrl: foodAnalysis.buyUrl })
    .from(foodAnalysis)
    .where(sql`NOT ${foodAnalysis.discarded} AND ${foodAnalysis.buyUrl} IS NOT NULL AND ${foodAnalysis.score} IS NOT NULL
      AND ${foodAnalysis.extracted}->>'typeAliment' = ${type} AND coalesce(${foodAnalysis.details}->>'kind', 'complete') = 'complete'
      AND lower(coalesce(${foodAnalysis.brand}, '')) <> lower(${brand ?? ''})`)
    .orderBy(desc(foodAnalysis.score), foodAnalysis.slug)
    .limit(10)
    .catch((err: unknown) => {
      console.error('[scanner] meilleure alternative', err instanceof Error ? err.message : err)
      return []
    })
  const best = rows.find((r) => r.score !== null && r.buyUrl && betterEnough(r.score, score) && !isTherapeutic(r))
  if (!best || best.score === null || !best.buyUrl) return null
  return { slug: best.slug, name: [best.brand, best.product].filter(Boolean).join(', '), score: best.score, imageUrl: best.imageUrl, buyUrl: best.buyUrl }
}
