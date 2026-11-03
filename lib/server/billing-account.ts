import { subscriptionGivesAccess } from '@/lib/premium/access'
import { sendNtfy } from './alerts/notify'
import { getMembership } from './membership'
import { getStripe, stripeErrorSummary } from './stripe'

// @cdc premium — suppression d'un compte abonné : l'abonnement Stripe est résilié tout de suite,
// sinon il continuerait d'être prélevé sans compte pour en profiter. Si Stripe ne répond pas, la
// suppression continue (droit à l'effacement) et le propriétaire reçoit une alerte pour résilier
// à la main. Les factures restent chez Stripe (obligation comptable).

export async function cancelSubscriptionBeforeDelete(userId: string): Promise<void> {
  const m = await getMembership(userId).catch(() => null)
  if (!m?.stripeSubscriptionId || !subscriptionGivesAccess(m.status)) return
  const stripe = getStripe()
  try {
    if (!stripe) throw new Error('Stripe non configuré')
    await stripe.subscriptions.cancel(m.stripeSubscriptionId, { invoice_now: false, prorate: false })
    console.log(`[stripe] abonnement ${m.stripeSubscriptionId} résilié avant suppression du compte`)
  } catch (err) {
    console.error(`[stripe] résiliation avant suppression impossible : ${stripeErrorSummary(err)}`)
    if (!process.env.NTFY_TOPIC) return
    await sendNtfy({
      title: 'Toutou Gourmet : abonnement à résilier',
      message: `Un compte abonné a été supprimé mais Stripe n'a pas résilié l'abonnement ${m.stripeSubscriptionId}. À résilier dans le Dashboard.`,
      priority: 4,
      tags: ['credit_card'],
      click: 'https://dashboard.stripe.com/subscriptions',
    }).catch(() => undefined)
  }
}
