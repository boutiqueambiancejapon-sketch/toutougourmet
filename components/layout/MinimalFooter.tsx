import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'

// Pied de page minimal des langues sans pied de page V2 complet (aujourd'hui : /en).
// Les mentions légales n'existent qu'en français : lien <a> vers la racine française.

export function MinimalFooter({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)

  return (
    <footer className="mt-16 bg-ink text-cream">
      <div className="mx-auto flex w-full max-w-page flex-col gap-3 px-4 py-10 text-sm md:px-8">
        <p className="font-display text-lg font-black">Toutou Gourmet</p>
        <p>{t.footer.tagline}</p>
        <p className="flex flex-wrap gap-x-4 gap-y-2">
          <span>
            © {new Date().getFullYear()} Toutou Gourmet · {t.footer.rights}
          </span>
          <a href="/mentions-legales" hrefLang="fr" className="underline underline-offset-4">
            {t.footer.legal}
          </a>
        </p>
      </div>
    </footer>
  )
}
