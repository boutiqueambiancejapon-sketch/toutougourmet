/**
 * Mapping des catégories éditoriales FR → NL-BE.
 *
 * @cdc i18n — le slug FR reste la **clé canonique** : un article NL déclare
 * `categorySlug: <slug FR>` dans son frontmatter. Le slug NL n'existe que dans
 * l'URL publique. Ça évite de dupliquer la taxonomie et garantit que la
 * résolution de cover (`getArticleSlot`, indexée sur le FR) continue de marcher.
 *
 * La table vit dans `data/nl-categories.json` et pas ici : `scripts/*.mjs`
 * (zéro dépendance, donc incapables d'importer du TS) la lisent aussi pour
 * construire les URLs NL. Une seule source, pas de dérive silencieuse.
 */

import { categories, type Category } from '@/data/categories'
import nlCategoriesData from '@/data/nl-categories.json'
import type { Locale } from './config'

export interface NlCategory {
  /** Slug canonique côté FR — clé de jointure */
  frSlug: string
  /** Slug publié dans l'URL NL */
  slug: string
  label: string
  description: string
}

export const nlCategories: NlCategory[] = nlCategoriesData

const BY_FR_SLUG = new Map(nlCategories.map((c) => [c.frSlug, c]))
const BY_NL_SLUG = new Map(nlCategories.map((c) => [c.slug, c]))

/** Catégorie NL depuis le slug canonique FR */
export function getNlCategoryByFrSlug(frSlug: string): NlCategory | undefined {
  return BY_FR_SLUG.get(frSlug)
}

/** Catégorie NL depuis le slug publié dans l'URL NL */
export function getNlCategoryBySlug(slug: string): NlCategory | undefined {
  return BY_NL_SLUG.get(slug)
}

/** Catégorie FR correspondant à un slug d'URL NL */
export function getFrCategoryByNlSlug(slug: string): Category | undefined {
  const nl = BY_NL_SLUG.get(slug)
  if (!nl) return undefined
  return categories.find((c) => c.slug === nl.frSlug)
}

/**
 * Libellés courts de catégorie (`frontmatter.category`) traduits.
 *
 * @cdc i18n — la clé reste le libellé FR, qui est aussi la clé de
 * `CATEGORY_TABLE` dans `components/blog/blog-categories.ts`. Un article NL
 * garde donc `category:` en FR dans son frontmatter : c'est ce qui permet à la
 * cover et à l'image Open Graph de se résoudre sans mapping supplémentaire.
 * Seul l'affichage est traduit.
 */
const NL_CATEGORY_LABEL: Record<string, string> = {
  Alimentation: 'Voeding',
  'Santé': 'Gezondheid',
  'Avis & Comparatif': 'Reviews & vergelijking',
  Race: 'Ras',
  'Urgences & Intoxications': 'Noodgevallen & vergiftiging',
  Comportement: 'Gedrag',
}

export function localizeCategoryLabel(label: string, locale: Locale): string {
  if (locale === 'fr') return label
  return NL_CATEGORY_LABEL[label] ?? label
}
