// @cdc 5.0 — contrat : Outil calculateur · rendu SSG · JSON-LD WebApplication + FAQPage
import type { Metadata } from 'next'
import Link from 'next/link'
import { BodyScoreEvaluator } from '@/components/outils/BodyScoreEvaluator'
import { InfoBox } from '@/components/mdx/MdxComponents'

export const metadata: Metadata = {
  title: 'Score de condition corporelle chien — Poids idéal | Toutou Gourmet',
  description:
    'Ton chien est-il en surpoids, trop maigre ou à son poids idéal ? Évalue son score de condition corporelle (SCC) utilisé par les vétérinaires. Gratuit et instantané.',
  alternates: { canonical: 'https://www.toutou-gourmet.com/outils/poids' },
  openGraph: {
    title: 'Score de condition corporelle chien | Toutou Gourmet',
    description: 'Ton animal est-il à son poids de forme ? Découvre son score de condition corporelle vétérinaire.',
    url: 'https://www.toutou-gourmet.com/outils/poids',
    type: 'website',
  },
}

const faqItems = [
  {
    question: 'Comment savoir si mon chien est en surpoids ?',
    answer: 'La méthode vétérinaire consiste à palper les côtes de ton chien : si tu les sens facilement sans appuyer, son poids est idéal. Si tu dois appuyer fort, il est en surpoids. Si elles sont saillantes, il est trop maigre. Notre évaluateur traduit ce score en pourcentage par rapport au poids idéal pour sa morphologie.',
  },
  {
    question: 'Quel est le poids idéal pour mon chien ?',
    answer: 'Il n\'existe pas un poids idéal universel — cela dépend de la race, du gabarit et de la morphologie de ton chien. Les fourchettes générales : moins de 10 kg pour les petites races, 10-25 kg pour les moyennes, 25-45 kg pour les grandes. Ton vétérinaire peut établir un poids cible précis pour la race de ton chien.',
  },
  {
    question: 'Mon chien est obèse, que faire ?',
    answer: 'Ne réduis pas les rations brutalement : cela peut provoquer des carences. Réduis progressivement de 10-15% par semaine, augmente l\'activité physique (marches plus longues), et supprime les friandises. Si ton chien dépasse 25% de son poids idéal, consulte un vétérinaire pour un programme adapté. Une alimentation premium pauvre en glucides peut accélérer la perte de poids.',
  },
  {
    question: 'Pourquoi l\'obésité est-elle dangereuse pour un chien ?',
    answer: 'L\'obésité chez le chien est associée à une réduction de l\'espérance de vie de 15 à 20%, à des problèmes articulaires précoces (arthrose), au diabète, aux maladies cardiovasculaires et à des troubles respiratoires. C\'est l\'un des problèmes de santé les plus répandus chez les chiens domestiques en France.',
  },
]

const webAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Évaluateur score corporel chien — Toutou Gourmet',
  url: 'https://www.toutou-gourmet.com/outils/poids',
  description: 'Évalue le score de condition corporelle d\'un chien selon son poids actuel et son poids idéal.',
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

export default function PoidsPage() {
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
            <span className="text-[var(--text-primary)]">Poids & score corporel</span>
          </nav>

          {/* Header */}
          <div className="flex items-start gap-4 mb-8">
            <span className="text-5xl shrink-0">⚖️</span>
            <div>
              <h1 className="page-title mb-2">
                Évaluateur de poids & score corporel
              </h1>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Ton animal est-il à son poids de forme, en surpoids ou trop maigre ? L&apos;outil compare
                son poids actuel à son poids idéal et calcule son score de condition corporelle (SCC).
              </p>
            </div>
          </div>

          {/* Évaluateur */}
          <BodyScoreEvaluator />

          {/* Explications */}
          <div className="mt-6 flex flex-col">
            <InfoBox color="blue" emoji="📏" title="Qu'est-ce que le Score de Condition Corporelle (SCC) ?">
              <p className="mb-2">
                Le SCC est l&apos;indicateur utilisé par les vétérinaires pour évaluer la composition
                corporelle d&apos;un animal sur une échelle de 1 (cachectique) à 9 (obèse).
              </p>
              <p>
                Il s&apos;évalue en palpant les côtes, en observant la silhouette de profil (creux abdominal)
                et de dessus (sablier visible). Le score idéal se situe entre 4 et 5.
              </p>
            </InfoBox>

            <InfoBox color="rose" emoji="⚠️" title="Risques du surpoids chez l'animal">
              <ul className="space-y-1.5 list-disc pl-4">
                <li>Diabète et résistance à l&apos;insuline</li>
                <li>Problèmes articulaires et d&apos;arthrose prématurés</li>
                <li>Maladies cardiovasculaires</li>
                <li>Réduction de l&apos;espérance de vie de 15 à 20%</li>
              </ul>
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
              <Link href="/outils/ration" className="btn-outline text-sm py-2">🥣 Ration journalière →</Link>
              <Link href="/outils/budget" className="btn-outline text-sm py-2">💰 Budget mensuel →</Link>
              <Link href="/outils/cout" className="btn-outline text-sm py-2">📊 Coût annuel →</Link>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
