import { cache } from 'react'
import { and, eq, isNotNull, or, sql } from 'drizzle-orm'
import { foodAnalysis } from '@/db/schema'
import { buyLink, type BuyLink } from '@/lib/scanner/buy-link'
import { isTherapeutic } from '@/lib/scanner/fiche-lists'
import { foodNoun } from '@/lib/scanner/food-noun'
import { isSupplementName, MIN_BRANDS, MIN_RECIPES, recipeKey, recipeName, type RankRecipe, type RankSegment } from '@/lib/scanner/rankings'
import type { ScoreResult } from '@/lib/scanner/score'
import type { ExtractedLabel } from '@/lib/scanner/types'
import { getDb } from './drizzle'

// @cdc cluster scanner — recettes des classements : fiches Maxi Zoo et fiches relues, hors aliments
// thérapeutiques et compléments. Plusieurs tailles d'une recette : une ligne, la note la plus basse, par prudence.

export interface RankedRecipe extends RankRecipe {
  key: string
  slug: string
  brand: string
  score: number
  image: string | null
  protein: number | null
  buy: BuyLink | null
  updatedAt: Date
}

export const rankedRecipes = cache(async (): Promise<RankedRecipe[]> => {
  const d = getDb()
  if (!d) return []
  const rows = await d
    .select({ slug: foodAnalysis.slug, brand: foodAnalysis.brand, product: foodAnalysis.product, score: foodAnalysis.score, image: foodAnalysis.imageUrl, buyUrl: foodAnalysis.buyUrl, extracted: foodAnalysis.extracted, details: foodAnalysis.details, updatedAt: foodAnalysis.updatedAt })
    .from(foodAnalysis)
    .where(and(isNotNull(foodAnalysis.score), sql`NOT ${foodAnalysis.discarded}`, or(eq(foodAnalysis.source, 'maxizoo'), eq(foodAnalysis.reviewed, true))))
  const best = new Map<string, RankedRecipe>()
  for (const r of rows) {
    if (!r.brand || !r.product || r.score === null || isTherapeutic(r) || isSupplementName(r.product)) continue
    const label = r.extracted as ExtractedLabel
    const key = recipeKey(r.brand, r.product)
    const seen = best.get(key)
    if (seen && seen.score <= r.score) continue
    best.set(key, {
      key,
      slug: r.slug,
      brand: r.brand,
      name: recipeName(r.product),
      noun: foodNoun(label, r.details as ScoreResult),
      ingredients: label.ingredients.map((i) => i.nom),
      fat: label.constituants.matieresGrasses,
      protein: label.constituants.proteines,
      score: r.score,
      image: r.image,
      buy: buyLink(r),
      updatedAt: r.updatedAt,
    })
  }
  return [...best.values()]
})

export async function segmentRecipes(segment: RankSegment): Promise<RankedRecipe[]> {
  const all = await rankedRecipes().catch((err: unknown) => {
    console.error('[classements] lecture impossible', err instanceof Error ? err.message : err)
    return []
  })
  const list = all.filter(segment.match)
  return list.sort((a, b) => (segment.byFat ? (a.fat ?? 100) - (b.fat ?? 100) : 0) || b.score - a.score || a.brand.localeCompare(b.brand))
}

export function segmentIndexable(segment: RankSegment, list: RankedRecipe[]): boolean {
  const pillar = segment.slug === 'tous' || segment.slug === 'friandises'
  return list.length >= (pillar ? MIN_RECIPES.pillar : MIN_RECIPES.segment) && new Set(list.map((r) => r.brand.toLowerCase())).size >= (pillar ? MIN_BRANDS.pillar : MIN_BRANDS.segment)
}
