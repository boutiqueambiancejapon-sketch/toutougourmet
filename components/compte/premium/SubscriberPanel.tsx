import { IconSparkle } from '@/components/icons'
import type { Membership } from '@/db/schema'
import { formatEuros, PRICE_CENTS } from '@/lib/premium/pricing'
import { Benefits, frDate } from './Benefits'
import { ManageForm } from './ManageForm'

// @cdc premium — carte de l'abonné (espace compte) : formule, prochaine échéance ou fin prévue,
// paiement en échec, et le bouton vers le portail Stripe.

function statusLine(m: Membership): string {
  const end = m.currentPeriodEnd ? frDate(m.currentPeriodEnd) : null
  if (m.status === 'past_due') return "Le dernier paiement n'est pas passé. Stripe va réessayer : mets ta carte à jour pour garder Premium."
  if (m.cancelAtPeriodEnd) return end ? `Résiliation enregistrée : Premium reste actif jusqu'au ${end}, puis s'arrête sans autre prélèvement.` : 'Résiliation enregistrée.'
  if (m.status === 'trialing') return end ? `Gratuit jusqu'au ${end}, puis prélèvement automatique.` : 'Période gratuite en cours.'
  return end ? `Prochain prélèvement le ${end}.` : 'Abonnement en cours.'
}

export function SubscriberPanel({ membership }: { membership: Membership }) {
  const yearly = membership.billingInterval === 'year'
  const formula = yearly ? `Formule annuelle, ${formatEuros(PRICE_CENTS.year)} par an` : `Formule mensuelle, ${formatEuros(PRICE_CENTS.month)} par mois`
  const alert = membership.status === 'past_due'
  return (
    <section id="premium" aria-labelledby="premium-titre" className={`flex scroll-mt-24 flex-col gap-3 rounded-card p-4 md:p-6 ${alert ? 'border-2 border-orange-ink bg-paper' : 'border border-line bg-green-bg'}`}>
      <h2 id="premium-titre" className="m-0 flex items-center gap-2 font-display text-xl font-black text-ink">
        <IconSparkle className="size-5 text-green-ink" />
        Premium est actif
      </h2>
      <Benefits />
      <p className="m-0 text-base font-semibold text-ink">{formula}</p>
      <p role={alert ? 'alert' : undefined} className="m-0 text-base leading-relaxed text-ink-2">
        {statusLine(membership)}
      </p>
      <p className="m-0 text-sm text-ink-2">Carte, factures et résiliation : tout se règle sur la page sécurisée de Stripe.</p>
      <ManageForm />
    </section>
  )
}
