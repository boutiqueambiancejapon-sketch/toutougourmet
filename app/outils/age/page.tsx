// @cdc 5.0 — contrat : Outil calculateur · rendu SSG · JSON-LD WebApplication + FAQPage
import type { Metadata } from 'next'
import Link from 'next/link'
import { AgeCalculator } from '@/components/outils/AgeCalculator'
import { InfoBox } from '@/components/mdx/MdxComponents'

export const metadata: Metadata = {
  title: 'Calculateur âge chien en âge humain | Toutou Gourmet',
  description:
    'Quel âge a vraiment ton chien en âge humain ? Convertis l\'âge de ton chien selon son gabarit — bien plus précis que la règle des 7 ans. Gratuit et instantané.',
  alternates: { canonical: 'https://www.toutou-gourmet.com/outils/age' },
  openGraph: {
    title: 'Calculateur âge chien en âge humain | Toutou Gourmet',
    description: 'Convertis l\'âge de ton chien en âge humain selon son gabarit. La règle des 7 ans, c\'est dépassé.',
    url: 'https://www.toutou-gourmet.com/outils/age',
    type: 'website',
  },
}

const faqItems = [
  {
    question: 'La règle "1 an de chien = 7 ans humains" est-elle exacte ?',
    answer: 'Non, c\'est une simplification inexacte. La réalité est plus nuancée : un chien vieillit très vite lors de sa première année (équivalent à ~15 ans humains), puis le rythme ralentit et varie selon le gabarit. Les petites races vieillissent bien plus lentement que les grandes.',
  },
  {
    question: 'Pourquoi le gabarit change-t-il l\'âge humain équivalent ?',
    answer: 'Les grandes et très grandes races vieillissent biologiquement plus vite que les petites. Un Labrador de 10 ans (66 ans humains) est bien plus âgé proportionnellement qu\'un Yorkshire de 10 ans (56 ans humains). Les chiens de grande taille ont une espérance de vie plus courte : 8-12 ans contre 14-18 ans pour les petits.',
  },
  {
    question: 'À quel âge un chien est-il considéré senior ?',
    answer: 'Cela dépend de la taille : les petites races deviennent seniors vers 8-10 ans, les moyennes vers 7-8 ans, les grandes vers 6-7 ans, et les très grandes races dès 5-6 ans. Les besoins nutritionnels changent à cette étape — une alimentation adaptée "senior" peut faire une vraie différence.',
  },
  {
    question: 'Mon chien a 1 an, est-il adulte ?',
    answer: 'Biologiquement oui pour la plupart des races : à 1 an, un chien a l\'équivalent d\'environ 15 ans humains. Sa croissance osseuse est presque terminée (sauf très grandes races qui grandissent jusqu\'à 18-24 mois). En revanche, sa maturité comportementale arrive souvent entre 2 et 3 ans.',
  },
  {
    question: 'Comment bien nourrir un chien senior ?',
    answer: 'Un chien senior a des besoins différents : moins de calories (activité réduite), plus de protéines de qualité pour maintenir la masse musculaire, et des apports en oméga-3 pour les articulations. Les croquettes et repas frais premium sont généralement mieux adaptés que les gammes standard, car leur digestibilité est plus élevée.',
  },
]

export default function AgePage() {
  const webAppJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Calculateur âge chien en âge humain — Toutou Gourmet',
    url: 'https://www.toutou-gourmet.com/outils/age',
    description: 'Convertit l\'âge d\'un chien en âge humain équivalent selon son gabarit.',
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
            <span className="text-[var(--text-primary)]">Âge humain</span>
          </nav>

          {/* Header */}
          <div className="flex items-start gap-4 mb-8">
            <span className="text-5xl shrink-0">🐾</span>
            <div>
              <h1 className="page-title mb-2">
                Quel âge a mon chien en âge humain ?
              </h1>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Convertis l&apos;âge de ton chien en âge humain selon son gabarit. La règle des 7 ans
                est inexacte — la réalité dépend de la taille et de l&apos;âge réel du chien.
              </p>
            </div>
          </div>

          {/* Calculateur */}
          <AgeCalculator />

          {/* Explication */}
          <div className="mt-6 flex flex-col">
            <InfoBox color="blue" emoji="🔬" title="Pourquoi la règle des 7 ans est fausse">
              <p className="mb-2">
                La règle &laquo; 1 an de chien = 7 ans humains &raquo; est une approximation populaire mais
                biologiquement inexacte. Un chien de 1 an a déjà l&apos;équivalent de <strong>15 ans humains</strong> —
                pas 7. Ensuite le rythme de vieillissement ralentit, et varie fortement selon le gabarit.
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Tables basées sur le consensus vétérinaire international (WSAVA / AVMA).
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

          {/* CTA ration */}
          <div className="mt-8 rounded-[var(--radius-lg)] p-5 text-center" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)' }}>
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">
              Ton chien est senior ? Adapte sa ration.
            </p>
            <Link href="/outils/ration" className="btn-primary text-sm py-2 inline-flex">
              Calculer sa ration journalière →
            </Link>
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
    </>
  )
}
