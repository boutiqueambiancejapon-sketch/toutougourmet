// @cdc 5.0 — contrat : Outil bilan · rendu SSG · JSON-LD WebApplication + FAQPage
import type { Metadata } from 'next'
import Link from 'next/link'
import { BienNourriEvaluator } from '@/components/outils/BienNourriEvaluator'
import { InfoBox } from '@/components/mdx/MdxComponents'

export const metadata: Metadata = {
  title: 'Est-ce que ton chien est bien nourri ? — Bilan gratuit en 2 minutes',
  description:
    "6 questions pour évaluer la qualité de l'alimentation de ton chien. Score sur 100, conseils actionnables et recommandation personnalisée. Gratuit, sans inscription.",
  alternates: { canonical: 'https://www.toutou-gourmet.com/outils/bien-nourri' },
  openGraph: {
    title: 'Est-ce que ton chien est bien nourri ? — Bilan gratuit',
    description:
      "Évalue l'alimentation de ton chien en 6 questions. Score, diagnostic, conseils actionnables et reco personnalisée.",
    url: 'https://www.toutou-gourmet.com/outils/bien-nourri',
    type: 'website',
  },
}

const faqItems = [
  {
    question: 'Combien de temps prend le bilan ?',
    answer:
      'Le bilan se fait en 2 minutes environ : 6 questions courtes, sans inscription ni coordonnées à laisser. Tu obtiens immédiatement un score sur 100, un verdict et 3 à 4 conseils concrets adaptés à ton profil.',
  },
  {
    question: 'Le bilan remplace-t-il un avis vétérinaire ?',
    answer:
      "Non. C'est un outil de sensibilisation et d'auto-évaluation, pas un diagnostic. Pour toute pathologie, doute clinique ou changement majeur d'alimentation (chiot, gestation, pathologie chronique), consulte un vétérinaire.",
  },
  {
    question: 'Comment est calculé le score ?',
    answer:
      "Chaque réponse contribue positivement ou négativement à un score brut. Le total est normalisé sur 100. Quatre bandes : Excellent (≥ 80), Bon (60-79), À améliorer (40-59), À revoir d'urgence (< 40). Le score reflète la qualité globale de l'alimentation et les signes physiques associés.",
  },
  {
    question: 'Pourquoi recommandez-vous Dog Chef ou Elmut selon les cas ?',
    answer:
      "On recommande Elmut quand le profil révèle des signes santé (pelage, peau, digestion) — leur cuisson douce et leurs ingrédients qualité humaine aident à rétablir l'équilibre. On recommande Dog Chef quand l'objectif est un upgrade simple depuis une alimentation industrielle ou une correction de poids — leur sur-mesure ajuste automatiquement la ration. Si tout va déjà bien, on ne pousse aucune marque et on renvoie vers le comparateur.",
  },
  {
    question: 'Mes réponses sont-elles enregistrées ?',
    answer:
      "Non. Tout se passe dans ton navigateur, en local. On ne stocke aucune donnée, ne demande aucun email et n'envoie rien à des tiers. Tu peux recommencer le bilan autant de fois que tu veux.",
  },
]

const webAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Bilan alimentation chien — Est-ce que ton chien est bien nourri ?',
  url: 'https://www.toutou-gourmet.com/outils/bien-nourri',
  description:
    "Bilan gratuit en 6 questions pour évaluer la qualité de l'alimentation de ton chien.",
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

export default function BienNourriPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="min-h-screen py-12 px-4 bg-[var(--bg-primary)]">
        <div className="max-w-[720px] mx-auto">

          {/* Breadcrumb */}
          <nav className="text-sm text-[var(--text-muted)] mb-6 flex items-center gap-2">
            <Link href="/outils" className="hover:text-[var(--accent-1)]">
              Outils
            </Link>
            <span>/</span>
            <span className="text-[var(--text-primary)]">Bilan alimentation</span>
          </nav>

          {/* Header */}
          <div className="flex items-start gap-4 mb-8">
            <span className="text-5xl shrink-0">🐶</span>
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-[var(--accent-1)] mb-1">
                ⚡ Bilan gratuit · 2 minutes · sans inscription
              </p>
              <h1 className="page-title mb-2">
                Est-ce que ton chien est bien nourri ?
              </h1>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                6 questions pour évaluer la qualité de son alimentation actuelle. Tu obtiens
                un score sur 100, un diagnostic clair et 3 à 4 actions concrètes — adaptées
                à ton profil.
              </p>
            </div>
          </div>

          {/* Bilan */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 md:p-10 shadow-[var(--shadow-md)]">
            <BienNourriEvaluator />
          </div>

          {/* Info */}
          <div className="mt-6">
            <InfoBox color="blue" emoji="ℹ️" title="Comment ce bilan a-t-il été conçu ?">
              <p className="mb-2">
                Les 6 questions s&apos;appuient sur les indicateurs reconnus par la nutrition
                vétérinaire : qualité de la source, état corporel (BCS),
                signes cliniques visibles, transit digestif, dosage et fréquence.
              </p>
              <p>
                Le scoring pondère chaque facteur selon son impact réel sur la santé.
                La recommandation finale ({' '}
                <Link href="/marques/elmut" className="underline">Elmut</Link>,{' '}
                <Link href="/marques/dog-chef" className="underline">Dog Chef</Link> ou{' '}
                <Link href="/comparateur" className="underline">comparateur</Link>
                ) est routée selon le profil — on ne pousse pas la même marque à tout le monde.
              </p>
            </InfoBox>
          </div>

          {/* FAQ */}
          <section className="mt-10">
            <h2
              className="text-xl font-black text-[var(--text-primary)] mb-6"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Questions fréquentes
            </h2>
            <div className="flex flex-col gap-4">
              {faqItems.map((item) => (
                <div
                  key={item.question}
                  className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5"
                >
                  <h3 className="font-bold text-[var(--text-primary)] mb-2">{item.question}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Nav vers autres outils */}
          <div className="mt-10 pt-6 border-t border-[var(--border)]">
            <p className="text-sm font-semibold text-[var(--text-muted)] mb-3">Autres outils</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/outils/ration" className="btn-outline text-sm py-2">
                🥣 Ration journalière →
              </Link>
              <Link href="/outils/poids" className="btn-outline text-sm py-2">
                ⚖️ Score corporel →
              </Link>
              <Link href="/outils/budget" className="btn-outline text-sm py-2">
                💰 Budget mensuel →
              </Link>
              <Link href="/quiz" className="btn-outline text-sm py-2">
                🎯 Quiz marque idéale →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
