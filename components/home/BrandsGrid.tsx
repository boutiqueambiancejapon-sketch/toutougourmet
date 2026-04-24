import Link from 'next/link'
import { brands } from '@/data/brands'
import { Illustration } from '@/components/ui/Illustration'

interface BrandDisplay {
  bgVar: string
  pillVar: string
  slot: string
  emoji: string
  typeLabel: string
  featured?: boolean
}

const BRAND_DISPLAY: Record<string, BrandDisplay> = {
  franklin: {
    bgVar: 'var(--bg-amber)',
    pillVar: 'var(--pill-amber)',
    slot: 'brand-franklin',
    emoji: '🔥',
    typeLabel: 'Croquettes',
  },
  elmut: {
    bgVar: 'var(--bg-green)',
    pillVar: 'var(--pill-green)',
    slot: 'brand-elmut',
    emoji: '🌿',
    typeLabel: 'Repas frais',
    featured: true,
  },
  'petty-well': {
    bgVar: 'var(--bg-blue)',
    pillVar: 'var(--pill-blue)',
    slot: 'brand-pettywell',
    emoji: '⭐',
    typeLabel: 'Croquettes',
  },
  'dog-chef': {
    bgVar: 'var(--bg-rose)',
    pillVar: 'var(--pill-rose)',
    slot: 'brand-dogchef',
    emoji: '👨‍🍳',
    typeLabel: 'Repas frais',
  },
}

export function BrandsGrid() {
  return (
    <section id="marques" className="py-24 px-6 md:px-10 bg-[var(--bg-primary)]">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent-1)] mb-2.5">
              Notre sélection
            </p>
            <h2 className="section-title m-0">
              4 marques.
              <br />
              Zéro bullshit.
            </h2>
          </div>
          <p className="text-[var(--text-secondary)] max-w-sm text-base leading-relaxed">
            On a filtré des dizaines de marques pour ne garder que celles qui
            valent <i>vraiment</i> le coup.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {brands.map((brand) => {
            const d = BRAND_DISPLAY[brand.slug]
            if (!d) return null
            return (
              <Link
                key={brand.slug}
                href={`/marques/${brand.slug}`}
                className="group relative flex flex-col rounded-[var(--radius-xl)] overflow-hidden hover:-translate-y-1 hover:shadow-[var(--shadow-xl)] transition-all duration-300"
                style={{
                  background: d.bgVar,
                  border: `2px solid ${d.featured ? 'var(--accent-1)' : 'var(--border)'}`,
                }}
              >
                {d.featured && (
                  <span className="absolute top-3 right-3 z-10 text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full bg-[var(--accent-1)] text-white">
                    Coup de cœur
                  </span>
                )}
                <Illustration slot={d.slot} alt={`Illustration ${brand.name}`} className="!rounded-none" />
                <div className="p-5 pb-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{d.emoji}</span>
                    <span
                      className="text-[11px] font-bold px-3 py-1 rounded-full text-[var(--text-primary)]"
                      style={{ background: d.pillVar }}
                    >
                      {d.typeLabel}
                    </span>
                  </div>
                  <h3
                    className="text-xl font-black text-[var(--text-primary)] mb-1.5"
                    style={{ fontFamily: "'Fraunces', serif", letterSpacing: '-0.01em' }}
                  >
                    {brand.name}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                    {brand.tagline}
                  </p>
                </div>
                <div className="px-5 pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex-1 h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--accent-1)]"
                        style={{ width: `${(brand.scores.global / 5) * 100}%` }}
                      />
                    </div>
                    <span
                      className="text-sm font-bold text-[var(--accent-1)] shrink-0"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {brand.scores.global}/5
                    </span>
                  </div>
                </div>
                <div
                  className="mt-auto px-5 py-3.5 border-t border-[var(--border)] flex items-center justify-between"
                  style={{ background: 'rgba(255,255,255,0.4)' }}
                >
                  <span className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-1)]">
                    Voir la fiche →
                  </span>
                  <span
                    className="text-[11px] font-bold px-2.5 py-0.5 rounded-full text-[var(--text-secondary)]"
                    style={{ background: d.pillVar, fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {brand.priceRange}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="text-center mt-10">
          <Link href="#comparatif" className="btn-outline">
            Voir le comparateur complet →
          </Link>
        </div>
      </div>
    </section>
  )
}
