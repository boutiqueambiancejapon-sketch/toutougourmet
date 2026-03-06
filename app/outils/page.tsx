import type { Metadata } from 'next'
import Link from 'next/link'
import { RationCalculator } from '@/components/outils/RationCalculator'
import { BudgetCalculator } from '@/components/outils/BudgetCalculator'
import { BodyScoreEvaluator } from '@/components/outils/BodyScoreEvaluator'
import { CostComparisonTool } from '@/components/outils/CostComparison'
import { SummarizeWithAI } from '@/components/blog/SummarizeWithAI'

export const metadata: Metadata = {
  title: 'Outils & Calculateurs — Ration, budget, poids idéal pour ton chien ou chat',
  description:
    'Calculateurs gratuits pour propriétaires : ration journalière, budget mensuel par marque, score de condition corporelle, comparaison des coûts alimentaires.',
  alternates: { canonical: 'https://toutougourmet.fr/outils' },
  openGraph: {
    title: 'Outils & Calculateurs — Toutou Gourmet',
    description:
      'Calcule la ration idéale, le budget mensuel, le poids de forme de ton animal en quelques secondes.',
    url: 'https://toutougourmet.fr/outils',
    type: 'website',
  },
}

const tools = [
  {
    id: 'ration',
    icon: '🥣',
    title: 'Calculateur de ration journalière',
    description:
      'Combien de grammes de croquettes ou de repas frais donner par jour ? La formule vétérinaire standard, adaptée à ton animal.',
  },
  {
    id: 'budget',
    icon: '💰',
    title: 'Estimateur de budget mensuel',
    description:
      'Compare le coût mensuel de nos 4 marques recommandées pour ton profil. Liens affiliés inclus avec les meilleures offres du moment.',
  },
  {
    id: 'poids',
    icon: '⚖️',
    title: 'Évaluateur de poids & score corporel',
    description:
      'Ton animal est-il à son poids idéal, en surpoids ou trop maigre ? Basé sur le score de condition corporelle vétérinaire (SCC).',
  },
  {
    id: 'cout',
    icon: '📊',
    title: 'Comparateur de coût annuel',
    description:
      'Croquettes standard vs premium vs repas frais vs mixte : visualise la différence de coût sur un an pour ton animal.',
  },
]

export default function OutilsPage() {
  return (
    <div className="min-h-screen py-12 px-4 bg-[var(--bg-primary)]">
      <div className="max-w-[1280px] mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-[var(--accent-1)] uppercase tracking-wider mb-2">
            🛠️ Outils gratuits
          </p>
          <h1 className="mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
            Calculateurs & Simulateurs
          </h1>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg leading-relaxed">
            Ration journalière, budget mensuel, poids idéal, comparaison des coûts — des outils
            concrets pour mieux nourrir ta bestiole, sans blabla.
          </p>
        </div>

        {/* Navigation des outils */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {tools.map((tool) => (
            <a
              key={tool.id}
              href={`#${tool.id}`}
              className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4 text-center hover:border-[var(--accent-1)] hover:shadow-[var(--shadow-md)] transition-all"
            >
              <span className="text-3xl block mb-2">{tool.icon}</span>
              <span className="text-xs font-semibold text-[var(--text-secondary)]">{tool.title}</span>
            </a>
          ))}
        </div>

        {/* SummarizeWithAI */}
        <div className="max-w-[720px] mx-auto mb-12">
          <SummarizeWithAI
            title="Outils & Calculateurs pour chiens et chats — Toutou Gourmet"
            url="https://toutougourmet.fr/outils"
            domain="toutougourmet.fr"
          />
        </div>

        {/* Outils */}
        <div className="flex flex-col gap-16">

          {/* 1. Ration */}
          <section id="ration" className="scroll-mt-20">
            <div className="max-w-[720px] mx-auto">
              <div className="flex items-start gap-4 mb-6">
                <span className="text-5xl shrink-0">🥣</span>
                <div>
                  <h2 className="text-2xl font-black mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
                    Calculateur de ration journalière
                  </h2>
                  <p className="text-[var(--text-secondary)]">
                    Calcule les besoins caloriques de ton animal et la quantité à donner par jour,
                    selon son poids, son âge et son niveau d&apos;activité.
                  </p>
                </div>
              </div>
              <RationCalculator />
              <div className="mt-4 bg-[var(--bg-surface-2)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4 text-sm text-[var(--text-secondary)]">
                <p className="font-semibold text-[var(--text-primary)] mb-1">💡 Comment utiliser ce résultat ?</p>
                <p>
                  Pèse les croquettes avec une balance de cuisine plutôt que d&apos;utiliser la cuillère
                  fournie. Divise la ration journalière en 2 repas pour un adulte, 3 pour un chiot.
                  Surveille le poids sur 4 semaines et ajuste si besoin.
                </p>
              </div>
            </div>
          </section>

          {/* 2. Budget */}
          <section id="budget" className="scroll-mt-20">
            <div className="max-w-[720px] mx-auto">
              <div className="flex items-start gap-4 mb-6">
                <span className="text-5xl shrink-0">💰</span>
                <div>
                  <h2 className="text-2xl font-black mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
                    Estimateur de budget mensuel
                  </h2>
                  <p className="text-[var(--text-secondary)]">
                    Compare le coût mensuel de nos 4 marques recommandées pour le profil de ton
                    animal. Avec les offres de bienvenue actuelles.
                  </p>
                </div>
              </div>
              <BudgetCalculator />
            </div>
          </section>

          {/* 3. Poids */}
          <section id="poids" className="scroll-mt-20">
            <div className="max-w-[720px] mx-auto">
              <div className="flex items-start gap-4 mb-6">
                <span className="text-5xl shrink-0">⚖️</span>
                <div>
                  <h2 className="text-2xl font-black mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
                    Évaluateur de poids & score corporel
                  </h2>
                  <p className="text-[var(--text-secondary)]">
                    Ton animal est-il à son poids de forme ? L&apos;outil compare son poids actuel à son
                    poids idéal et te donne un score de condition corporelle (SCC) vétérinaire.
                  </p>
                </div>
              </div>
              <BodyScoreEvaluator />
              <div className="mt-4 bg-[var(--bg-surface-2)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4 text-sm text-[var(--text-secondary)]">
                <p className="font-semibold text-[var(--text-primary)] mb-1">📏 Le Score de Condition Corporelle (SCC)</p>
                <p>
                  Le SCC est l&apos;indicateur vétérinaire standard pour évaluer la composition corporelle
                  d&apos;un animal. Il s&apos;évalue en palpant les côtes, en observant la silhouette de profil
                  et de dessus. Notre outil donne une estimation, mais seul ton vétérinaire peut
                  réaliser une évaluation complète.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Comparateur coût */}
          <section id="cout" className="scroll-mt-20">
            <div className="max-w-[720px] mx-auto">
              <div className="flex items-start gap-4 mb-6">
                <span className="text-5xl shrink-0">📊</span>
                <div>
                  <h2 className="text-2xl font-black mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
                    Comparateur de coût annuel par type d&apos;alimentation
                  </h2>
                  <p className="text-[var(--text-secondary)]">
                    Croquettes grande surface, croquettes premium, repas frais ou mix : visualise
                    la différence de coût réelle sur un an selon le profil de ton animal.
                  </p>
                </div>
              </div>
              <CostComparisonTool />
            </div>
          </section>

        </div>

        {/* CTA bas de page */}
        <div className="max-w-[720px] mx-auto mt-16 bg-[var(--bg-surface-2)] border border-[var(--border)] rounded-[var(--radius-xl)] p-8 text-center">
          <h2 className="text-2xl font-black mb-3" style={{ fontFamily: "'Fraunces', serif" }}>
            Tu sais combien ça coûte. Maintenant, quelle marque choisir ?
          </h2>
          <p className="text-[var(--text-secondary)] mb-6">
            Le quiz personnalisé t&apos;aide à trouver la meilleure marque pour le profil exact de ton
            animal — en moins de 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/quiz" className="btn-primary">
              Faire le quiz →
            </Link>
            <Link href="/comparateur" className="btn-outline">
              Voir le comparateur
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
