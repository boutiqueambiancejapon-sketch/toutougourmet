import { TAUX_CLIENT, VALEUR_CLIENT } from '@/data/partner-values'

// @cdc tableau de bord SEO — tout ce qui est propre au site vit ici. Pour copier le tableau de bord sur
// 10minlanguages ou Quel Robot Tondeuse : changer ce fichier (et data/partner-values.ts), garder le reste.

export interface PageTypeRule {
  key: string
  label: string
  /** Libellé au pluriel pour les tableaux (« Fiches produits »). */
  plural: string
  match: RegExp
}

export interface SiteConfig {
  key: string
  name: string
  baseUrl: string
  /** Propriété Search Console (sc-domain:… ou https://…/). */
  gscSite: string
  /** Premier jour avec des données Search Console : la comparaison sur un an n'existe qu'après +364 j. */
  gscStart: string
  /** Premier jour des journaux du serveur (analytics.hits). */
  logsStart: string
  sitemapUrl: string
  /** Hôtes du site dans les journaux et les référents. */
  hosts: string[]
  /** Projet dans le centre de contrôle (table revenue). */
  controlProject: string
  goalMonthly: number
  clientValue: Record<string, number>
  clientRate: Record<string, number>
  pageTypes: PageTypeRule[]
  /** Les autres tableaux de bord : sélecteur de site. */
  sites: { key: string; label: string; url: string }[]
}

export const SITE: SiteConfig = {
  key: 'toutou',
  name: 'Toutou Gourmet',
  baseUrl: 'https://www.toutou-gourmet.com',
  gscSite: process.env.GSC_SITE || 'sc-domain:toutou-gourmet.com',
  gscStart: '2026-03-05',
  logsStart: '2026-11-02',
  sitemapUrl: 'https://www.toutou-gourmet.com/sitemap.xml',
  hosts: ['www.toutou-gourmet.com', 'toutou-gourmet.com'],
  controlProject: 'toutou',
  goalMonthly: 5000,
  clientValue: VALEUR_CLIENT,
  clientRate: TAUX_CLIENT,
  // L'ordre compte : la première règle qui correspond l'emporte.
  pageTypes: [
    { key: 'fiche', label: 'fiche produit', plural: 'Fiches produits', match: /^\/(croquettes|patees|friandises|complements|huiles)\/[^/]+/ },
    { key: 'marque', label: 'page marque', plural: 'Pages marque', match: /^\/chien\/(marque|avis-marques)\/[^/]+/ },
    { key: 'article', label: 'article', plural: 'Articles', match: /^\/(chien\/[^/]+\/[^/]+|blog\/[^/]+)/ },
    { key: 'classement', label: 'classement', plural: 'Classements', match: /^\/meilleures?-[^/]+/ },
    { key: 'promo', label: 'code promo', plural: 'Codes promo', match: /^\/(codes-promo|promo-croquettes-chien|black-friday-croquettes-chien)(\/|$)/ },
    { key: 'outil', label: 'outil', plural: 'Accueil et outils', match: /^\/($|outils|scanner|quiz|comparateur|choisir-croquettes|assistant|mon-chien|guide-alimentation)/ },
  ],
  sites: [
    { key: 'toutou', label: 'Toutou Gourmet', url: 'https://dashboard.toutou-gourmet.com/tableau-de-bord' },
    { key: '10min', label: '10minlanguages', url: 'https://10minlanguages.com/dashboard' },
    { key: 'qrt', label: 'Quel Robot Tondeuse', url: 'https://quel-robot-tondeuse.com/dashboard' },
  ],
}

export const OTHER_TYPE = { key: 'autre', label: 'autre page', plural: 'Autres pages' } as const

/** Type d'une adresse (chemin seul, sans domaine ni #ancre). */
export function pageTypeOf(path: string): string {
  return SITE.pageTypes.find((t) => t.match.test(path))?.key ?? OTHER_TYPE.key
}

export function pageTypeLabel(key: string, plural = false): string {
  const t = SITE.pageTypes.find((x) => x.key === key)
  if (!t) return plural ? OTHER_TYPE.plural : OTHER_TYPE.label
  return plural ? t.plural : t.label
}

/** Expression SQL (PostgreSQL ~) d'un type de page, pour filtrer côté base. */
export function pageTypeSql(key: string): string | null {
  return SITE.pageTypes.find((t) => t.key === key)?.match.source ?? null
}

/** Chemin propre d'une adresse Search Console : sans domaine, sans #ancre, sans requête. */
export function cleanPath(url: string): string {
  let p = url
  for (const h of SITE.hosts) p = p.replace(`https://${h}`, '').replace(`http://${h}`, '')
  p = p.split('#')[0].split('?')[0]
  return p || '/'
}
