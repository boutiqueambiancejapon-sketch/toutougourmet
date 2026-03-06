import type { Metadata } from 'next'
import Link from 'next/link'
import { CostComparisonTool } from '@/components/outils/CostComparison'

export const metadata: Metadata = {
  title: 'Comparateur de coût annuel alimentation chien & chat — Toutou Gourmet',
  description:
    'Croquettes standard, croquettes premium, repas frais ou mix : compare le coût réel sur un an selon le poids de ton chien ou chat. Visualisation claire avec pros et cons.',
  alternates: { canonical: 'https://toutougourmet.fr/outils/cout' },
  openGraph: {
    title: 'Comparateur de coût annuel alimentation — Toutou Gourmet',
    description: 'Croquettes vs repas frais : quelle est la vraie différence de budget sur un an ?',
    url: 'https://toutougourmet.fr/outils/cout',
    type: 'website',
  },
}

export default function CoutPage() {
  return (
    <div className="min-h-screen py-12 px-4 bg-[var(--bg-primary)]">
      <div className="max-w-[720px] mx-auto">

        {/* Breadcrumb */}
        <nav className="text-sm text-[var(--text-muted)] mb-6 flex items-center gap-2">
          <Link href="/outils" className="hover:text-[var(--accent-1)]">Outils</Link>
          <span>/</span>
          <span className="text-[var(--text-primary)]">Comparateur de coût annuel</span>
        </nav>

        {/* Header */}
        <div className="flex items-start gap-4 mb-8">
          <span className="text-5xl shrink-0">📊</span>
          <div>
            <h1 className="mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
              Comparateur de coût annuel
            </h1>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Croquettes grande surface, croquettes premium, repas frais ou mix : visualise la
              vraie différence de budget selon le type d&apos;alimentation pour ton animal sur un an.
            </p>
          </div>
        </div>

        {/* Comparateur */}
        <CostComparisonTool />

        {/* Contexte */}
        <div className="mt-8 flex flex-col gap-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5">
            <h2 className="font-bold text-[var(--text-primary)] mb-3" style={{ fontFamily: "'Fraunces', serif" }}>
              🤔 Qualité vs Prix : le vrai calcul
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-2">
              Les croquettes bon marché semblent moins chères au kilo, mais leur densité
              énergétique est plus faible : tu en donnes davantage. La différence réelle est
              souvent moins importante que ce qu&apos;on pense.
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              À cela s&apos;ajoutent les potentiels frais vétérinaires liés à une alimentation de
              moins bonne qualité (problèmes digestifs, pelage, surpoids). Le coût d&apos;une bonne
              alimentation peut s&apos;avérer un investissement sur le long terme.
            </p>
          </div>

          <div className="bg-[var(--bg-surface-2)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 text-center">
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">
              Tu veux savoir quelle marque est la meilleure pour ton animal ?
            </p>
            <Link href="/quiz" className="btn-primary text-sm py-2 inline-flex">
              Faire le quiz personnalisé →
            </Link>
          </div>
        </div>

        {/* Nav outils */}
        <div className="mt-10 pt-6 border-t border-[var(--border)]">
          <p className="text-sm font-semibold text-[var(--text-muted)] mb-3">Autres outils</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/outils/ration" className="btn-outline text-sm py-2">🥣 Ration journalière →</Link>
            <Link href="/outils/budget" className="btn-outline text-sm py-2">💰 Budget mensuel →</Link>
            <Link href="/outils/poids" className="btn-outline text-sm py-2">⚖️ Score corporel →</Link>
          </div>
        </div>

      </div>
    </div>
  )
}
