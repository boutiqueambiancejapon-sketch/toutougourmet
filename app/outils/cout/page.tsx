// @cdc 5.0 — contrat : Outil calculateur · rendu SSG · JSON-LD WebApplication + FAQPage
import type { Metadata } from 'next'
import Link from 'next/link'
import { CostComparisonTool } from '@/components/outils/CostComparison'
import { InfoBox } from '@/components/mdx/MdxComponents'

export const metadata: Metadata = {
  title: 'Comparateur coût alimentation chien — Croquettes vs repas frais, le vrai bilan annuel',
  description:
    'Croquettes standard, premium ou repas frais : compare le vrai coût annuel selon le poids de ton chien. Calcul précis avec bilan par type d\'alimentation.',
  alternates: { canonical: 'https://www.toutou-gourmet.com/outils/cout' },
  openGraph: {
    title: 'Comparateur coût alimentation chien — Croquettes vs repas frais, le vrai bilan annuel',
    description: 'Croquettes vs repas frais : quelle est la vraie différence de budget sur un an ?',
    url: 'https://www.toutou-gourmet.com/outils/cout',
    type: 'website',
  },
}

const faqItems = [
  {
    question: 'Les repas frais pour chien sont-ils vraiment plus chers que les croquettes ?',
    answer: 'Au kilo, oui — les repas frais coûtent généralement 2 à 3 fois plus cher. Mais leur densité calorique est plus faible (120-145 kcal/100g contre 350-380 kcal/100g pour les croquettes), donc on en donne plus en volume. La différence réelle sur un an est souvent de 30-50% selon le gabarit du chien et les marques choisies.',
  },
  {
    question: 'Combien coûte une alimentation premium pour chien sur un an ?',
    answer: 'Pour un chien de 10 kg avec des croquettes premium (type Franklin ou Petty Well), comptez 480-600€/an. Pour le même chien avec des repas frais (Elmut, Dog Chef), 700-900€/an. Les grandes races multiplient ces chiffres par 2 à 3. Ces estimations incluent les remises de bienvenue disponibles.',
  },
  {
    question: 'Les croquettes de grande surface sont-elles suffisantes pour mon chien ?',
    answer: 'Elles couvrent les besoins caloriques minimaux mais avec une qualité nutritionnelle moindre : plus de céréales, moins de protéines animales, moins de digestibilité. À long terme, cela peut se traduire par des selles plus volumineuses, un pelage moins brillant et potentiellement plus de frais vétérinaires. Le surcoût des croquettes premium est souvent compensé.',
  },
  {
    question: 'Qu\'est-ce que l\'alimentation mixte croquettes + repas frais ?',
    answer: 'Le "mix" consiste à remplacer 20-30% de la ration quotidienne par des repas frais, le reste en croquettes premium. C\'est un bon compromis qualité/prix : on bénéficie des avantages nutritionnels des repas frais (meilleure digestibilité, moins d\'ultra-transformation) à un coût intermédiaire.',
  },
]

const webAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Comparateur coût alimentation chien — Toutou Gourmet',
  url: 'https://www.toutou-gourmet.com/outils/cout',
  description: 'Compare le coût annuel de différents types d\'alimentation pour chien selon son poids.',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
}

export default function CoutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

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
              <h1 className="page-title mb-2">
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
          <div className="mt-6 flex flex-col">
            <InfoBox color="amber" emoji="🤔" title="Qualité vs Prix : le vrai calcul">
              <p className="mb-2">
                Les croquettes bon marché semblent moins chères au kilo, mais leur densité
                énergétique est plus faible : tu en donnes davantage. La différence réelle est
                souvent moins importante que ce qu&apos;on pense.
              </p>
              <p>
                À cela s&apos;ajoutent les potentiels frais vétérinaires liés à une alimentation de
                moins bonne qualité (problèmes digestifs, pelage, surpoids). Le coût d&apos;une bonne
                alimentation peut s&apos;avérer un investissement sur le long terme.
              </p>
            </InfoBox>

            <div className="rounded-[var(--radius-lg)] p-5 text-center" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)' }}>
              <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                Tu veux savoir quelle marque est la meilleure pour ton animal ?
              </p>
              <Link href="/quiz" className="btn-primary text-sm py-2 inline-flex">
                Faire le quiz personnalisé →
              </Link>
            </div>
          </div>

          {/* FAQ */}
          <section className="mt-10">
            <h2 className="text-xl font-black text-[var(--text-primary)] mb-6" style={{ fontFamily: "'Fraunces', serif" }}>
              Questions fréquentes
            </h2>
            <div className="flex flex-col gap-4">
              {faqItems.map((item) => (
                <div key={item.question} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5">
                  <h3 className="font-bold text-[var(--text-primary)] mb-2">{item.question}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>

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
    </>
  )
}
