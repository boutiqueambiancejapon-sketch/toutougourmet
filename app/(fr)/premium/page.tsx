// @cdc premium — page publique des formules (indexable) : sans compte, compte gratuit, Premium.
// Trois offres selon l'environnement (premiumMode) : Premium gratuit du lancement, abonnement payant
// (5,99 € par mois ou 29,99 € par an, TTC, paiement Stripe), ou prix affichés avec « bientôt
// disponible » si le paiement n'est pas configuré. Page statique régénérée chaque heure : l'offre
// suit les variables d'environnement sans reconstruction. Ce qui dépend du compte (inscription,
// abonné ou non) se décide dans le navigateur (PlanCta, PricingGate).
import type { Metadata } from 'next'
import Link from 'next/link'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { FaqItem, FaqList } from '@/components/article/Faq'
import { PlanCta } from '@/components/compte/PremiumCta'
import { formatEuros, PRICE_CENTS } from '@/lib/premium/pricing'
import { FREE_MONTHLY_SCANS, PREMIUM_MONTHLY_SCANS } from '@/lib/scanner/config'
import { premiumMode, type PremiumMode } from '@/lib/server/membership'
import { ActivationSteps } from './ActivationSteps'
import { premiumFaq } from './faq'
import { PlanCards } from './PlanCards'
import { PremiumCompare } from './PremiumCompare'
import { PremiumPricing } from './PremiumPricing'

export const revalidate = 3600

const URL = 'https://www.toutou-gourmet.com/premium'
const PRICES = `${formatEuros(PRICE_CENTS.month)} par mois ou ${formatEuros(PRICE_CENTS.year)} par an`

const COPY: Record<PremiumMode, { title: string; badge: string; band: string; bandText: string }> = {
  launch: {
    title: 'Toutou Gourmet Premium, gratuit pendant le lancement',
    badge: 'Premium à 0 € pendant le lancement',
    band: 'Premium coûte 0 € pendant le lancement',
    bandText: 'Sans carte bancaire. Avant la fin du lancement, on te prévient par e-mail.',
  },
  paid: {
    title: `Toutou Gourmet Premium : ${PRICES}`,
    badge: `${PRICES}, TTC`,
    band: 'Premium, sans engagement',
    bandText: `${formatEuros(PRICE_CENTS.month)} par mois, résiliable à tout moment depuis ton compte.`,
  },
  soon: {
    title: `Toutou Gourmet Premium : ${PRICES}`,
    badge: 'Paiement en ligne bientôt disponible',
    band: 'Premium arrive bientôt en paiement en ligne',
    bandText: `${PRICES}, TTC. Le compte gratuit reste ouvert en attendant.`,
  },
}

export function generateMetadata(): Metadata {
  const mode = premiumMode()
  const intro = mode === 'launch' ? 'Premium à 0 € pendant le lancement, sans carte bancaire.' : `Premium à ${PRICES}, TTC, sans engagement.`
  return {
    title: { absolute: COPY[mode].title },
    description: `Sans compte, compte gratuit ou Premium : ${PREMIUM_MONTHLY_SCANS} analyses d'étiquettes par mois, courbe de poids avec alertes, historique complet des scans. ${intro}`,
    alternates: { canonical: URL },
    openGraph: { title: COPY[mode].title, description: `${PREMIUM_MONTHLY_SCANS} analyses par mois, alertes de poids et historique complet. ${intro}`, url: URL, type: 'website' },
  }
}

export default function PremiumPage() {
  const mode = premiumMode()
  const faq = premiumFaq(mode)
  const copy = COPY[mode]
  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }} />
      <div className="v2 mx-auto flex max-w-page flex-col gap-10 px-4 pt-4 pb-16 md:gap-14 md:px-8 md:pt-8">
        <div className="flex flex-col gap-5">
          <BreadcrumbNav items={[{ label: 'Accueil', href: '/' }, { label: 'Premium' }]} />
          <header className="flex max-w-prose flex-col gap-3">
            <p className="m-0 self-start rounded-pill bg-amber px-3 py-1 text-sm font-semibold text-ink">{copy.badge}</p>
            <h1 className="m-0 font-display text-4xl font-black leading-tight tracking-tight text-ink md:text-5xl">
              {'Compte gratuit ou Premium, quelle formule choisir ?'}
            </h1>
            <p className="m-0 text-base leading-relaxed text-ink-2 md:text-lg">
              {`Le code-barres et les fiches produits restent ouverts sans compte. Le compte garde le profil de ton chien et ses pesées. Premium double les analyses par photo (${PREMIUM_MONTHLY_SCANS} par mois au lieu de ${FREE_MONTHLY_SCANS}) et prévient quand son poids change vite.`}
            </p>
          </header>
        </div>

        <PlanCards mode={mode} />

        <PremiumPricing mode={mode} />

        <PremiumCompare />

        <ActivationSteps mode={mode} />

        <section aria-labelledby="faq" className="flex max-w-prose flex-col">
          <h2 id="faq" className="m-0 font-display text-2xl font-black text-ink md:text-3xl">
            {'Questions fréquentes sur Premium'}
          </h2>
          <FaqList>
            {faq.map((item) => (
              <FaqItem key={item.question} question={item.question}>
                <p className="m-0">{item.answer}</p>
              </FaqItem>
            ))}
          </FaqList>
          <p className="m-0 mt-4 text-sm text-ink-2">
            Prix, durée, résiliation et rétractation :{' '}
            <Link href="/conditions-generales-de-vente" className="font-semibold text-orange-ink underline underline-offset-2">
              conditions générales de vente
            </Link>
            .
          </p>
        </section>

        <section aria-labelledby="essayer" className="flex flex-col items-start gap-4 rounded-card bg-ink p-5 text-cream md:flex-row md:items-center md:justify-between md:p-8">
          <div className="flex flex-col gap-1">
            <h2 id="essayer" className="m-0 font-display text-2xl font-black text-cream">
              {copy.band}
            </h2>
            <p className="m-0 text-base text-cream">{copy.bandText}</p>
          </div>
          <div className="w-full md:w-auto md:min-w-64">
            <PlanCta plan="premium" mode={mode} onDark />
          </div>
        </section>
      </div>
    </>
  )
}
