import type { Metadata } from 'next'
import Link from 'next/link'
import { BudgetCalculator } from '@/components/outils/BudgetCalculator'
import { InfoBox } from '@/components/mdx/MdxComponents'

export const metadata: Metadata = {
  title: 'Estimateur budget alimentation chien',
  description:
    'Compare le budget mensuel de Franklin, Elmut, Petty Well et Dog Chef selon le profil de ton chien ou chat. Avec les offres du moment.',
  alternates: { canonical: 'https://toutou-gourmet.com/outils/budget' },
  openGraph: {
    title: 'Estimateur budget alimentation chien',
    description: 'Combien ça coûte vraiment de nourrir ton chien ou chat avec les meilleures marques ?',
    url: 'https://toutou-gourmet.com/outils/budget',
    type: 'website',
  },
}

export default function BudgetPage() {
  return (
    <div className="min-h-screen py-12 px-4 bg-[var(--bg-primary)]">
      <div className="max-w-[720px] mx-auto">

        {/* Breadcrumb */}
        <nav className="text-sm text-[var(--text-muted)] mb-6 flex items-center gap-2">
          <Link href="/outils" className="hover:text-[var(--accent-1)]">Outils</Link>
          <span>/</span>
          <span className="text-[var(--text-primary)]">Budget mensuel</span>
        </nav>

        {/* Header */}
        <div className="flex items-start gap-4 mb-8">
          <span className="text-5xl shrink-0">💰</span>
          <div>
            <h1 className="page-title mb-2" >
              Estimateur de budget mensuel
            </h1>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Compare le coût mensuel estimé de nos 4 marques recommandées pour le profil exact de
              ton animal. Avec les meilleures offres de bienvenue du moment.
            </p>
          </div>
        </div>

        {/* Calculateur */}
        <BudgetCalculator />

        {/* Infos */}
        <InfoBox color="blue" emoji="ℹ️" title="Comment sont calculées ces estimations ?">
          <ul className="space-y-1.5 list-disc pl-4">
            <li>On calcule d&apos;abord les besoins caloriques journaliers de ton animal (formule BEE).</li>
            <li>On convertit en grammes selon la densité énergétique de chaque type de produit.</li>
            <li>On multiplie par le prix moyen au kilo de la gamme standard de chaque marque.</li>
            <li>Les prix peuvent varier selon les gammes et promotions en cours.</li>
          </ul>
          <p className="text-xs text-[var(--text-muted)] mt-3 italic">
            Liens affiliés — on perçoit une commission si tu passes commande, sans surcoût pour toi.
          </p>
        </InfoBox>

        {/* Nav outils */}
        <div className="mt-10 pt-6 border-t border-[var(--border)]">
          <p className="text-sm font-semibold text-[var(--text-muted)] mb-3">Autres outils</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/outils/ration" className="btn-outline text-sm py-2">🥣 Ration journalière →</Link>
            <Link href="/outils/poids" className="btn-outline text-sm py-2">⚖️ Score corporel →</Link>
            <Link href="/outils/cout" className="btn-outline text-sm py-2">📊 Coût annuel →</Link>
          </div>
        </div>

      </div>
    </div>
  )
}
