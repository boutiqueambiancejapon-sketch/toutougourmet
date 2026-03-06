import type { Metadata } from 'next'
import Link from 'next/link'
import { BrandCard } from '@/components/marques/BrandCard'
import { brands } from '@/data/brands'

export const metadata: Metadata = {
  title: 'Toutes les marques — Notre sélection de pet food premium',
  description:
    "Franklin, Elmut, Petty Well, Dog Chef : notre sélection des meilleures marques d'alimentation premium pour chiens et chats en France.",
  alternates: { canonical: 'https://toutougourmet.fr/marques' },
}

export default function MarquesPage() {
  return (
    <div className="min-h-screen py-12 px-4 bg-[var(--bg-primary)]">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-10">
          <h1 className="mb-3" style={{ fontFamily: "'Fraunces', serif" }}>
            Notre sélection de marques
          </h1>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
            On a comparé des dizaines de marques et retenu les 4 meilleures. Critères : qualité des
            ingrédients, digestibilité, rapport qualité/prix, retours clients.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {brands.map((brand) => (
            <BrandCard key={brand.slug} brand={brand} />
          ))}
        </div>

        <div className="text-center">
          <Link href="/comparateur" className="btn-outline inline-block">
            Voir le comparateur complet →
          </Link>
        </div>
      </div>
    </div>
  )
}
