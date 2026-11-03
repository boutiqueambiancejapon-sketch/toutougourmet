'use server'

import { redirect } from 'next/navigation'
import { SITE_URL } from '@/lib/i18n/config'
import { launchTrialEnd } from '@/lib/premium/access'
import { getSessionUser } from '@/lib/server/auth'
import { attachCustomer } from '@/lib/server/billing-store'
import { billingReady, emailVerified, getPremiumState } from '@/lib/server/membership'
import { recordPremiumEvent } from '@/lib/server/premium-events'
import { CHECKOUT_INTEGRATION_ID, getStripe, stripeConfig, stripeErrorSummary } from '@/lib/server/stripe'

// @cdc premium — actions serveur du paiement (Next vérifie l'origine : protection CSRF intégrée).
// Checkout Stripe en mode abonnement, TVA par Stripe Tax (prix TTC, tax_behavior inclusive sur les
// Prices), moyens de paiement réglés dans le Dashboard (jamais de payment_method_types). Le client
// Stripe est créé une fois par compte et enregistré avant le paiement : le webhook retrouve le compte
// par lui. La page de retour ne donne aucun accès : seul le webhook active Premium.

const SETTINGS = '/compte/reglages'

function baseUrl(): string {
  return (process.env.BETTER_AUTH_URL || SITE_URL).replace(/\/+$/, '')
}

function back(reason: string): never {
  redirect(`${SETTINGS}?paiement=${reason}#premium`)
}

export async function startCheckoutAction(form: FormData): Promise<void> {
  const user = await getSessionUser()
  if (!user) redirect('/compte/connexion?retour=/premium')
  const interval = form.get('formule') === 'mois' ? 'month' : 'year'
  if (form.get('renonciation') !== 'oui') back('renonciation')
  const cfg = stripeConfig()
  const stripe = getStripe()
  if (!cfg || !stripe || !(await billingReady())) back('indisponible')
  if (!(await emailVerified(user.id))) back('adresse')
  const state = await getPremiumState(user.id)
  if (state.membership?.source === 'stripe' && state.active) back('deja')

  const waiverAt = new Date()
  // Premium du lancement : la gratuité va jusqu'au bout, le premier prélèvement attend sa fin.
  const trialEnd = launchTrialEnd(state.membership, state.launchEndsAt, waiverAt)
  let url: string | null = null
  try {
    const customerId =
      state.membership?.stripeCustomerId ??
      (
        await stripe.customers.create(
          { email: user.email, name: user.name, metadata: { userId: user.id }, preferred_locales: ['fr'] },
          { idempotencyKey: `tg-customer-${user.id}` },
        )
      ).id
    await attachCustomer(user.id, customerId, waiverAt)
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: user.id,
      line_items: [{ price: cfg.prices[interval], quantity: 1 }],
      automatic_tax: { enabled: true },
      billing_address_collection: 'required',
      customer_update: { address: 'auto', name: 'auto' },
      integration_identifier: CHECKOUT_INTEGRATION_ID,
      locale: 'fr',
      metadata: { userId: user.id },
      subscription_data: {
        metadata: { userId: user.id, withdrawalWaiverAt: waiverAt.toISOString() },
        ...(trialEnd ? { trial_end: Math.floor(trialEnd.getTime() / 1000) } : {}),
      },
      custom_text: {
        submit: {
          message: "Tu as demandé l'accès immédiat à Premium et renoncé à ton droit de rétractation de 14 jours. Tu peux résilier à tout moment depuis ton compte.",
        },
      },
      success_url: `${baseUrl()}/compte?premium=merci`,
      cancel_url: `${baseUrl()}/premium#tarifs`,
    })
    url = session.url
  } catch (err) {
    console.error(`[stripe] Checkout impossible : ${stripeErrorSummary(err)}`)
  }
  if (!url) back('erreur')
  await recordPremiumEvent('Premium Checkout Started', { interval })
  redirect(url)
}

export async function openPortalAction(): Promise<void> {
  const user = await getSessionUser()
  if (!user) redirect(`/compte/connexion?retour=${SETTINGS}`)
  const stripe = getStripe()
  if (!stripe || !(await billingReady())) back('indisponible')
  const customerId = (await getPremiumState(user.id)).membership?.stripeCustomerId
  if (!customerId) back('sans-abonnement')
  let url: string | null = null
  try {
    const session = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: `${baseUrl()}${SETTINGS}#premium`, locale: 'fr' })
    url = session.url
  } catch (err) {
    console.error(`[stripe] portail impossible : ${stripeErrorSummary(err)}`)
  }
  if (!url) back('erreur')
  redirect(url)
}
