// Tests unitaires du Premium payant, sans clé Stripe ni base : signature du webhook (événements
// signés avec stripe.webhooks.generateTestHeaderString), gestionnaire d'événements (idempotence,
// activation, échec de paiement, résiliation, repli), règle d'accès et prix.
// Lancer : node_modules/.bin/tsx scripts/test-stripe-premium.ts
import assert from 'node:assert/strict'
import Stripe from 'stripe'
import { hasPremiumAccess, launchTrialEnd, parseLaunchEnd } from '../lib/premium/access'
import { premiumLaunchEndEmail } from '../lib/emails/premium-launch-end'
import { frDate, PRICE_CENTS, yearlySaving } from '../lib/premium/pricing'
import { stripeConfig } from '../lib/server/stripe'
import { handleStripeEvent, type BillingStore, type BillingTx, type SubscriptionSnapshot, type WebhookDeps } from '../lib/server/stripe-webhook'

let passed = 0
async function test(name: string, fn: () => void | Promise<void>) {
  await fn()
  passed++
  console.log(`ok - ${name}`)
}

const SECRET = 'whsec_test_fabrique_localement'

// ── Base en mémoire : même contrat que lib/server/billing-store.ts (tout ou rien par événement) ──
interface Row { userId: string; source: string; plan: string; status: string | null; customerId: string | null; subscriptionId: string | null; snap?: SubscriptionSnapshot }

function memoryStore(users: string[], rows: Row[]) {
  const events = new Set<string>()
  const tx: BillingTx = {
    userIdByCustomer: async (c) => rows.find((r) => r.customerId === c)?.userId ?? null,
    userIdBySubscription: async (s) => rows.find((r) => r.subscriptionId === s)?.userId ?? null,
    userExists: async (u) => users.includes(u),
    getRow: async (u) => {
      const r = rows.find((x) => x.userId === u)
      return r ? { source: r.source, status: r.status, subscriptionId: r.subscriptionId } : null
    },
    saveSubscription: async (u, snap) => {
      let r = rows.find((x) => x.userId === u)
      if (!r) rows.push((r = { userId: u, source: 'stripe', plan: 'free', status: null, customerId: null, subscriptionId: null }))
      Object.assign(r, { source: 'stripe', status: snap.status, customerId: snap.customerId, subscriptionId: snap.id, plan: ['active', 'trialing', 'past_due'].includes(snap.status) ? 'premium' : 'free', snap })
    },
  }
  const store: BillingStore = {
    async once(id, _type, fn) {
      if (events.has(id)) return false
      const backup = JSON.stringify(rows)
      try {
        await fn(tx)
      } catch (err) {
        rows.splice(0, rows.length, ...(JSON.parse(backup) as Row[]))
        throw err
      }
      events.add(id)
      return true
    },
  }
  return { store, rows, events }
}

// ── Stripe simulé : abonnements relus par identifiant ──
function sub(id: string, customer: string, status: string, extra: Record<string, unknown> = {}): Stripe.Subscription {
  const object = {
    id,
    object: 'subscription',
    customer,
    status,
    cancel_at_period_end: false,
    cancel_at: null,
    metadata: {},
    items: { object: 'list', data: [{ id: `si_${id}`, current_period_end: 1_800_000_000, price: { id: 'price_test_year', recurring: { interval: 'year' } } }] },
    ...extra,
  }
  return object as unknown as Stripe.Subscription
}

function harness(users: string[], rows: Row[], subs: Record<string, Stripe.Subscription>) {
  const mem = memoryStore(users, rows)
  const alerts: string[] = []
  const records: string[] = []
  const deps: WebhookDeps = {
    store: mem.store,
    retrieveSubscription: async (id) => {
      const s = subs[id]
      if (!s) throw new Error(`abonnement inconnu ${id}`)
      return s
    },
    retrieveCharge: async (id) => ({ id, amount: 2999, customer: 'cus_A' }) as unknown as Stripe.Charge,
    alert: async (title) => void alerts.push(title),
    record: async (name) => void records.push(name),
    log: () => undefined,
    now: () => new Date('2026-11-03T12:00:00Z'),
  }
  return { ...mem, deps, alerts, records }
}

/** Corps signé comme Stripe l'envoie, puis vérifié comme la route du webhook. */
function signed(id: string, type: string, object: Record<string, unknown>): Stripe.Event {
  const payload = JSON.stringify({ id, object: 'event', type, livemode: false, created: 1_790_000_000, api_version: '2026-10-28.endive', data: { object } })
  const header = Stripe.webhooks.generateTestHeaderString({ payload, secret: SECRET })
  return Stripe.webhooks.constructEvent(payload, header, SECRET)
}

const session = (id: string, extra: Record<string, unknown> = {}) => ({ id, object: 'checkout.session', mode: 'subscription', payment_status: 'paid', customer: 'cus_A', subscription: 'sub_1', client_reference_id: 'user_A', metadata: {}, ...extra })

async function main() {
  await test('signature : valide acceptée, secret faux ou corps modifié refusés', () => {
    const payload = JSON.stringify({ id: 'evt_sig', object: 'event', type: 'invoice.paid', data: { object: {} } })
    const header = Stripe.webhooks.generateTestHeaderString({ payload, secret: SECRET })
    assert.equal(Stripe.webhooks.constructEvent(payload, header, SECRET).id, 'evt_sig')
    assert.throws(() => Stripe.webhooks.constructEvent(payload, header, 'whsec_autre'))
    assert.throws(() => Stripe.webhooks.constructEvent(payload.replace('invoice.paid', 'charge.refunded'), header, SECRET))
  })

  await test('Checkout payé → Premium actif, compte retrouvé par le client Stripe', async () => {
    const h = harness(['user_A'], [{ userId: 'user_A', source: 'launch-free', plan: 'premium', status: null, customerId: 'cus_A', subscriptionId: null }], { sub_1: sub('sub_1', 'cus_A', 'active') })
    assert.equal(await handleStripeEvent(signed('evt_1', 'checkout.session.completed', session('cs_1')), h.deps), 'processed')
    const row = h.rows[0]
    assert.equal(row.source, 'stripe')
    assert.equal(row.status, 'active')
    assert.equal(row.snap?.interval, 'year')
    assert.ok(hasPremiumAccess(row, new Date(), null))
    assert.deepEqual(h.records, ['Premium Subscribed'])
  })

  await test('idempotence : le même événement renvoyé ne refait rien', async () => {
    const h = harness(['user_A'], [{ userId: 'user_A', source: 'stripe', plan: 'free', status: null, customerId: 'cus_A', subscriptionId: null }], { sub_1: sub('sub_1', 'cus_A', 'active') })
    const event = signed('evt_dup', 'customer.subscription.created', sub('sub_1', 'cus_A', 'active') as unknown as Record<string, unknown>)
    assert.equal(await handleStripeEvent(event, h.deps), 'processed')
    assert.equal(await handleStripeEvent(event, h.deps), 'duplicate')
    assert.deepEqual(h.records, ['Premium Subscribed'])
  })

  await test('paiement différé : session « unpaid » ignorée, puis async_payment_succeeded active', async () => {
    const h = harness(['user_A'], [{ userId: 'user_A', source: 'stripe', plan: 'free', status: null, customerId: 'cus_A', subscriptionId: null }], { sub_1: sub('sub_1', 'cus_A', 'active') })
    await handleStripeEvent(signed('evt_u', 'checkout.session.completed', session('cs_2', { payment_status: 'unpaid' })), h.deps)
    assert.equal(h.rows[0].status, null)
    await handleStripeEvent(signed('evt_s', 'checkout.session.async_payment_succeeded', session('cs_2')), h.deps)
    assert.equal(h.rows[0].status, 'active')
  })

  await test('repli : client inconnu, compte retrouvé par client_reference_id', async () => {
    const h = harness(['user_B'], [], { sub_9: sub('sub_9', 'cus_new', 'active') })
    await handleStripeEvent(signed('evt_r', 'checkout.session.completed', session('cs_3', { customer: 'cus_new', subscription: 'sub_9', client_reference_id: 'user_B' })), h.deps)
    assert.equal(h.rows[0]?.userId, 'user_B')
    assert.equal(h.rows[0]?.customerId, 'cus_new')
  })

  await test('paiement échoué → past_due (accès gardé), alerte au 2e échec', async () => {
    const subs = { sub_1: sub('sub_1', 'cus_A', 'past_due') }
    const h = harness(['user_A'], [{ userId: 'user_A', source: 'stripe', plan: 'premium', status: 'active', customerId: 'cus_A', subscriptionId: 'sub_1' }], subs)
    const invoice = (n: number) => ({ id: `in_${n}`, object: 'invoice', attempt_count: n, amount_due: 599, parent: { type: 'subscription_details', subscription_details: { subscription: 'sub_1' } } })
    await handleStripeEvent(signed('evt_f1', 'invoice.payment_failed', invoice(1)), h.deps)
    assert.equal(h.rows[0].status, 'past_due')
    assert.ok(hasPremiumAccess(h.rows[0], new Date(), null))
    assert.equal(h.alerts.length, 0)
    await handleStripeEvent(signed('evt_f2', 'invoice.payment_failed', invoice(2)), h.deps)
    assert.equal(h.alerts.length, 1)
    assert.deepEqual(h.records, [])
  })

  await test('résiliation → canceled, accès coupé, fin comptée', async () => {
    const h = harness(['user_A'], [{ userId: 'user_A', source: 'stripe', plan: 'premium', status: 'active', customerId: 'cus_A', subscriptionId: 'sub_1' }], { sub_1: sub('sub_1', 'cus_A', 'canceled') })
    await handleStripeEvent(signed('evt_d', 'customer.subscription.deleted', sub('sub_1', 'cus_A', 'canceled') as unknown as Record<string, unknown>), h.deps)
    assert.equal(h.rows[0].status, 'canceled')
    assert.equal(h.rows[0].plan, 'free')
    assert.equal(hasPremiumAccess(h.rows[0], new Date(), null), false)
    assert.deepEqual(h.records, ['Premium Canceled'])
  })

  await test('un ancien abonnement qui se termine n’écrase pas le nouveau', async () => {
    const h = harness(['user_A'], [{ userId: 'user_A', source: 'stripe', plan: 'premium', status: 'active', customerId: 'cus_A', subscriptionId: 'sub_new' }], { sub_old: sub('sub_old', 'cus_A', 'canceled') })
    await handleStripeEvent(signed('evt_o', 'customer.subscription.deleted', sub('sub_old', 'cus_A', 'canceled') as unknown as Record<string, unknown>), h.deps)
    assert.equal(h.rows[0].subscriptionId, 'sub_new')
    assert.equal(h.rows[0].status, 'active')
  })

  await test('erreur pendant le traitement : rien d’enregistré, l’événement pourra être rejoué', async () => {
    const h = harness(['user_A'], [{ userId: 'user_A', source: 'stripe', plan: 'free', status: null, customerId: 'cus_A', subscriptionId: null }], {})
    await assert.rejects(handleStripeEvent(signed('evt_x', 'customer.subscription.updated', sub('sub_absent', 'cus_A', 'active') as unknown as Record<string, unknown>), h.deps))
    assert.equal(h.events.has('evt_x'), false)
  })

  await test('litige et fraude → alertes ; événement non écouté ignoré', async () => {
    const h = harness([], [], {})
    await handleStripeEvent(signed('evt_dp', 'charge.dispute.created', { id: 'dp_1', object: 'dispute', amount: 2999, reason: 'fraudulent', charge: 'ch_1', evidence_details: { due_by: 1_800_000_000 } }), h.deps)
    await handleStripeEvent(signed('evt_ef', 'radar.early_fraud_warning.created', { id: 'issfr_1', object: 'radar.early_fraud_warning', fraud_type: 'card_never_received', charge: 'ch_1' }), h.deps)
    assert.equal(h.alerts.length, 2)
    assert.equal(await handleStripeEvent(signed('evt_n', 'customer.created', { id: 'cus_Z', object: 'customer' }), h.deps), 'ignored')
  })

  await test('règle d’accès : lancement, abonné, expiré', () => {
    const end = new Date('2027-02-01T00:00:00+01:00')
    const launch = { plan: 'premium', source: 'launch-free', status: null }
    assert.equal(hasPremiumAccess(launch, new Date('2027-01-15'), end), true)
    assert.equal(hasPremiumAccess(launch, new Date('2027-02-02'), end), false)
    assert.equal(hasPremiumAccess(launch, new Date('2030-01-01'), null), true)
    assert.equal(hasPremiumAccess({ ...launch, plan: 'free' }, new Date('2027-01-15'), end), false)
    for (const s of ['active', 'trialing', 'past_due']) assert.equal(hasPremiumAccess({ plan: 'premium', source: 'stripe', status: s }, new Date(), end), true)
    for (const s of ['canceled', 'unpaid', 'incomplete', 'incomplete_expired', 'paused', null]) assert.equal(hasPremiumAccess({ plan: 'premium', source: 'stripe', status: s }, new Date(), end), false)
    assert.equal(hasPremiumAccess(null, new Date(), end), false)
    assert.equal(parseLaunchEnd('pas une date'), null)
    assert.equal(parseLaunchEnd(undefined), null)
    assert.equal(launchTrialEnd(launch, end, new Date('2027-01-15'))?.getTime(), end.getTime())
    assert.equal(launchTrialEnd(launch, end, new Date('2027-01-31T00:00:00+01:00')), null)
    assert.equal(launchTrialEnd({ plan: 'free', source: 'stripe' }, end, new Date('2027-01-15')), null)
  })

  await test('prix : économie de l’annuel calculée honnêtement', () => {
    const s = yearlySaving()
    assert.equal(PRICE_CENTS.month, 599)
    assert.equal(PRICE_CENTS.year, 2999)
    assert.equal(s.twelveMonthsCents, 7188)
    assert.equal(s.savingCents, 4189)
    assert.equal(s.percent, 58)
    assert.equal(s.perMonthCents, 250)
    assert.equal(s.freeMonths, 6)
    assert.equal(frDate(new Date('2027-02-01T00:00:00+01:00')), '1er février 2027')
    assert.equal(frDate(new Date('2027-01-31T12:00:00+01:00')), '31 janvier 2027')
  })

  await test('e-mail de fin du lancement : prix et date dans l’objet et le texte', () => {
    const mail = premiumLaunchEndEmail({ name: 'Camille', endsOn: '1er février 2027' })
    assert.match(mail.subject, /1er février 2027/)
    assert.match(mail.text, /29,99/)
    assert.match(mail.text, /5,99/)
    assert.doesNotMatch(mail.html, /<script/i)
  })

  await test('configuration : paiement désactivé si une variable manque', () => {
    const full = { STRIPE_SECRET_KEY: 'rk_test_x', STRIPE_WEBHOOK_SECRET: 'whsec_x', STRIPE_PRICE_MONTHLY: 'price_m', STRIPE_PRICE_YEARLY: 'price_y' }
    assert.ok(stripeConfig(full))
    for (const k of Object.keys(full)) assert.equal(stripeConfig({ ...full, [k]: '' }), null)
    assert.equal(stripeConfig({ ...full, STRIPE_SECRET_KEY: 'pk_test_x' }), null)
    assert.equal(stripeConfig({}), null)
  })

  console.log(`\n${passed} tests réussis`)
}

main().catch((err: unknown) => {
  console.error(err)
  process.exit(1)
})
