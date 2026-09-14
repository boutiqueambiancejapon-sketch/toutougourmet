import Link from 'next/link'
import { LOCALE_CONFIG, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionary'

/**
 * Sélecteur de langue — rendu serveur, sans JavaScript.
 *
 * @cdc i18n — le libellé est écrit **dans la langue cible** (« Nederlands »,
 * « Français »), avec `lang` sur l'élément : c'est la recommandation WCAG pour
 * qu'un lecteur d'écran prononce correctement le nom de la langue. `hrefLang`
 * reprend exactement la valeur publiée dans les balises alternate du `<head>`.
 */

interface LanguageSwitcherProps {
  /** Locale de la page courante */
  locale: Locale
  /** Destination — chemin relatif dans l'autre langue */
  href: string
  variant?: 'inline' | 'footer' | 'banner'
  className?: string
}

/** Locale opposée — le site est bilingue, pas multilingue */
function otherLocale(locale: Locale): Locale {
  return locale === 'fr' ? 'nl' : 'fr'
}

export function LanguageSwitcher({
  locale,
  href,
  variant = 'inline',
  className = '',
}: LanguageSwitcherProps) {
  const target = otherLocale(locale)
  const t = getDictionary(locale)
  const targetConfig = LOCALE_CONFIG[target]

  if (variant === 'banner') {
    return (
      <p className={`m-0 text-sm ${className}`}>
        <Link
          href={href}
          hrefLang={targetConfig.hreflang}
          lang={targetConfig.htmlLang}
          rel="alternate"
          className="inline-flex items-center gap-1.5 font-semibold text-[var(--accent-1)] hover:underline"
        >
          <span aria-hidden="true">🌐</span>
          {t.articleSwitchLabel}
        </Link>
      </p>
    )
  }

  const base =
    variant === 'footer'
      ? 'text-sm text-white/70 hover:text-white'
      : 'text-sm font-semibold px-3 py-1.5 rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] transition-all'

  return (
    <Link
      href={href}
      hrefLang={targetConfig.hreflang}
      lang={targetConfig.htmlLang}
      rel="alternate"
      aria-label={t.languageSwitchAriaLabel}
      className={`${base} ${className}`}
    >
      {t.languageSwitchLabel}
    </Link>
  )
}
