import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Calculateurs alimentation chien et chat',
  description:
    'Ration journalière, budget mensuel, poids idéal, coût annuel : des calculateurs gratuits pour mieux nourrir ton chien ou chat.',
  alternates: { canonical: 'https://www.toutou-gourmet.com/outils' },
  openGraph: {
    title: 'Calculateurs alimentation chien et chat',
    description: 'Ration journalière, budget par marque, poids idéal, coût annuel — des outils concrets pour mieux nourrir ton animal.',
    url: 'https://www.toutou-gourmet.com/outils',
    type: 'website',
  },
}

const tools = [
  {
    href: '/outils/ration',
    icon: '🥣',
    title: 'Calculateur de ration journalière',
    description: 'Combien de grammes de croquettes ou de repas frais donner par jour selon le poids, l\'âge et l\'activité de ton animal ?',
    cta: 'Calculer ma ration',
    tags: ['Chien', 'Chat', 'Formule vétérinaire'],
  },
  {
    href: '/outils/budget',
    icon: '💰',
    title: 'Estimateur de budget mensuel',
    description: 'Compare le coût mensuel de nos 4 marques recommandées pour le profil de ton animal. Avec les offres du moment.',
    cta: 'Estimer mon budget',
    tags: ['Franklin', 'Petty Well', 'Elmut', 'Dog Chef'],
  },
  {
    href: '/outils/poids',
    icon: '⚖️',
    title: 'Évaluateur de poids & score corporel',
    description: 'Ton animal est-il à son poids de forme ? Découvre son score de condition corporelle (SCC) utilisé par les vétérinaires.',
    cta: 'Évaluer le poids',
    tags: ['Surpoids', 'Obésité', 'Maigre', 'Idéal'],
  },
  {
    href: '/outils/cout',
    icon: '📊',
    title: 'Comparateur de coût annuel',
    description: 'Croquettes standard, premium, repas frais ou mix : visualise la différence de coût réelle sur un an pour ton animal.',
    cta: 'Comparer les coûts',
    tags: ['Croquettes', 'Repas frais', 'Budget annuel'],
  },
]

export default function OutilsPage() {
  return (
    <div className="min-h-screen py-12 px-4 bg-[var(--bg-primary)]">
      <div className="max-w-[960px] mx-auto">

        {/* Header */}
        <div className="mb-12 max-w-[640px]">
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--accent-1)] mb-2">
            🛠️ Outils gratuits
          </p>
          <h1 className="page-title mb-4">
            Calculateurs & Simulateurs
          </h1>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
            Des outils concrets pour mieux nourrir ton chien ou ton chat — ration, budget, poids
            idéal, comparaison des coûts. Tout est gratuit, sans inscription.
          </p>
        </div>

        {/* Grille d'outils */}
        <div className="grid md:grid-cols-2 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 hover:border-[var(--accent-1)] hover:shadow-[var(--shadow-md)] transition-all flex flex-col gap-4"
            >
              <div className="flex items-start gap-4">
                <span className="text-5xl shrink-0">{tool.icon}</span>
                <div className="flex-1">
                  <h2 className="text-lg font-black text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent-1)] transition-colors" >
                    {tool.title}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {tool.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 bg-[var(--bg-surface-2)] text-[var(--text-muted)] rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between mt-auto pt-2 border-t border-[var(--border)]">
                <span className="text-sm font-semibold text-[var(--accent-1)]">
                  {tool.cta} →
                </span>
                <span className="text-xs text-[var(--text-muted)]">Gratuit</span>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA bas */}
        <div className="mt-12 bg-[var(--bg-surface-2)] border border-[var(--border)] rounded-[var(--radius-xl)] p-8 text-center">
          <h2 className="text-xl font-black mb-2" >
            Tu veux une recommandation personnalisée ?
          </h2>
          <p className="text-[var(--text-secondary)] mb-5 text-sm">
            Le quiz prend en compte le profil complet de ton animal pour te suggérer la marque la plus adaptée.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/quiz" className="btn-primary">Faire le quiz →</Link>
            <Link href="/comparateur" className="btn-outline">Voir le comparateur</Link>
          </div>
        </div>

      </div>
    </div>
  )
}
