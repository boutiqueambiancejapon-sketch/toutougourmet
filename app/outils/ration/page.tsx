// @cdc 5.0 — contrat : Outil calculateur · rendu SSG · JSON-LD WebApplication + FAQPage
import type { Metadata } from 'next'
import Link from 'next/link'
import { RationCalculator } from '@/components/outils/RationCalculator'
import { InfoBox, Callout } from '@/components/mdx/MdxComponents'

export const metadata: Metadata = {
  title: 'Calculateur ration journalière chien et chat | Toutou Gourmet',
  description:
    'Calcule la ration journalière de ton chien ou chat selon son poids, âge et activité. Formule vétérinaire NRC 2006, résultat en grammes. Gratuit et instantané.',
  alternates: { canonical: 'https://www.toutou-gourmet.com/outils/ration' },
  openGraph: {
    title: 'Calculateur ration journalière chien et chat | Toutou Gourmet',
    description: 'Combien de grammes par jour pour ton animal ? La formule vétérinaire NRC adaptée à ton chien ou chat.',
    url: 'https://www.toutou-gourmet.com/outils/ration',
    type: 'website',
  },
}

const faqItems = [
  {
    question: 'Combien de grammes de croquettes donner à mon chien par jour ?',
    answer: 'Cela dépend du poids, de l\'âge et de l\'activité de ton chien. En moyenne : un chien de 10 kg adulte actif a besoin d\'environ 180-200g de croquettes premium par jour, un chien de 25 kg environ 340-380g. Notre calculateur donne le résultat précis selon la formule vétérinaire NRC 2006.',
  },
  {
    question: 'La quantité indiquée sur le sac de croquettes est-elle fiable ?',
    answer: 'Les indications sur les emballages sont souvent surestimées de 10 à 30% — c\'est dans l\'intérêt commercial des marques que tu consommes plus. La formule vétérinaire BEE (Besoin Énergétique d\'Entretien) est plus précise car elle tient compte du poids réel et de l\'activité de ton animal.',
  },
  {
    question: 'Mon chien mange-t-il trop ou pas assez ?',
    answer: 'La meilleure façon de le savoir est de combiner ce calculateur avec notre évaluateur de score corporel. Si ton chien prend du poids avec la ration calculée, réduis de 10%. S\'il en perd, augmente de 10%. Un suivi sur 4 semaines suffit généralement pour trouver le bon équilibre.',
  },
  {
    question: 'Faut-il donner la même ration été comme hiver ?',
    answer: 'Pas nécessairement. En hiver, un chien qui sort moins peut avoir besoin de moins de calories. En période de forte chaleur, l\'appétit diminue naturellement. Les chiens très actifs (randonnées, sports) ont des besoins ponctuellement plus élevés. Notre calculateur te donne une base — observe ensuite ton animal.',
  },
  {
    question: 'En combien de repas diviser la ration journalière ?',
    answer: 'Pour un adulte : 2 repas par jour (matin et soir) est idéal. Pour un chiot de moins de 6 mois : 3 repas. Pour les chiens âgés ayant des problèmes digestifs : 3 petits repas peuvent aussi être bénéfiques. Évite de donner toute la ration en une seule fois pour les grandes races (risque de torsion gastrique).',
  },
]

const webAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Calculateur ration journalière chien — Toutou Gourmet',
  url: 'https://www.toutou-gourmet.com/outils/ration',
  description: 'Calcule la ration journalière d\'un chien ou chat selon son poids, âge et niveau d\'activité.',
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

export default function RationPage() {
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
            <span className="text-[var(--text-primary)]">Ration journalière</span>
          </nav>

          {/* Header */}
          <div className="flex items-start gap-4 mb-8">
            <span className="text-5xl shrink-0">🥣</span>
            <div>
              <h1 className="page-title mb-2">
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
          <div className="mt-6 flex flex-col">
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
              <Link href="/outils/budget" className="btn-outline text-sm py-2">💰 Budget mensuel →</Link>
              <Link href="/outils/poids" className="btn-outline text-sm py-2">⚖️ Score corporel →</Link>
              <Link href="/outils/cout" className="btn-outline text-sm py-2">📊 Coût annuel →</Link>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
