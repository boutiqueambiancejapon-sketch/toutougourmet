import { IconSparkle } from '@/components/icons'
import { launchTrialEnd } from '@/lib/premium/access'
import { formatEuros, PRICE_CENTS } from '@/lib/premium/pricing'
import type { PremiumMissing, PremiumMode, PremiumState } from '@/lib/server/membership'
import { Benefits, frDate } from './premium/Benefits'
import { CheckoutForm } from './premium/CheckoutForm'
import { OfferPanel } from './premium/OfferPanel'
import { SubscriberPanel } from './premium/SubscriberPanel'

// @cdc premium — carte Premium de l'espace compte. Abonné : formule, échéance, portail Stripe.
// Premium du lancement : date de fin de gratuité et, si le paiement est en service, choix de la
// formule (premier prélèvement à la fin de la gratuité). Sinon : carte d'appel (OfferPanel).

function LaunchPanel({ state, mode }: { state: PremiumState; mode: PremiumMode }) {
  const m = state.membership
  const end = state.launchEndsAt
  const trialEnd = launchTrialEnd(m, end)
  return (
    <section id="premium" aria-labelledby="premium-titre" className="flex scroll-mt-24 flex-col gap-3 rounded-card border border-line bg-green-bg p-4 md:p-6">
      <h2 id="premium-titre" className="m-0 flex items-center gap-2 font-display text-xl font-black text-ink">
        <IconSparkle className="size-5 text-green-ink" />
        Premium est activé
      </h2>
      <Benefits />
      <p className="m-0 text-sm text-ink-2">
        {m?.activatedAt ? `Activé le ${frDate(m.activatedAt)}. ` : ''}
        {end ? `Gratuit pendant le lancement, jusqu'au ${frDate(end)}.` : 'Gratuit pendant le lancement.'}
      </p>
      {mode === 'paid' ? (
        <div className="flex flex-col gap-3 rounded-box bg-paper p-4">
          <h3 className="m-0 font-display text-lg font-black text-ink">Garder Premium après le lancement</h3>
          <CheckoutForm trialEndsOn={trialEnd ? frDate(trialEnd) : null} />
        </div>
      ) : (
        <p className="m-0 text-sm text-ink-2">
          {`Après le lancement, Premium coûtera ${formatEuros(PRICE_CENTS.month)} par mois ou ${formatEuros(PRICE_CENTS.year)} par an. On te prévient par e-mail avant : rien n'est prélevé sans ton accord.`}
        </p>
      )}
    </section>
  )
}

export function PremiumPanel({ state, mode, missing }: { state: PremiumState; mode: PremiumMode; missing: PremiumMissing[] }) {
  const m = state.membership
  if (state.active && m?.source === 'stripe') return <SubscriberPanel membership={m} />
  if (state.active) return <LaunchPanel state={state} mode={mode} />
  return <OfferPanel mode={mode} missing={missing} membership={m} />
}
