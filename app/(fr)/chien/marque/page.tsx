import type { Metadata } from 'next'
import Link from 'next/link'
import { BrandCard } from '@/components/marques/BrandCard'
import { brands, getDuelPairs } from '@/data/brands'
import { BrandProfiles } from '@/components/marques/BrandProfiles'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

export const metadata: Metadata = {
  title: 'Avis croquettes premium pour chien',
  description:
    "Dog Chef, Elmut, Franklin, Ultra Premium Direct, Dogfy Diet, Fidelis : avis, comparatifs et offres. Choisis la marque selon le profil de ton chien.",
  alternates: { canonical: 'https://www.toutou-gourmet.com/chien/marque' },
}

const vsComparisons = getDuelPairs().map(([a, b]) => ({ a: a.slug, b: b.slug, label: `${a.name} vs ${b.name}` }))

export default function MarqueHubPage() {
  return (
    <div className="min-h-screen py-12 px-4 bg-[var(--bg-primary)]">
      <div className="max-w-[1280px] mx-auto">
        <Breadcrumb items={[
          { label: 'Accueil', href: '/' },
          { label: 'Guides', href: '/chien' },
          { label: 'Marques' },
        ]} />

        <div className="mb-10 max-w-[640px]">
          <h1 className="page-title mb-3">
            Les meilleures marques pour ton chien
          </h1>
          <p className="text-[var(--text-secondary)]">
            {brands.length} marques de croquettes, de repas frais et de menus en bocaux, notées sur les mêmes critères : ingrédients, digestibilité, prix, variété et service client. On touche une commission si tu commandes par nos liens, sans surcoût pour toi.
          </p>
        </div>

        <BrandProfiles />

        {/* Grille des marques */}
        <h2 className="font-bold mb-6" style={{ fontFamily: "'Fraunces', serif" }}>
          Toutes les marques
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
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
