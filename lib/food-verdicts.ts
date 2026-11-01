import { getAllArticles } from '@/lib/mdx'

// @cdc seo-geo §6.4 — aliments classés par verdict, tirés des articles « peut-manger »
// (champs ogTitle + verdict). Sert à la section « Que peut manger un [race] ? » des pages race :
// la page race renvoie vers les pages génériques au lieu de dupliquer leur contenu.

export interface FoodVerdict {
  label: string
  href: string
  verdict: 'oui' | 'moderation' | 'danger'
}

/** « Poire : ton chien peut en manger ? » → « Poire » */
function foodLabel(ogTitle: string): string {
  return ogTitle.split(/\s*:\s*/)[0].trim()
}

export function getFoodVerdicts(): FoodVerdict[] {
  return getAllArticles()
    .filter((a) => a.slug.includes('peut-manger') && a.frontmatter.verdict && a.frontmatter.ogTitle && a.frontmatter.categorySlug)
    .map((a) => ({
      label: foodLabel(a.frontmatter.ogTitle as string),
      href: `/chien/${a.frontmatter.categorySlug}/${a.slug}`,
      verdict: a.frontmatter.verdict as FoodVerdict['verdict'],
    }))
    .sort((x, y) => x.label.localeCompare(y.label, 'fr'))
}
