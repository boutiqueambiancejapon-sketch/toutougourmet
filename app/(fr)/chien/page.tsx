import type { Metadata } from 'next'
import Link from 'next/link'
import { getArticlesByCategory } from '@/lib/mdx'
import { categories } from '@/data/categories'

export const metadata: Metadata = {
  title: 'Alimentation et santé du chien — Guides & Conseils',
  description:
    'Tout ce que ton chien peut manger, comment bien le nourrir et quels aliments éviter. Guides pratiques par thème.',
  alternates: { canonical: 'https://www.toutou-gourmet.com/chien' },
}

const SECTION_COLORS: Record<string, { band: string; accent: string }> = {
  'peut-manger':              { band: 'var(--pill-rose)',  accent: 'var(--accent-rose)' },
  'alimentation-quotidienne': { band: 'var(--pill-amber)', accent: 'var(--accent-2)'   },
  'urgences':                 { band: '#FFE0D5',           accent: 'var(--accent-1)'   },
  'comportement-alimentaire': { band: 'var(--pill-blue)',  accent: 'var(--accent-blue)' },
  'fruit':                    { band: 'var(--pill-rose)',  accent: 'var(--accent-rose)' },
  'legumes':                  { band: 'var(--pill-green)', accent: 'var(--accent-3)'   },
  'viandes':                  { band: '#FFE0D5',           accent: 'var(--accent-1)'   },
}

export default function ChienPage() {
  const allCats = categories.map((cat) => {
    const count = cat.subCategorySlugs
      ? cat.subCategorySlugs.reduce((acc, s) => acc + getArticlesByCategory(s).length, 0)
      : getArticlesByCategory(cat.slug).length
    const colors = SECTION_COLORS[cat.slug] ?? { band: 'var(--bg-surface-2)', accent: 'var(--text-muted)' }
    return { ...cat, count, colors }
  })

  return (
    <div className="min-h-screen py-10 px-6 md:px-10 bg-[var(--bg-primary)]">
      <div className="max-w-[1280px] mx-auto">

        <div className="mb-10 max-w-[640px]">
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--accent-1)] mb-2">
            Alimentation chien
          </p>
          <h1 className="page-title mb-3">
            Guides nutrition & santé pour chien
          </h1>
          <p className="text-base text-[var(--text-secondary)]">
            Explore nos guides par thème — aliments autorisés, bien nourrir au quotidien, urgences et comportements.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {allCats.map(({ slug, label, description, emoji, count, colors }) => (
            <Link
              key={slug}
              href={`/chien/${slug}`}
              className="group flex flex-col rounded-[var(--radius-xl)] overflow-hidden border border-[var(--border)] hover:-translate-y-2 hover:shadow-[var(--shadow-xl)] hover:border-transparent transition-all duration-300"
            >
              <div
                className="px-5 pt-5 pb-4 flex items-start justify-between"
                style={{ background: colors.band }}
              >
                <span className="text-3xl leading-none">{emoji}</span>
                <span
                  className="text-xs font-bold uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: colors.accent }}
                >
                  Voir →
                </span>
              </div>
              <div className="flex flex-col flex-1 bg-[var(--bg-surface)] px-5 pt-4 pb-5 gap-2">
                <p
                  className="font-bold text-[var(--text-primary)] leading-snug"
                  style={{ fontFamily: "'Fraunces', serif", fontSize: '0.9375rem' }}
                >
                  {label}
                </p>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed flex-1">
                  {description}
                </p>
                <p className="text-xs font-semibold mt-1" style={{ color: colors.accent }}>
                  {count} article{count > 1 ? 's' : ''}
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
