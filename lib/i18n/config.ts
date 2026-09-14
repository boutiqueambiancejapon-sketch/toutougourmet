/**
 * Configuration du miroir linguistique.
 *
 * @cdc i18n — le FR reste à la racine (aucune URL existante ne bouge), le NL
 * vit sous /nl/. Chaque locale a son propre root layout (route groups
 * `app/(fr)` et `app/(nl)`) : c'est la seule façon d'émettre un `<html lang>`
 * différent par section dans l'App Router.
 */

export const LOCALES = ['fr', 'nl'] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'fr'

export const SITE_URL = 'https://www.toutou-gourmet.com'

interface LocaleConfig {
  /** Valeur de l'attribut `lang` sur <html> — WCAG 3.1.1 */
  htmlLang: string
  /** Valeur `hreflang` publiée dans les balises alternate */
  hreflang: string
  /** Locale Open Graph */
  ogLocale: string
  /** Préfixe d'URL — chaîne vide pour le FR (racine du domaine) */
  prefix: string
  /** Segment de premier niveau des contenus chien */
  dogSegment: string
  /** Dossier de contenu MDX, relatif à `content/` */
  contentDir: string
}

export const LOCALE_CONFIG: Record<Locale, LocaleConfig> = {
  fr: {
    htmlLang: 'fr',
    hreflang: 'fr',
    ogLocale: 'fr_FR',
    prefix: '',
    dogSegment: 'chien',
    contentDir: 'blog',
  },
  nl: {
    // Néerlandais de Belgique : on ne revendique que le marché belge.
    // Google sert quand même la page aux Pays-Bas faute d'alternative `nl`.
    htmlLang: 'nl-BE',
    hreflang: 'nl-BE',
    ogLocale: 'nl_BE',
    prefix: '/nl',
    dogSegment: 'hond',
    contentDir: 'nl/blog',
  },
}

/** Préfixe une route interne du préfixe de locale (`/quiz` → `/nl/quiz`) */
export function localePath(locale: Locale, path: string): string {
  const prefix = LOCALE_CONFIG[locale].prefix
  if (!prefix) return path
  return path === '/' ? prefix : `${prefix}${path}`
}

/** URL absolue d'un article dans la locale donnée */
export function articleUrl(locale: Locale, categorySlug: string, slug: string): string {
  const { prefix, dogSegment } = LOCALE_CONFIG[locale]
  return `${SITE_URL}${prefix}/${dogSegment}/${categorySlug}/${slug}`
}
