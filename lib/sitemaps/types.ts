import { pageTypeOf } from '@/lib/page-type'

// @cdc seo — un sitemap par type de page (docs/06-seo.md, « Sitemaps »). Classement dérivé de
// la classification partagée lib/page-type.ts, avec deux écarts voulus : « nutrition-marques »
// est coupé en deux (alimentation au quotidien → santé et nutrition ; marques, avis, comparatifs
// → marques) et les hubs de rubrique vont avec les pages principales.

export const SITEMAP_TYPES = [
  'aliments',
  'urgences',
  'sante-nutrition',
  'races',
  'marques',
  'recettes',
  'pages',
  'croquettes',
] as const

export type SitemapType = (typeof SITEMAP_TYPES)[number]

export const SITEMAP_LABELS: Record<SitemapType, string> = {
  aliments: 'Aliments « peut-il manger »',
  urgences: 'Urgences',
  'sante-nutrition': 'Santé et nutrition',
  races: 'Races',
  marques: 'Marques, avis et comparatifs',
  recettes: 'Recettes',
  pages: 'Outils et pages principales',
  croquettes: 'Fiches croquettes du scanner',
}

export function isSitemapType(value: string): value is SitemapType {
  return (SITEMAP_TYPES as readonly string[]).includes(value)
}

/** Sitemap d'un chemin final (« /chien/fruit/chien-peut-manger-fraises », « /outils/ration »…). */
export function sitemapTypeOf(path: string): SitemapType {
  const segments = path.replace(/\/+$/, '').split('/').filter(Boolean)
  if (segments[0] === 'croquettes') return 'croquettes'
  // Accueil des guides (/chien) et hubs de rubrique (/chien/fruit, /chien/marque…)
  if (segments[0] === 'chien' && segments.length <= 2) return 'pages'
  switch (pageTypeOf(path)) {
    case 'aliments':
      return 'aliments'
    case 'urgences':
      return 'urgences'
    case 'sante':
      return 'sante-nutrition'
    case 'races':
      return 'races'
    case 'recettes':
      return 'recettes'
    case 'nutrition-marques':
      return segments[1] === 'alimentation-quotidienne' ? 'sante-nutrition' : 'marques'
    case 'autre':
      // Articles des rubriques sans type propre (comportement alimentaire…)
      return segments[0] === 'chien' ? 'sante-nutrition' : 'pages'
    default:
      return 'pages'
  }
}
