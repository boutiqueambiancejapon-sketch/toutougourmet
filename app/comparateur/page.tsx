import type { Metadata } from 'next'
import { ComparisonTable } from '@/components/comparateur/ComparisonTable'
import { Disclosure } from '@/components/ui/Disclosure'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Comparateur — Franklin vs Elmut vs Petty Well vs Dog Chef',
  description:
    'Tableau comparatif complet des 4 meilleures marques de pet food premium en France. Notes, prix, ingrédients, offres. Mis à jour en 2026.',
  alternates: { canonical: 'https://toutougourmet.fr/comparateur' },
}

export default function ComparateurPage() {
  return (
    <div className="min-h-screen py-12 px-4 bg-[var(--bg-primary)]">
      <div className="max-w-[1280px] mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-sm font-semibold text-[var(--accent-1)] uppercase tracking-wider mb-2">
            Mis à jour mars 2026
          </p>
          <h1 className="mb-3" style={{ fontFamily: "'Fraunces', serif" }}>
            Comparatif complet des 4 marques
          </h1>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
            Franklin, Elmut, Petty Well et Dog Chef — on les a tous analysés sur les mêmes critères.
            Spoiler : chaque marque a ses points forts selon le profil de ton animal.
          </p>
        </div>

        {/* Tableau */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-md)] overflow-hidden mb-8">
          <ComparisonTable />
        </div>

        <div className="max-w-lg mx-auto mb-8">
          <Disclosure type="full" />
        </div>

        {/* Méthodologie */}
        <div className="bg-[var(--bg-surface-2)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Fraunces', serif" }}>
            Notre méthodologie de notation
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-3">
            Chaque marque est notée sur 6 critères, de 0 à 5. Les notes sont calculées sur la base
            de :
          </p>
          <ul className="text-sm text-[var(--text-secondary)] space-y-1 list-disc pl-5">
            <li>L&apos;analyse de la composition des aliments (liste d&apos;ingrédients, taux de protéines)</li>
            <li>Les retours de propriétaires et avis vérifiés en ligne</li>
            <li>La comparaison prix/qualité sur les gammes standards</li>
            <li>Les recommandations vétérinaires disponibles publiquement</li>
            <li>Notre propre test sur une période de 4 semaines minimum</li>
          </ul>
        </div>

        {/* CTA Quiz */}
        <div className="text-center">
          <p className="text-[var(--text-muted)] mb-3 text-sm">
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
