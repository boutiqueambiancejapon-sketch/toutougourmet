import type { Metadata } from 'next'
import Link from 'next/link'
import { ComparisonTable, brandAccents } from '@/components/comparateur/ComparisonTable'
import { Disclosure } from '@/components/ui/Disclosure'
import { brands } from '@/data/brands'

export const metadata: Metadata = {
  title: 'Comparateur — Franklin vs Elmut vs Petty Well vs Dog Chef',
  description:
    'Tableau comparatif complet des 4 meilleures marques de pet food premium en France. Notes, prix, ingrédients, offres. Mis à jour en 2026.',
  alternates: { canonical: 'https://toutougourmet.fr/comparateur' },
}

const brandBgs = ['#C2F0D5', '#FFD6E3', '#C8DCFF', '#FFE8B5']

export default function ComparateurPage() {
  return (
    <div className="min-h-screen py-12 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-[1280px] mx-auto">

        {/* Header compact */}
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--accent-1)' }}>
            Mis à jour mars 2026
          </p>
          <h1 className="page-title mb-3">Comparatif complet des 4 marques</h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Franklin, Elmut, Petty Well et Dog Chef — analysés sur les mêmes critères, sans favoritisme.
          </p>
        </div>

        {/* Cartes marques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {brands.map((brand, i) => (
            <div
              key={brand.slug}
              className="rounded-[var(--radius-xl)] p-5 flex flex-col"
              style={{ background: brandBgs[i], borderTop: `3px solid ${brandAccents[i]}` }}
            >
              {/* Score + nom */}
              <div className="flex items-start justify-between mb-2">
                <div
                  className="font-black text-base leading-tight"
                  style={{ fontFamily: "'Fraunces', serif", color: brandAccents[i] }}
                >
                  {brand.name}
                </div>
                <div
                  className="font-black text-2xl leading-none ml-2 shrink-0"
                  style={{ fontFamily: "'Fraunces', serif", color: brandAccents[i] }}
                >
                  {brand.scores.global.toFixed(1)}
                  <span className="text-xs font-normal opacity-60">/5</span>
                </div>
              </div>

              {/* Tagline */}
              <p className="text-xs leading-snug mb-4" style={{ color: brandAccents[i], opacity: 0.75 }}>
                {brand.tagline}
              </p>

              {/* Pros */}
              <ul className="space-y-1.5 mb-5 flex-1">
                {brand.pros.slice(0, 3).map((pro, j) => (
                  <li key={j} className="flex items-start gap-1.5 text-xs" style={{ color: brandAccents[i] }}>
                    <span className="font-bold mt-px shrink-0">✓</span>
                    <span style={{ opacity: 0.85 }}>{pro}</span>
                  </li>
                ))}
              </ul>

              {/* Offre + CTA */}
              <div
                className="text-xs font-bold text-center px-2 py-1 rounded-full mb-3"
                style={{ background: 'rgba(255,255,255,0.6)', color: brandAccents[i] }}
              >
                {brand.discountOffer}
              </div>
              <Link
                href={brand.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="btn-primary text-xs py-2 text-center block"
              >
                Essayer →
              </Link>
            </div>
          ))}
        </div>

        {/* Tableau */}
        <div className="rounded-[var(--radius-xl)] overflow-hidden mb-6"
          style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', background: 'var(--bg-surface)' }}>
          <ComparisonTable />
        </div>

        <div className="max-w-lg mx-auto mb-8">
          <Disclosure type="full" />
        </div>

        {/* Méthodologie */}
        <div className="rounded-[var(--radius-xl)] p-6 mb-8"
          style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)' }}>
          <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Fraunces', serif" }}>
            Notre méthodologie de notation
          </h2>
          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
            Chaque marque est notée sur 6 critères, de 0 à 5. Les notes sont calculées sur la base de :
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5" style={{ color: 'var(--text-secondary)' }}>
            <li>L&apos;analyse de la composition des aliments (liste d&apos;ingrédients, taux de protéines)</li>
            <li>Les retours de propriétaires et avis vérifiés en ligne</li>
            <li>La comparaison prix/qualité sur les gammes standards</li>
            <li>Les recommandations vétérinaires disponibles publiquement</li>
            <li>Notre propre test sur une période de 4 semaines minimum</li>
          </ul>
        </div>

        {/* CTA Quiz */}
        <div className="text-center">
          <p className="mb-3 text-sm" style={{ color: 'var(--text-muted)' }}>
            Tu ne sais pas quelle marque choisir pour ton animal ?
          </p>
          <Link href="/quiz" className="btn-primary inline-block">
            Faire le quiz personnalisé →
          </Link>
        </div>

      </div>
    </div>
  )
}
