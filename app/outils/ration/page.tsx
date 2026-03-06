import type { Metadata } from 'next'
import Link from 'next/link'
import { RationCalculator } from '@/components/outils/RationCalculator'
import { InfoBox, Callout } from '@/components/mdx/MdxComponents'

export const metadata: Metadata = {
  title: 'Calculateur de ration journalière pour chien et chat — Toutou Gourmet',
  description:
    'Calcule la quantité de croquettes ou de repas frais à donner par jour à ton chien ou chat selon son poids, son âge et son niveau d\'activité. Formule vétérinaire NRC 2006.',
  alternates: { canonical: 'https://toutougourmet.fr/outils/ration' },
  openGraph: {
    title: 'Calculateur de ration journalière — Toutou Gourmet',
    description: 'Combien de grammes par jour pour ton animal ? La formule vétérinaire standard adaptée à ton chien ou chat.',
    url: 'https://toutougourmet.fr/outils/ration',
    type: 'website',
  },
}

export default function RationPage() {
  return (
    <div className="min-h-screen py-12 px-4 bg-[var(--bg-primary)]">
      <div className="max-w-[720px] mx-auto">

        {/* Breadcrumb */}
        <nav className="text-sm text-[var(--text-muted)] mb-6 flex items-center gap-2">
          <Link href="/outils" className="hover:text-[var(--accent-1)]">Outils</Link>
          <span>/</span>
          <span className="text-[var(--text-primary)]">Ration journalière</span>
        </nav>

        {/* Header */}
        <div className="flex items-start gap-4 mb-8">
          <span className="text-5xl shrink-0">🥣</span>
          <div>
            <h1 className="page-title mb-2" >
              Calculateur de ration journalière
            </h1>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Calcule les besoins caloriques de ton animal et la quantité à donner par jour, selon
              son poids, son âge, son niveau d&apos;activité et son statut reproducteur.
            </p>
          </div>
        </div>

        {/* Calculateur */}
        <RationCalculator />

        {/* Explication */}
        <div className="mt-2 flex flex-col">
          <InfoBox color="blue" emoji="💡" title="Comment bien utiliser ce résultat ?">
            <ul className="space-y-1.5 list-disc pl-4">
              <li>Pèse les croquettes avec une <strong>balance de cuisine</strong> plutôt qu&apos;une cuillère.</li>
              <li>Divise la ration en <strong>2 repas</strong> pour un adulte, <strong>3 repas</strong> pour un chiot.</li>
              <li>Surveille le poids de ton animal sur <strong>4 semaines</strong> et ajuste de ±10% si besoin.</li>
              <li>Les friandises comptent dans la ration quotidienne — réduis en conséquence.</li>
            </ul>
          </InfoBox>

          <InfoBox color="amber" emoji="📐" title="La formule utilisée">
            <p className="mb-2">
              Basé sur la formule vétérinaire <strong>BEE (Besoin Énergétique d&apos;Entretien)</strong> du National
              Research Council (NRC 2006) :
            </p>
            <div className="bg-[var(--bg-surface-2)] rounded-[var(--radius-md)] p-3 font-mono text-sm text-center my-2">
              BEE = 130 × Poids(kg)^0,75 × Facteur activité
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Coefficients ajustés pour les seniors (95), les races à haute énergie (180), les chiots (×2) et
              les animaux stérilisés (−15%).
            </p>
          </InfoBox>
        </div>

        {/* Nav outils */}
        <div className="mt-10 pt-6 border-t border-[var(--border)]">
          <p className="text-sm font-semibold text-[var(--text-muted)] mb-3">Autres outils</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/outils/budget" className="btn-outline text-sm py-2">💰 Budget mensuel →</Link>
            <Link href="/outils/poids" className="btn-outline text-sm py-2">⚖️ Score corporel →</Link>
            <Link href="/outils/cout" className="btn-outline text-sm py-2">📊 Coût annuel →</Link>
          </div>
        </div>

      </div>
    </div>
  )
}
