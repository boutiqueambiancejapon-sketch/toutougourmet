// @cdc 5.0 — contrat : Outil calculateur · rendu SSG · JSON-LD WebApplication + FAQPage
import type { Metadata } from 'next'
import Link from 'next/link'
import { BudgetCalculator } from '@/components/outils/BudgetCalculator'
import { InfoBox } from '@/components/mdx/MdxComponents'

export const metadata: Metadata = {
  title: 'Estimateur budget mensuel alimentation chien | Toutou Gourmet',
  description:
    'Compare le budget mensuel de Franklin, Elmut, Petty Well et Dog Chef selon le profil de ton chien. Calcul instantané avec les offres du moment.',
  alternates: { canonical: 'https://www.toutou-gourmet.com/outils/budget' },
  openGraph: {
    title: 'Estimateur budget mensuel alimentation chien | Toutou Gourmet',
    description: 'Combien ça coûte vraiment de nourrir ton chien avec les meilleures marques ? Calcul en 30 secondes.',
    url: 'https://www.toutou-gourmet.com/outils/budget',
    type: 'website',
  },
}

const faqItems = [
  {
    question: 'Combien coûte nourrir un chien par mois en France ?',
    answer: 'En moyenne, entre 30€ et 120€/mois selon le gabarit et la qualité de l\'alimentation. Un chien de 10 kg avec des croquettes premium coûte environ 40-50€/mois. Un grand chien de 30 kg avec des repas frais peut atteindre 100-130€/mois.',
  },
  {
    question: 'Quelle marque de nourriture pour chien est la plus économique ?',
    answer: 'En comparant au coût journalier réel (après calcul des rations selon le poids du chien), les croquettes premium comme Franklin ou Petty Well sont souvent plus économiques que les repas frais à volume équivalent. Leur densité calorique élevée signifie qu\'on en donne moins.',
  },
  {
    question: 'Comment réduire le budget alimentation de mon chien sans rogner sur la qualité ?',
    answer: 'Profite des offres de bienvenue (-30% à -40% sur la 1ère commande) disponibles chez toutes les marques référencées. Passer à l\'abonnement plutôt qu\'à la commande unique réduit aussi le coût de 10-20%. Calculer la ration exacte évite le gaspillage.',
  },
  {
    question: 'Les repas frais sont-ils vraiment plus chers que les croquettes ?',
    answer: 'En coût au kilo, oui. Mais en coût par ration, c\'est plus nuancé : les repas frais ont une meilleure digestibilité, donc le chien absorbe mieux les nutriments. La différence réelle sur 1 an est souvent de 20-30% selon les marques et le gabarit du chien.',
  },
]

const webAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Estimateur budget alimentation chien — Toutou Gourmet',
  url: 'https://www.toutou-gourmet.com/outils/budget',
  description: 'Compare le budget mensuel des 4 meilleures marques de nourriture pour chien.',
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

export default function BudgetPage() {
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
            <span className="text-[var(--text-primary)]">Budget mensuel</span>
          </nav>

          {/* Header */}
          <div className="flex items-start gap-4 mb-8">
            <span className="text-5xl shrink-0">💰</span>
            <div>
              <h1 className="page-title mb-2">
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
          <div className="mt-6">
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
              <Link href="/outils/poids" className="btn-outline text-sm py-2">⚖️ Score corporel →</Link>
              <Link href="/outils/cout" className="btn-outline text-sm py-2">📊 Coût annuel →</Link>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
