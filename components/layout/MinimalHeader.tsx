import Link from 'next/link'
import { localePrefix, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'

// En-tête minimal des langues sans en-tête V2 complet (aujourd'hui : /en).
// Le lien vers l'autre langue est un <a> : chaque langue a son propre layout
// <html>, le changement de langue recharge donc la page entière.

export function MinimalHeader({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const otherLocale: Locale = locale === 'fr' ? 'en' : 'fr'
  const otherHref = localePrefix(otherLocale) || '/'

  return (
    <header className="border-b border-line bg-cream">
      <nav
        aria-label={t.nav.home}
        className="mx-auto flex min-h-14 w-full max-w-page items-center gap-3 px-4 md:px-8"
      >
        <Link href={localePrefix(locale) || '/'} className="flex items-center gap-2">
          <span aria-hidden="true" className="grid size-9 place-items-center rounded-tile bg-amber text-lg">
            🐶
          </span>
          <span className="font-display text-lg font-black text-ink">
            Toutou <span className="text-orange">Gourmet</span>
          </span>
        </Link>
        <a
          href={otherHref}
          hrefLang={otherLocale}
          lang={otherLocale}
          className="ml-auto inline-flex min-h-11 items-center rounded-pill border border-line bg-paper px-4 text-sm font-semibold text-ink"
        >
          {t.nav.otherLocale}
        </a>
      </nav>
    </header>
  )
}
