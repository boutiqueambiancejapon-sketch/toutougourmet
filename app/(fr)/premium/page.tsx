// @cdc premium — page publique des formules (indexable, statique) : sans compte, compte gratuit,
// Premium. Premium est gratuit pendant le lancement : 0 €, aucune carte demandée, aucun prix futur
// affiché. Les boutons choisissent inscription ou compte côté navigateur (components/compte/PremiumCta).
import type { Metadata } from 'next'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { FaqItem, FaqList } from '@/components/article/Faq'
import { PlanCta } from '@/components/compte/PremiumCta'
import { FREE_MONTHLY_SCANS, PREMIUM_MONTHLY_SCANS } from '@/lib/scanner/config'
import { ActivationSteps } from './ActivationSteps'
import { PlanCards } from './PlanCards'
import { PremiumCompare } from './PremiumCompare'

const URL = 'https://www.toutou-gourmet.com/premium'

export const metadata: Metadata = {
  title: { absolute: `Toutou Gourmet Premium, gratuit pendant le lancement` },
  description: `${PREMIUM_MONTHLY_SCANS} analyses d'étiquettes par mois, courbe de poids avec alertes et historique des scans. Premium à 0 € pendant le lancement, sans carte bancaire.`,
  alternates: { canonical: URL },
  openGraph: {
    title: 'Toutou Gourmet Premium, gratuit pendant le lancement',
    description: `${PREMIUM_MONTHLY_SCANS} analyses par mois, alertes de poids et historique complet. Sans carte bancaire.`,
    url: URL,
    type: 'website',
  },
}

const FAQ = [
  {
    question: 'Premium est-il vraiment gratuit ?',
    answer: "Oui, pendant le lancement. Aucune carte bancaire n'est demandée à l'activation, donc rien ne peut être prélevé.",
  },
  {
    question: 'Que se passe-t-il si Premium devient payant ?',
    answer: 'On te prévient avant. Rien ne sera prélevé automatiquement : tu choisiras de continuer ou non. Tes chiens, tes pesées et tes analyses restent dans ton compte.',
  },
  {
    question: 'Le scan par code-barres compte-t-il dans le quota ?',
    answer: `Non. Un produit déjà connu, retrouvé par son code-barres, s'affiche sans compte et ne compte jamais. Seule l'analyse d'une étiquette par photo entre dans le quota : ${FREE_MONTHLY_SCANS} par mois avec le compte gratuit, ${PREMIUM_MONTHLY_SCANS} avec Premium.`,
  },
  {
    question: 'Pourquoi faut-il enregistrer un chien pour activer Premium ?',
    answer: "Les alertes de poids et les offres partent de son profil : âge, poids, activité et stérilisation. Sans chien, Premium n'aurait rien à suivre.",
  },
  {
    question: 'Les offres du compte sont-elles des liens partenaires ?',
    answer: "Oui. On touche une commission si tu commandes, sans surcoût pour toi. Les marques sont choisies selon le profil de ton chien et nos fiches d'avis, et les remises affichées sont celles en cours chez nos partenaires.",
  },
  {
    question: 'Comment récupérer ou supprimer mes données ?',
    answer: 'Depuis les réglages du compte : un bouton télécharge tout en JSON, un autre supprime le compte sur-le-champ, formule Premium comprise.',
  },
]

export default function PremiumPage() {
  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }} />
      <div className="v2 mx-auto flex max-w-page flex-col gap-10 px-4 pt-4 pb-16 md:gap-14 md:px-8 md:pt-8">
        <div className="flex flex-col gap-5">
          <BreadcrumbNav items={[{ label: 'Accueil', href: '/' }, { label: 'Premium' }]} />
          <header className="flex max-w-prose flex-col gap-3">
            <p className="m-0 self-start rounded-pill bg-amber px-3 py-1 text-sm font-semibold text-ink">{'Premium à 0 € pendant le lancement'}</p>
            <h1 className="m-0 font-display text-4xl font-black leading-tight tracking-tight text-ink md:text-5xl">
              {'Compte gratuit ou Premium, quelle formule choisir ?'}
            </h1>
            <p className="m-0 text-base leading-relaxed text-ink-2 md:text-lg">
              {`Le code-barres et les fiches produits restent ouverts sans compte. Le compte garde le profil de ton chien et ses pesées. Premium double les analyses par photo (${PREMIUM_MONTHLY_SCANS} par mois au lieu de ${FREE_MONTHLY_SCANS}) et prévient quand son poids change vite.`}
            </p>
          </header>
        </div>

        <PlanCards />

        <PremiumCompare />

        <ActivationSteps />

        <section aria-labelledby="faq" className="flex max-w-prose flex-col">
          <h2 id="faq" className="m-0 font-display text-2xl font-black text-ink md:text-3xl">
            {'Questions fréquentes sur Premium'}
          </h2>
          <FaqList>
            {FAQ.map((item) => (
              <FaqItem key={item.question} question={item.question}>
                <p className="m-0">{item.answer}</p>
              </FaqItem>
            ))}
          </FaqList>
        </section>

        <section aria-labelledby="essayer" className="flex flex-col items-start gap-4 rounded-card bg-ink p-5 text-cream md:flex-row md:items-center md:justify-between md:p-8">
          <div className="flex flex-col gap-1">
            <h2 id="essayer" className="m-0 font-display text-2xl font-black text-cream">
              {'Premium coûte 0 € pendant le lancement'}
            </h2>
            <p className="m-0 text-base text-cream">Sans carte bancaire. Si Premium devient payant, on te prévient avant.</p>
          </div>
          <div className="w-full md:w-auto md:min-w-64">
            <PlanCta plan="premium" onDark />
          </div>
        </section>
      </div>
    </>
  )
}
