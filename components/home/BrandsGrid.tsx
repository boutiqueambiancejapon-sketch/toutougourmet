import Link from 'next/link'
import { brands } from '@/data/brands'

const brandAccents: Record<string, { bg: string; pill: string; emoji: string }> = {
  franklin:     { bg: '#FFF8F0', pill: '#FFE8B5', emoji: '🔥' },
  elmut:        { bg: '#F0FFF8', pill: '#C2F0D5', emoji: '🌿' },
  'petty-well': { bg: '#F0F5FF', pill: '#C8DCFF', emoji: '⭐' },
  'dog-chef':   { bg: '#FFF0F5', pill: '#FFD6E3', emoji: '👨‍🍳' },
}

export function BrandsGrid() {
  return (
    <section className="py-20 px-6 md:px-10 bg-[var(--bg-primary)]">
      <div className="max-w-[1280px] mx-auto">

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-[var(--accent-1)] mb-2">Notre sélection</p>
            <h2 className="section-title">4 marques.<br />Zéro bullshit.</h2>
          </div>
          <p className="text-[var(--text-secondary)] max-w-sm text-base leading-relaxed">
            On a filtré des dizaines de marques pour ne garder que celles qui valent vraiment le coup.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {brands.map((brand) => {
            const accent = brandAccents[brand.slug] ?? { bg: '#FAFAF8', pill: '#F5F0EA', emoji: '🐾' }
            const score = brand.scores.global
            return (
              <Link
                key={brand.slug}
                href={`/marques/${brand.slug}`}
                className="group flex flex-col rounded-[var(--radius-xl)] border-2 border-[var(--border)] overflow-hidden hover:border-[var(--accent-1)] hover:shadow-[var(--shadow-xl)] hover:-translate-y-2 transition-all duration-300"
                style={{ background: accent.bg }}
              >
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-3xl">{accent.emoji}</span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: accent.pill, color: 'var(--text-primary)' }}>
                      {brand.type.includes('repas-frais') ? 'Repas frais' : 'Croquettes'}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-[var(--text-primary)] mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
                    {brand.name}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">{brand.tagline}</p>
                </div>

                <div className="px-6 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                      <div className="h-full rounded-full" style={{ width: `${(score / 10) * 100}%`, background: 'var(--accent-1)' }} />
                    </div>
                    <span className="text-base font-black text-[var(--accent-1)] shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {score}/10
                    </span>
                  </div>
                </div>

                <div className="mt-auto px-6 py-4 border-t border-[var(--border)] flex items-center justify-between">
                  <span className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-1)] transition-colors">
                    Voir la fiche →
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: accent.pill, color: 'var(--text-secondary)' }}>
                    {brand.priceRange}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="text-center mt-8">
          <Link href="/comparateur" className="btn-outline">Voir le comparateur complet →</Link>
        </div>
      </div>
    </section>
  )
}
