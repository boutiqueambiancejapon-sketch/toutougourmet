import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/i18n/config'

export const metadata: Metadata = {
  title: 'English edition',
  description:
    'Toutou Gourmet publishes its dog nutrition guides in French. The English edition will start with the main guides, the tools and the breed pages.',
  alternates: { canonical: `${SITE_URL}/en` },
}

export default function EnglishHomePage() {
  return (
    <section className="mx-auto flex w-full max-w-prose flex-col gap-5 px-4 py-16 md:px-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-ink-2">English edition</p>
      <h1 className="font-display text-4xl font-black leading-tight text-balance text-ink">
        Toutou Gourmet in English
      </h1>
      <p className="text-lg text-ink-2">
        Our guides on what a dog can eat, how much to give and what to do after an accident are
        written in French, with their sources. The English edition will start with the main
        guides, the tools and the breed pages.
      </p>
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- changement de langue = autre layout <html>, rechargement complet voulu */}
      <a
        href="/"
        hrefLang="fr"
        lang="fr"
        className="inline-flex min-h-13 w-fit items-center rounded-control bg-orange px-5 font-semibold text-ink"
      >
        Lire le site en français
      </a>
    </section>
  )
}
