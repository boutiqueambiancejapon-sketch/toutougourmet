import type { Metadata } from 'next'
import Link from 'next/link'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { sitemapEntries } from '@/lib/sitemaps/entries'
import { makeLabeler } from '@/lib/sitemaps/labels'
import { SITEMAP_LABELS, SITEMAP_TYPES, type SitemapType } from '@/lib/sitemaps/types'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Plan du site',
  description:
    'Toutes les pages de Toutou Gourmet, classées comme les sitemaps : aliments, urgences, santé, races, marques, recettes, outils et pages principales.',
  alternates: { canonical: 'https://www.toutou-gourmet.com/plan-du-site' },
}

// @cdc seo — plan du site généré depuis les sitemaps (lib/sitemaps) : chaque adresse indexée y
// figure, rien n'est listé à la main hormis les pages d'information hors sitemap (audit 2026-11-03, E19).

const ORDER: SitemapType[] = ['pages', 'aliments', 'urgences', 'sante-nutrition', 'races', 'marques', 'recettes', 'croquettes']

const INFO = [
  { path: '/contact', label: 'Contact' },
  { path: '/mentions-legales', label: 'Mentions légales' },
  { path: '/politique-de-confidentialite', label: 'Politique de confidentialité' },
]

interface Group {
  type: SitemapType | 'infos'
  title: string
  links: { path: string; label: string }[]
}

export default async function PlanDuSitePage() {
  const label = makeLabeler()
  const groups: Group[] = []
  for (const type of ORDER.filter((t) => SITEMAP_TYPES.includes(t))) {
    const entries = await sitemapEntries(type)
    if (!entries.length) continue
    const links = entries.map((e) => ({ path: e.path, label: label(e.path) }))
    if (type !== 'pages') links.sort((a, b) => a.label.localeCompare(b.label, 'fr'))
    groups.push({ type, title: SITEMAP_LABELS[type], links })
  }
  groups.push({ type: 'infos', title: 'Informations', links: INFO })
  const total = groups.reduce((n, g) => n + g.links.length, 0)

  return (
    <div className="v2 mx-auto flex max-w-page flex-col gap-10 px-4 pt-4 pb-16 md:px-8 md:pt-8">
      <BreadcrumbNav items={[{ label: 'Accueil', href: '/' }, { label: 'Plan du site' }]} />
      <header className="flex max-w-prose flex-col gap-3">
        <h1 className="m-0 font-display text-4xl font-black leading-tight text-ink">Plan du site</h1>
        <p className="m-0 text-lg leading-relaxed text-ink-2">{`${total} pages, classées comme nos sitemaps.`}</p>
      </header>
      <nav aria-label="Sections du plan du site">
        <ul role="list" className="m-0 flex list-none flex-wrap gap-2 p-0">
          {groups.map((g) => (
            <li key={g.type}>
              <a href={`#${g.type}`} className="inline-flex min-h-11 items-center rounded-pill border border-line bg-paper px-4 text-sm font-semibold text-ink no-underline hover:border-ink">
                {g.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      {groups.map((g) => (
        <section key={g.type} id={g.type} aria-labelledby={`${g.type}-t`} className="flex scroll-mt-24 flex-col gap-4">
          <h2 id={`${g.type}-t`} className="m-0 font-display text-2xl font-black text-ink">
            {g.title} <span className="text-base font-semibold text-ink-2">{g.links.length}</span>
          </h2>
          <ul role="list" className="m-0 list-none columns-1 gap-8 p-0 sm:columns-2 lg:columns-3">
            {g.links.map((l) => (
              <li key={l.path} className="break-inside-avoid">
                <Link href={l.path} prefetch={false} className="inline-flex min-h-11 items-center text-[15px] text-ink underline decoration-line-2 underline-offset-4 hover:decoration-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
