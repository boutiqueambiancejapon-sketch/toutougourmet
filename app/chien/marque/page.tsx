import type { Metadata } from 'next'
import Link from 'next/link'
import { BrandCard } from '@/components/marques/BrandCard'
import { brands } from '@/data/brands'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

export const metadata: Metadata = {
  title: 'Avis croquettes premium pour chien',
  description:
    "Dog Chef, Elmut, Franklin, Petty Well : avis complets, comparatifs et codes promo. Trouve la meilleure alimentation pour ton chien.",
  alternates: { canonical: 'https://toutou-gourmet.com/chien/marque' },
}

const vsComparisons = [
  { a: 'dog-chef', b: 'elmut', label: 'Dog Chef vs Elmut' },
  { a: 'dog-chef', b: 'franklin', label: 'Dog Chef vs Franklin' },
  { a: 'dog-chef', b: 'petty-well', label: 'Dog Chef vs Petty Well' },
  { a: 'elmut', b: 'franklin', label: 'Elmut vs Franklin' },
  { a: 'elmut', b: 'petty-well', label: 'Elmut vs Petty Well' },
  { a: 'franklin', b: 'petty-well', label: 'Franklin vs Petty Well' },
]

export default function MarqueHubPage() {
  return (
    <div className="min-h-screen py-12 px-4 bg-[var(--bg-primary)]">
      <div className="max-w-[1280px] mx-auto">
        <Breadcrumb items={[
          { label: 'Accueil', href: '/' },
          { label: 'Chien', href: '/chien' },
          { label: 'Marques' },
        ]} />

        <div className="mb-10 max-w-[640px]">
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--accent-1)] mb-2">
            Avis & Comparatifs
          </p>
          <h1 className="page-title mb-3">
            Les meilleures marques pour ton chien
          </h1>
          <p className="text-[var(--text-secondary)]">
            On a testé et comparé les marques premium du marché — repas frais, croquettes sans céréales, pâtées. Avis honnêtes, compositions décryptées, codes promo exclusifs.
          </p>
        </div>

        {/* Grille des marques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          {brands.map((brand) => (
            <BrandCard key={brand.slug} brand={brand} />
          ))}
        </div>

        {/* Comparatifs VS */}
        <section>
          <h2 className="font-bold mb-6" style={{ fontFamily: "'Fraunces', serif" }}>
            Comparatifs marque vs marque
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vsComparisons.map(({ a, b, label }) => (
              <Link
                key={`${a}-vs-${b}`}
                href={`/chien/marque/${a}-vs-${b}`}
                className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-lg)] px-5 py-4 flex items-center justify-between gap-3 hover:border-[var(--accent-1)] hover:shadow-[var(--shadow-md)] transition-all group"
              >
                <span className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-1)] transition-colors">
                  {label}
                </span>
                <span className="text-[var(--text-muted)] shrink-0">→</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
