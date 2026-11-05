import type { FoodAnalysis } from '@/db/schema'
import type { FoodNoun } from '@/lib/scanner/food-noun'
import { fold, recipeKey } from '@/lib/scanner/rankings'
import { rankedRecipes, type RankedRecipe } from '@/lib/server/rankings'
import type { ScoreResult } from '@/lib/scanner/score'

// @cdc seo — place d'une fiche dans sa marque et parmi les produits de son type, à partir des recettes des classements.

const PLURIEL: Partial<Record<FoodNoun, string>> = { croquettes: 'croquettes', patee: 'pâtées', friandise: 'friandises' }

export interface FichePlace {
  rang: number
  total: number
  moyenne: number | null
  nombre: number
  pluriel: string | null
  partAnimale: number | null
  comparer: RankedRecipe[]
}

export async function fichePlace(row: FoodAnalysis, noun: FoodNoun): Promise<FichePlace | null> {
  if (row.score === null || !row.brand || !row.product) return null
  const score = row.score
  const brand = fold(row.brand)
  const key = recipeKey(row.brand, row.product)
  const toutes = await rankedRecipes().catch(() => [] as RankedRecipe[])
  const memeType = toutes.filter((r) => r.noun === noun)
  const gamme = memeType.filter((r) => fold(r.brand) === brand)
  const seen = new Set<string>()
  const comparer = memeType
    .filter((r) => fold(r.brand) !== brand && r.key !== key && r.buy && r.score >= score)
    .sort((a, b) => b.score - a.score)
    .filter((r) => (seen.has(fold(r.brand)) ? false : Boolean(seen.add(fold(r.brand)))))
    .slice(0, 3)
  const part = (row.details as ScoreResult).criteria?.find((c) => c.id === 'part-animale')?.explanation.match(/^([\d,.]+)\s/)?.[1]
  return {
    rang: gamme.filter((r) => r.score > score).length + 1,
    total: gamme.length,
    moyenne: memeType.length ? Math.round(memeType.reduce((s, r) => s + r.score, 0) / memeType.length) : null,
    nombre: memeType.length,
    pluriel: PLURIEL[noun] ?? null,
    partAnimale: part ? Number(part.replace(',', '.')) : null,
    comparer,
  }
}
