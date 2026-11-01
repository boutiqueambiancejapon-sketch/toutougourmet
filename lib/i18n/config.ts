// @cdc i18n — français à la racine (URLs V1 inchangées), autres langues sous /{locale}.
// Les routes françaises vivent dans app/(fr), les routes anglaises dans app/(en)/en :
// un groupe de routes n'apparaît pas dans l'URL, chaque groupe a son layout et son <html lang>.

export const SITE_URL = 'https://www.toutou-gourmet.com'

export const locales = ['fr', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'fr'

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

/** Préfixe d'URL d'une langue : '' pour le français (racine), '/en' pour l'anglais. */
export function localePrefix(locale: Locale): string {
  return locale === defaultLocale ? '' : `/${locale}`
}

/** Valeur de og:locale (Open Graph). */
export const ogLocale: Record<Locale, string> = { fr: 'fr_FR', en: 'en_GB' }
