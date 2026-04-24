import Link from 'next/link'
import { brands } from '@/data/brands'

interface BrandDisplay {
  pillVar: string
  textVar: string
  borderVar: string
  typeLabel: string
  featured?: boolean
}

const BRAND_DISPLAY: Record<string, BrandDisplay> = {
  franklin: {
    pillVar: 'var(--pill-amber)',
    textVar: 'var(--text-on-amber)',
    borderVar: 'var(--pill-amber)',
    typeLabel: 'Croquettes',
  },
  elmut: {
    pillVar: 'var(--pill-green)',
    textVar: 'var(--text-on-green)',
    borderVar: 'var(--text-on-green)',
    typeLabel: 'Repas frais',
    featured: true,
  },
  'petty-well': {
    pillVar: 'var(--pill-blue)',
    textVar: 'var(--text-on-blue)',
    borderVar: 'var(--pill-blue)',
    typeLabel: 'Croquettes',
  },
  'dog-chef': {
    pillVar: 'var(--pill-rose)',
    textVar: 'var(--text-on-rose)',
    borderVar: 'var(--pill-rose)',
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
            const pros = brand.pros.slice(0, 3)
            return (
              <article
                key={brand.slug}
                className="relative flex flex-col rounded-[var(--radius-xl)] overflow-hidden p-6 gap-5"
                style={{
                  background: d.pillVar,
                  border: `2px solid ${d.featured ? 'var(--accent-1)' : d.borderVar}`,
                  color: d.textVar,
                }}
              >
                {d.featured && (
                  <span className="absolute -top-px right-4 text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-b-[var(--radius-md)] bg-[var(--accent-1)] text-white">
                    Coup de cœur
                  </span>
                )}

                <header className="flex items-start justify-between gap-3">
                  <Link
                    href={`/marques/${brand.slug}`}
                    className="font-black text-2xl hover:underline"
                    style={{ fontFamily: "'Fraunces', serif", letterSpacing: '-0.01em', color: d.textVar }}
                  >
                    {brand.name}
                  </Link>
                  <p
                    className="font-black text-2xl shrink-0 m-0"
                    style={{ fontFamily: "'Fraunces', serif", color: d.textVar }}
                    aria-label={`Note ${brand.scores.global} sur 5`}
                  >
                    {brand.scores.global}
                    <span className="text-sm opacity-60" style={{ fontFamily: "'JetBrains Mono', monospace" }}>/5</span>
                  </p>
                </header>

                <p className="text-sm leading-relaxed m-0 opacity-85" style={{ color: d.textVar }}>
                  {brand.tagline}
                </p>

                <ul className="flex flex-col gap-2 m-0 p-0 list-none">
                  {pros.map((pro, i) => (
                    <li
                      key={i}
                      className="grid grid-cols-[18px_1fr] gap-2 items-start text-sm leading-snug line-clamp-2"
                      style={{ color: d.textVar }}
                    >
                      <span aria-hidden="true" className="font-bold mt-0.5">
                        ✓
                      </span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto flex flex-col gap-2.5">
                  <span
                    className="inline-flex items-center justify-center text-center text-sm font-bold px-4 py-3 rounded-full bg-[var(--bg-surface)]"
                    style={{ color: d.textVar }}
                  >
                    {brand.discountOffer}
                  </span>
                  <a
                    href={brand.affiliateUrl}
                    target="_blank"
                    rel="nofollow sponsored noopener"
                    className="btn-primary text-base w-full justify-center"
                  >
                    Essayer →
                  </a>
                  <Link
                    href={`/marques/${brand.slug}`}
                    className="text-xs font-semibold text-center opacity-70 hover:opacity-100"
                    style={{ color: d.textVar }}
                  >
                    Voir la fiche détaillée →
                  </Link>
                </div>
              </article>
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
