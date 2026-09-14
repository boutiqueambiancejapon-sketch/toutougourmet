import Link from 'next/link'
import { DEFAULT_LOCALE, localePath, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionary'
import { LanguageSwitcher } from './LanguageSwitcher'

export default function Footer({
  locale = DEFAULT_LOCALE,
  languageHref,
}: {
  locale?: Locale
  /** Miroir exact de la page courante — défaut : accueil de l'autre langue */
  languageHref?: string
}) {
  const t = getDictionary(locale)

  return (
    <footer className="bg-[var(--text-primary)] text-white mt-16">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href={localePath(locale, '/')} className="inline-flex items-center gap-2 mb-3 font-black text-xl" style={{ fontFamily: "'Fraunces', serif" }}>
              <span className="text-white">Toutou</span>
              <span className="px-2 py-0.5 rounded-[var(--radius-sm)]" style={{ background: '#FFD6E3', color: 'var(--text-primary)' }}>Gourmet</span>
            </Link>
            <p className="text-sm text-white/70 leading-relaxed">
              {t.footerTagline}
            </p>
            <p className="text-xs text-white/40 mt-3">
              {t.footerAffiliateNote}{' '}
              <Link href="/a-propos#affiliation" className="underline hover:text-[var(--accent-2)]">
                {t.footerAffiliateLink}
              </Link>
            </p>
          </div>

          {/* Links */}
          {t.footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-3">
                {column.title}
              </h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-6 pb-4 mb-2">
          <LanguageSwitcher
            locale={locale}
            href={languageHref ?? t.languageSwitchHref}
            variant="footer"
          />
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© {new Date().getFullYear()} Toutou Gourmet — {t.footerRights}</p>
          <p>
            {t.footerDisclosure}{' '}
            <Link href="/a-propos#affiliation" className="underline">
              {t.footerDisclosureLink}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
