import type { Article } from '@/lib/mdx'
import { foodLabel } from '@/lib/food-verdicts'

// @cdc 04-pages — règles d'affichage des blocs de conversion d'article (audit design-cro §3).

/** Rubriques où l'article propose la fiche des aliments dangereux contre l'e-mail. */
const BONUS_CATEGORIES = new Set(['peut-manger', 'fruit', 'legumes', 'viandes', 'urgences', 'alimentation-quotidienne'])

export function showsBonusFiche(categorySlug: string): boolean {
  return BONUS_CATEGORIES.has(categorySlug)
}

export interface PortionCalcData {
  food: string
  kcal100: number
  moderation: boolean
}

/**
 * Données du mini-calculateur, ou null : seulement sur les articles « peut-manger »
 * au verdict oui ou modération dont le frontmatter donne l'énergie pour 100 g.
 */
export function getPortionCalc({ slug, frontmatter }: Article): PortionCalcData | null {
  const { verdict, kcal100, ogTitle } = frontmatter
  if (!slug.includes('peut-manger') || !kcal100 || !ogTitle) return null
  if (verdict !== 'oui' && verdict !== 'moderation') return null
  const food = foodLabel(ogTitle)
  return food ? { food, kcal100, moderation: verdict === 'moderation' } : null
}
