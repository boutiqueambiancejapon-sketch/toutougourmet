/**
 * Index de traduction et construction des hreflang.
 *
 * @cdc i18n — Google ignore un hreflang non réciproque : chaque page FR traduite
 * doit pointer vers sa version NL **et** l'inverse. L'index est construit une
 * seule fois au build en lisant le frontmatter `translationOf` des articles NL,
 * ce qui rend la réciprocité structurelle (impossible de déclarer un seul sens).
 */

import { getAllArticles, type Article } from '@/lib/mdx'
import { getNlCategoryByFrSlug } from './categories'
import { LOCALE_CONFIG, SITE_URL } from './config'

export interface TranslationPair {
  /** Slug de l'article FR source */
  frSlug: string
  /** Slug de l'article NL traduit */
  nlSlug: string
  /** Slug de catégorie canonique (FR) partagé par les deux versions */
  categorySlug: string
}

let cache: Map<string, TranslationPair> | null = null

/** frSlug → paire de traduction. Mémoïsé : les MDX ne bougent pas au runtime. */
function getIndex(): Map<string, TranslationPair> {
  if (cache) return cache
  const map = new Map<string, TranslationPair>()
  for (const article of getAllArticles('nl')) {
    const frSlug = article.frontmatter.translationOf
    if (!frSlug) continue
    map.set(frSlug, {
      frSlug,
      nlSlug: article.slug,
      categorySlug: article.frontmatter.categorySlug,
    })
  }
  cache = map
  return map
}

export function getTranslationPair(frSlug: string): TranslationPair | undefined {
  return getIndex().get(frSlug)
}

/** URL absolue FR d'un article — `/chien/[cat]/[slug]`, ou `/blog/[slug]` à défaut */
export function frArticleUrl(slug: string, categorySlug?: string): string {
  return categorySlug
    ? `${SITE_URL}/chien/${categorySlug}/${slug}`
    : `${SITE_URL}/blog/${slug}`
}

/** URL absolue NL d'un article, depuis le slug de catégorie **canonique FR** */
export function nlArticleUrl(slug: string, frCategorySlug: string): string | null {
  const category = getNlCategoryByFrSlug(frCategorySlug)
  if (!category) return null
  return `${SITE_URL}${LOCALE_CONFIG.nl.prefix}/${LOCALE_CONFIG.nl.dogSegment}/${category.slug}/${slug}`
}

export type HreflangMap = Record<string, string>

/**
 * Jeu de hreflang d'une paire d'articles. Renvoie `undefined` tant qu'aucune
 * traduction n'existe : une page sans alternative ne publie pas de hreflang.
 */
function buildLanguages(frSlug: string, frCategorySlug?: string): HreflangMap | undefined {
  const pair = getIndex().get(frSlug)
  if (!pair) return undefined
  // Côté NL, l'URL se dérive toujours de la catégorie déclarée par la traduction ;
  // côté FR, du slug de catégorie réellement servi par la route appelante (une
  // page sans `categorySlug` vit sur /blog/[slug], pas sur /chien/…).
  const nlUrl = nlArticleUrl(pair.nlSlug, pair.categorySlug)
  if (!nlUrl) return undefined
  const frUrl = frArticleUrl(frSlug, frCategorySlug)
  return {
    [LOCALE_CONFIG.fr.hreflang]: frUrl,
    [LOCALE_CONFIG.nl.hreflang]: nlUrl,
    'x-default': frUrl,
  }
}

/** hreflang à poser sur une page article FR */
export function alternatesForFrArticle(
  frSlug: string,
  frCategorySlug?: string,
): HreflangMap | undefined {
  return buildLanguages(frSlug, frCategorySlug)
}

/** hreflang à poser sur une page article NL — mêmes liens, sens inverse */
export function alternatesForNlArticle(article: Article): HreflangMap | undefined {
  const frSlug = article.frontmatter.translationOf
  if (!frSlug) return undefined
  return buildLanguages(frSlug, article.frontmatter.categorySlug)
}
