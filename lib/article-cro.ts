import type { Article } from '@/lib/mdx'
import { foodLabel } from '@/lib/food-verdicts'
import { extractSizeBands, type SizeBand } from '@/lib/size-bands'

// @cdc 04-pages — règles d'affichage des blocs de conversion d'article (audit design-cro §3).

/**
 * Appel à l'action principal de l'article (carte des conversions, docs/v2/cro-carte.md) : un seul.
 * - Aliment autorisé ou à limiter, recette : le guide PDF, en haut de l'article (lib/remark-guide-top.ts),
 *   plus rien à la fin depuis l'audit mobile du 2026-11-04 (l'encart compte est retiré aussi, voir
 *   lib/article-signup.ts).
 * - Urgence ou aliment « danger » : rien à vendre ; un lien discret vers la fiche frigo du guide,
 *   tout en bas, après la FAQ.
 * - Autres articles : l'encart compte du sujet (lib/article-signup.ts). La lettre seule a disparu
 *   (races, avis, santé…) : l'e-mail se demande contre le guide, qui inscrit à la lettre.
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
