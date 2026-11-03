import { IconCheck, IconSparkle } from '@/components/icons'
import { PlanCta, type PlanId } from '@/components/compte/PremiumCta'
import { formatEuros, PRICE_CENTS } from '@/lib/premium/pricing'
import { FREE_MONTHLY_SCANS, PREMIUM_MONTHLY_SCANS } from '@/lib/scanner/config'
import type { PremiumMode } from '@/lib/server/membership'

// @cdc premium — cartes des trois formules de /premium (rendu serveur). Offre du lancement : 0 €,
// sans carte. Paiement en service ou bientôt : prix mensuel TTC, l'annuel en dessous (section
// #tarifs pour le détail). Sur téléphone, Premium passe en premier.

interface Plan {
  id: PlanId
  name: string
  price: string
  priceNote: string
  pitch: string
  features: string[]
}

const PREMIUM_FEATURES = [
  `${PREMIUM_MONTHLY_SCANS} analyses d'étiquette par photo par mois`,
  'Une alerte si son poids varie de plus de 5\u00a0% en moins de deux mois',
  'Toutes tes analyses gardées',
]

function premiumPlan(mode: PremiumMode): Plan {
  if (mode === 'launch') {
    return { id: 'premium', name: 'Premium', price: '0\u00a0€', priceNote: 'pendant le lancement', pitch: 'Sans carte bancaire. Tout le compte gratuit, plus\u00a0:', features: PREMIUM_FEATURES }
  }
  return {
    id: 'premium',
    name: 'Premium',
    price: formatEuros(PRICE_CENTS.month),
    priceNote: 'par mois, TTC',
    pitch: `Ou ${formatEuros(PRICE_CENTS.year)} par an. Sans engagement. Tout le compte gratuit, plus\u00a0:`,
    features: PREMIUM_FEATURES,
  }
}

const BASE_PLANS: Plan[] = [
  {
    id: 'none',
    name: 'Sans compte',
    price: '0\u00a0€',
    priceNote: 'sans inscription',
    pitch: 'Pour vérifier un sac ou calculer une ration en passant.',
    features: ['Lecture du code-barres et fiches produits', "Calcul de ration, de poids, d'âge et de budget"],
  },
  {
    id: 'free',
    name: 'Compte gratuit',
    price: '0\u00a0€',
    priceNote: 'avec une adresse e-mail',
    pitch: 'Pour garder le profil de ton chien et suivre son poids.',
    features: [
      `${FREE_MONTHLY_SCANS} analyses d'étiquette par photo par mois`,
      'Profil du chien, pesées et courbe de poids',
      'Outils pré-remplis avec son profil',
      'Tes 20 dernières analyses gardées',
      'Offres partenaires choisies selon son profil',
    ],
  },
]

function PlanCard({ plan, mode }: { plan: Plan; mode: PremiumMode }) {
  const premium = plan.id === 'premium'
  return (
    <article
      aria-labelledby={`formule-${plan.id}`}
      className={`flex h-full flex-col gap-4 rounded-card p-5 md:p-6 ${premium ? 'border-2 border-orange bg-amber-bg' : 'border border-line bg-paper'}`}
    >
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 id={`formule-${plan.id}`} className="m-0 font-display text-2xl font-black leading-tight text-ink">
            {plan.name}
          </h3>
          {premium ? (
            <span className="inline-flex items-center gap-1 rounded-pill bg-orange px-3 py-1 text-sm font-semibold text-ink">
              <IconSparkle className="size-4" />
              Le plus complet
            </span>
          ) : null}
        </div>
        <p className="m-0 flex items-baseline gap-2">
          <span className="font-display text-4xl font-black text-ink">{plan.price}</span>
          <span className="text-base text-ink-2">{plan.priceNote}</span>
        </p>
        <p className="m-0 text-base leading-snug text-ink-2">{plan.pitch}</p>
      </div>
      <ul role="list" className="m-0 flex list-none flex-col gap-2 p-0">
        {plan.features.map((f) => (
          <li key={f} className="m-0 flex items-start gap-2 text-base leading-snug text-ink">
            <IconCheck className="mt-0.5 size-5 text-green-ink" />
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-2">
        <PlanCta plan={plan.id} mode={mode} />
      </div>
    </article>
  )
}

export function PlanCards({ mode }: { mode: PremiumMode }) {
  const plans = [...BASE_PLANS, premiumPlan(mode)]
  return (
    <section aria-labelledby="formules" className="flex flex-col gap-4">
      <h2 id="formules" className="sr-only">
        Les trois formules
      </h2>
      <ul role="list" className="m-0 grid list-none grid-cols-1 gap-4 p-0 lg:grid-cols-3">
        {plans.map((p) => (
          <li key={p.id} className={`m-0 ${p.id === 'premium' ? 'order-first lg:order-none' : ''}`}>
            <PlanCard plan={p} mode={mode} />
          </li>
        ))}
      </ul>
    </section>
  )
}
