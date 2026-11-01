import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllArticles } from '@/lib/mdx'
import { categories } from '@/data/categories'
import { brands } from '@/data/brands'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Plan du site — Toutou Gourmet',
  description:
    "Index complet de Toutou Gourmet : guides alimentation chien, avis marques, calculateurs et comparateur. Toutes les pages en un coup d'œil.",
  alternates: { canonical: 'https://www.toutou-gourmet.com/plan-du-site' },
}

// ── Static data ───────────────────────────────────────────────────────────────

const MAIN_PAGES = [
  { href: '/', label: 'Accueil', desc: 'Comparateur de croquettes premium' },
  { href: '/blog', label: 'Blog', desc: 'Tous nos articles et guides' },
  { href: '/chien', label: 'Hub alimentation chien', desc: 'Toutes nos thématiques' },
  { href: '/comparateur', label: 'Comparateur', desc: 'Les meilleures marques en face-à-face' },
  { href: '/quiz', label: 'Quiz personnalisé', desc: 'Trouver la nourriture idéale' },
  { href: '/marques', label: 'Toutes les marques', desc: 'Franklin, Dog Chef, Elmut…' },
  { href: '/outils', label: 'Calculateurs & Outils', desc: 'Budget, ration, poids, coût mensuel' },
]

const TOOLS = [
  { href: '/outils/budget', label: 'Calculateur de budget nourriture' },
  { href: '/outils/ration', label: 'Calculateur de ration journalière' },
  { href: '/outils/cout', label: 'Simulateur de coût mensuel' },
  { href: '/outils/poids', label: 'Suivi & courbe de poids' },
  { href: '/quiz', label: 'Quiz — trouver la croquette idéale' },
  { href: '/comparateur', label: 'Comparateur de croquettes' },
  { href: '/comparatifs/elmut-vs-dog-chef', label: 'Elmut vs Dog Chef — comparatif complet' },
]

const LEGAL = [
  { href: '/a-propos', label: 'À propos de Toutou Gourmet' },
  { href: '/contact', label: 'Contact' },
  { href: '/mentions-legales', label: 'Mentions légales' },
  { href: '/politique-de-confidentialite', label: 'Politique de confidentialité' },
]

// Category pill colours aligned with blog-categories.ts
const CAT_PILL: Record<string, { bg: string; color: string }> = {
  'alimentation-quotidienne': { bg: 'var(--pill-rose)',  color: 'var(--text-on-rose)'  },
  'peut-manger':              { bg: 'var(--pill-amber)', color: 'var(--text-on-amber)' },
  fruit:                      { bg: 'var(--pill-amber)', color: 'var(--text-on-amber)' },
  legumes:                    { bg: 'var(--pill-green)', color: 'var(--text-on-green)' },
  viandes:                    { bg: 'var(--pill-rose)',  color: 'var(--text-on-rose)'  },
  urgences:                   { bg: 'var(--pill-rose)',  color: 'var(--text-on-rose)'  },
  'comportement-alimentaire': { bg: 'var(--pill-blue)',  color: 'var(--text-on-blue)'  },
  race:                       { bg: 'var(--pill-amber)', color: 'var(--text-on-amber)' },
  sante:                      { bg: 'var(--pill-green)', color: 'var(--text-on-green)' },
  'avis-marques':             { bg: 'var(--pill-blue)',  color: 'var(--text-on-blue)'  },
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PlanDuSitePage() {
  const articles = getAllArticles()

  // Group by categorySlug
  const byCategory = articles.reduce<Record<string, typeof articles>>((acc, a) => {
    const key = a.frontmatter.categorySlug ?? '__other'
    ;(acc[key] ??= []).push(a)
    return acc
  }, {})

  // Preserve order from data/categories.ts, only populated ones
  const populatedCategories = categories
    .filter((c) => (byCategory[c.slug]?.length ?? 0) > 0)
    .map((c) => ({ cat: c, arts: byCategory[c.slug] }))

  const other = byCategory['__other'] ?? []

  return (
    <main className="max-w-[1280px] mx-auto px-4 md:px-6 py-12 md:py-16">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="mb-12 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3 text-gray-400">
          Navigation
        </p>
        <h1
          className="text-3xl md:text-4xl font-black mb-4"
          style={{ fontFamily: "'Fraunces', serif", color: 'var(--text-primary)' }}
        >
          Plan du site
        </h1>
        <p className="text-base text-gray-500 leading-relaxed">
          {articles.length} articles &middot; {brands.length} marques testées &middot;{' '}
          {populatedCategories.length} thématiques. Retrouvez ici l&rsquo;ensemble des ressources
          du site.
        </p>
      </div>

      {/* ── Jump nav ─────────────────────────────────────────────────────── */}
      <nav
        aria-label="Sections du plan du site"
        className="flex flex-wrap gap-2 mb-14 pb-8 border-b border-gray-100"
      >
        {[
          ['#pages',    '🏠 Pages principales'],
          ['#marques',  '📦 Marques'],
          ['#articles', '✍️ Articles'],
          ['#outils',   '🔧 Outils'],
          ['#infos',    'ℹ️ Légal'],
        ].map(([href, label]) => (
          <a
            key={href}
            href={href}
            className="inline-flex text-sm px-3 py-1.5 rounded-full font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="space-y-16">

        {/* ── Pages principales ─────────────────────────────────────────── */}
        <section id="pages">
          <SectionHeading emoji="🏠" label="Pages principales" count={MAIN_PAGES.length} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-5">
            {MAIN_PAGES.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="group flex flex-col gap-1 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
              >
                <span
                  className="text-sm font-semibold group-hover:underline"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {p.label}
                </span>
                <span className="text-xs text-gray-400">{p.desc}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Marques ───────────────────────────────────────────────────── */}
        <section id="marques">
          <SectionHeading emoji="📦" label="Marques testées" count={brands.length} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
            {brands.map((b) => (
              <Link
                key={b.slug}
                href={`/marques/${b.slug}`}
                className="group flex flex-col gap-1 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
              >
                <span
                  className="text-sm font-semibold group-hover:underline"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {b.name}
                </span>
                <span className="text-xs text-gray-400 line-clamp-2">{b.tagline}</span>
                <span className="text-xs font-medium mt-1 text-gray-300">{b.priceRange}</span>
              </Link>
            ))}
          </div>
          <Link
            href="/marques"
            className="inline-block mt-4 text-sm font-medium text-gray-400 hover:text-gray-700 underline underline-offset-2"
          >
            → Toutes les marques
          </Link>
        </section>

        {/* ── Articles par thème ────────────────────────────────────────── */}
        <section id="articles">
          <SectionHeading emoji="✍️" label="Articles par thème" count={articles.length} />
          <div className="mt-6 space-y-10">

            {populatedCategories.map(({ cat, arts }) => {
              const pill = CAT_PILL[cat.slug] ?? { bg: 'var(--pill-amber)', color: 'var(--text-on-amber)' }
              return (
                <div key={cat.slug} id={`cat-${cat.slug}`}>

                  {/* Category header */}
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <Link href={`/chien/${cat.slug}`} className="group">
                      <span
                        className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full group-hover:opacity-80 transition-opacity"
                        style={{ background: pill.bg, color: pill.color }}
                      >
                        <span>{cat.emoji}</span>
                        <span>{cat.label}</span>
                      </span>
                    </Link>
                    <span className="text-xs text-gray-400">
                      {arts.length} article{arts.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Article links */}
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1.5">
                    {arts.map((a) => {
                      const href = a.frontmatter.categorySlug
                        ? `/chien/${a.frontmatter.categorySlug}/${a.slug}`
                        : `/blog/${a.slug}`
                      return (
                        <li key={a.slug} className="flex items-start gap-2 min-w-0">
                          <span className="shrink-0 text-gray-300 text-xs mt-0.5">&rsaquo;</span>
                          <Link
                            href={href}
                            className="text-sm leading-snug hover:underline underline-offset-2 line-clamp-2"
                            style={{ color: 'var(--text-primary)' }}
                            title={a.frontmatter.title}
                          >
                            {a.frontmatter.title}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}

            {/* Articles without a mapped category */}
            {other.length > 0 && (
              <div id="cat-other">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm font-semibold text-gray-500">📄 Autres</span>
                  <span className="text-xs text-gray-400">
                    {other.length} article{other.length > 1 ? 's' : ''}
                  </span>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1.5">
                  {other.map((a) => (
                    <li key={a.slug} className="flex items-start gap-2 min-w-0">
                      <span className="shrink-0 text-gray-300 text-xs mt-0.5">&rsaquo;</span>
                      <Link
                        href={`/blog/${a.slug}`}
                        className="text-sm leading-snug hover:underline underline-offset-2"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {a.frontmatter.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        </section>

        {/* ── Outils & Calculateurs ─────────────────────────────────────── */}
        <section id="outils">
          <SectionHeading emoji="🔧" label="Outils & Calculateurs" count={TOOLS.length} />
          <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
            {TOOLS.map((t) => (
              <li key={t.href} className="flex items-start gap-2">
                <span className="shrink-0 text-gray-300 text-xs mt-0.5">&rsaquo;</span>
                <Link
                  href={t.href}
                  className="text-sm hover:underline underline-offset-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ── À propos & Légal ──────────────────────────────────────────── */}
        <section id="infos">
          <SectionHeading emoji="ℹ️" label="À propos & Légal" count={LEGAL.length} />
          <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
            {LEGAL.map((l) => (
              <li key={l.href} className="flex items-start gap-2">
                <span className="shrink-0 text-gray-300 text-xs mt-0.5">&rsaquo;</span>
                <Link
                  href={l.href}
                  className="text-sm hover:underline underline-offset-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

      </div>

      {/* ── Back to top ──────────────────────────────────────────────────── */}
      <div className="mt-16 pt-6 border-t border-gray-100 text-center">
        <a href="#" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ↑ Retour en haut de page
        </a>
      </div>

    </main>
  )
}

// ── Helper ────────────────────────────────────────────────────────────────────

function SectionHeading({
  emoji,
  label,
  count,
}: {
  emoji: string
  label: string
  count: number
}) {
  return (
    <div className="flex items-center gap-3">
      <h2
        className="text-xl font-bold"
        style={{ fontFamily: "'Fraunces', serif", color: 'var(--text-primary)' }}
      >
        {emoji} {label}
      </h2>
      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
        {count}
      </span>
    </div>
  )
}
