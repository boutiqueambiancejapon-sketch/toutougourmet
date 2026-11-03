import type { Article } from '@/lib/mdx'
import { foodLabel } from '@/lib/food-verdicts'
import { extractSizeBands, type SizeBand } from '@/lib/size-bands'

// @cdc 04-pages — règles d'affichage des blocs de conversion d'article (audit design-cro §3).

/**
 * Appel à l'action de fin d'article (carte des conversions, docs/v2/cro-carte.md) : un seul par
 * article.
 * - Aliment autorisé ou à limiter, recette : le guide PDF (l'encart compte est retiré, voir
 *   lib/article-signup.ts).
 * - Urgence ou aliment « danger » : rien à vendre ; un lien discret vers la fiche frigo du guide,
 *   tout en bas, après la FAQ.
 * - Autres articles : l'encart compte du sujet (lib/article-signup.ts) et, hors rubriques
 *   aliments, l'inscription à la lettre en bas de page comme avant.
 */
export type ArticleEndCta = 'guide-aliment' | 'guide-recette' | 'fiche-link' | null

export const isRecipeSlug = (slug: string): boolean => slug.startsWith('recette-') || slug === 'ration-menagere-chien-guide-recettes'

interface EndCtaInput {
  slug: string
  categorySlug: string
  verdict?: 'oui' | 'moderation' | 'danger'
}

export function articleEndCta({ slug, categorySlug, verdict }: EndCtaInput): ArticleEndCta {
  if (categorySlug === 'urgences' || verdict === 'danger') return 'fiche-link'
  if (verdict === 'oui' || verdict === 'moderation') return 'guide-aliment'
  if (isRecipeSlug(slug)) return 'guide-recette'
  return null
}

/** Rubriques aliments : jamais l'encart lettre seul en bas de page (le guide le remplace). */
const FOOD_CATEGORIES = new Set(['peut-manger', 'fruit', 'legumes', 'feculents', 'viandes', 'urgences', 'alimentation-quotidienne'])

export function showsNewsletterBlock(categorySlug: string): boolean {
  return !FOOD_CATEGORIES.has(categorySlug)
}

export interface PortionCalcData {
  food: string
  kcal100: number
  moderation: boolean
  /** Portions du tableau de l'article ; vide si l'article n'en a pas */
  bands: SizeBand[]
}

/**
 * Données du mini-calculateur, ou null : seulement sur les articles « peut-manger »
 * au verdict oui ou modération dont le frontmatter donne l'énergie pour 100 g.
 */
export function getPortionCalc({ slug, frontmatter, rawContent }: Article): PortionCalcData | null {
  const { verdict, kcal100, ogTitle } = frontmatter
  if (!slug.includes('peut-manger') || !kcal100 || !ogTitle) return null
  if (verdict !== 'oui' && verdict !== 'moderation') return null
  const food = foodLabel(ogTitle)
  return food ? { food, kcal100, moderation: verdict === 'moderation', bands: extractSizeBands(rawContent) } : null
}
