import { cache } from 'react'
import { and, eq, isNotNull, or, sql } from 'drizzle-orm'
import { foodAmazon, foodAnalysis, foodPrice } from '@/db/schema'
import { horsListes, NOM_CLASSEMENT, noteCourante } from '@/lib/scanner/baremes/fiche'
import { avecAmazon, buyLink, type BuyLink } from '@/lib/scanner/buy-link'
import { amazonUrl } from '@/lib/scanner/amazon'
import { AMAZON_TAG } from './amazon'
import { isTherapeutic } from '@/lib/scanner/fiche-lists'
import { foodNoun } from '@/lib/scanner/food-noun'
import { isSupplementName, MIN_BRANDS, MIN_RECIPES, recipeKey, recipeName, type RankRecipe, type RankSegment } from '@/lib/scanner/rankings'
import type { ScoreResult } from '@/lib/scanner/score'
import type { ExtractedLabel } from '@/lib/scanner/types'
import { getDb } from './drizzle'
import { recipeHref } from '@/data/model-reviews'
import { fichesIndexees } from '@/lib/server/fiches-indexees'

// @cdc cluster scanner — recettes des classements : fiches Maxi Zoo et fiches relues, hors aliments
// thérapeutiques et compléments. Plusieurs tailles d'une recette : une ligne, la note la plus basse, par prudence.

export interface RankedRecipe extends RankRecipe {
  key: string
  slug: string
  /** Adresse de la recette : son avis, sa fiche indexée, sinon sa fiche. */
  href: string
  brand: string
  score: number
  image: string | null
  protein: number | null
  buy: BuyLink | null
  /** Même produit chez Amazon (prix relevé il y a moins de 70 minutes), affiché à côté de Maxi Zoo. */
  amazon: { href: string; prix: number | null; prixKg: number | null; poidsKg: number | null } | null
  updatedAt: Date
}

export const rankedRecipes = cache(async (): Promise<RankedRecipe[]> => {
  const d = getDb()
  if (!d) return []
  const rows = await d
    .select({ slug: foodAnalysis.slug, brand: foodAnalysis.brand, product: foodAnalysis.product, score: foodAnalysis.score, image: foodAnalysis.imageUrl, buyUrl: foodAnalysis.buyUrl, prix: foodPrice.prix, prixKg: foodPrice.prixKg, prixAncien: foodPrice.prixAncien, majLe: foodPrice.majLe, extracted: foodAnalysis.extracted, details: foodAnalysis.details, updatedAt: foodAnalysis.updatedAt, amzAsin: foodAmazon.asin, amzPrix: foodAmazon.prix, amzPrixKg: foodAmazon.prixKg, amzPoids: foodAmazon.poidsKg })
    .from(foodAnalysis)
    .leftJoin(foodPrice, eq(foodPrice.foodAnalysisId, foodAnalysis.id))
    .leftJoin(foodAmazon, and(eq(foodAmazon.foodAnalysisId, foodAnalysis.id), eq(foodAmazon.dispo, true), sql`${foodAmazon.majLe} > now() - interval '70 minutes'`))
    .where(and(isNotNull(foodAnalysis.score), sql`NOT ${foodAnalysis.discarded}`, or(eq(foodAnalysis.source, 'maxizoo'), eq(foodAnalysis.reviewed, true))))
  const fiches = await fichesIndexees()
  const best = new Map<string, RankedRecipe>()
  for (const r of rows) {
    const label = r.extracted as ExtractedLabel
    // Interrupteur éteint : la note et le détail en base. Allumé : compléments, huiles, vétérinaire et fiches sans note fiable sortent.
    const { score, details } = noteCourante({ score: r.score, details: r.details as ScoreResult, extracted: label })
    if (!r.brand || !r.product || score === null || isTherapeutic(r) || isSupplementName(r.product) || horsListes(details)) continue
    const key = recipeKey(r.brand, r.product)
    const seen = best.get(key)
    if (seen && seen.score <= score) continue
    best.set(key, {
      key,
      slug: r.slug,
      href: recipeHref(key, r.slug, fiches),
      brand: r.brand,
      name: recipeName(r.product),
      noun: details.bareme?.classement ? NOM_CLASSEMENT[details.bareme.classement] : foodNoun(label, details),
      ingredients: label.ingredients.map((i) => i.nom),
      fat: label.constituants.matieresGrasses,
      protein: label.constituants.proteines,
      score,
      image: r.image,
      buy: avecAmazon(buyLink({ ...r, prix: r.prix === null ? null : { prix: r.prix, prixKg: r.prixKg, prixAncien: r.prixAncien, releve: r.majLe ? r.majLe.toISOString().slice(0, 10) : '' } }), r.amzAsin ? amazonUrl(r.amzAsin, AMAZON_TAG) : null),
      amazon: r.amzAsin ? { href: amazonUrl(r.amzAsin, AMAZON_TAG), prix: r.amzPrix, prixKg: r.amzPrixKg, poidsKg: r.amzPoids } : null,
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
