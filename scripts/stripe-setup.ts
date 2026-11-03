// Catalogue Stripe de Premium : crée ou retrouve le Product « Toutou Gourmet Premium » et ses deux
// Prices (mensuel 5,99 €, annuel 29,99 €, EUR, TTC : tax_behavior inclusive). Idempotent : relancé,
// il retrouve tout (Product par son identifiant fixe, Prices par lookup_key) et ne crée rien de plus.
// Ne fixe AUCUN code de taxe : il liste des codes candidats lus dans l'API Tax Codes, à choisir avec
// le comptable, puis à poser à la main sur le Product (Dashboard ou --tax-code=txcd_…).
// Lit aussi, sans rien modifier, les réglages Stripe Tax et les enregistrements fiscaux.
//
// Lancer depuis la racine du site, clé de test chargée (jamais écrite dans un fichier du dépôt) :
//   set -a; . ~/.config/toutou/stripe.env; set +a; node_modules/.bin/tsx scripts/stripe-setup.ts
// Options : --live (accepte une clé live, pour la mise en production), --tax-code=txcd_… (pose le
// code choisi sur le Product, rien d'autre).

import Stripe from 'stripe'
import { PRICE_CENTS } from '../lib/premium/pricing'

const API_VERSION = '2026-10-28.endive'
const PRODUCT_ID = 'toutou_gourmet_premium'
const LOOKUP = { month: 'toutou_premium_monthly', year: 'toutou_premium_yearly' } as const
const TAX_WORDS = /(software as a service|saas|electronically supplied|information services)/i
/** General ESS, SaaS usage personnel, services d'information en ligne (personnel), IA en ligne (personnel). */
const SHORTLIST = ['txcd_10000000', 'txcd_10103000', 'txcd_10701401', 'txcd_10105001']

const args = process.argv.slice(2)
const live = args.includes('--live')
const taxCode = args.find((a) => a.startsWith('--tax-code='))?.slice('--tax-code='.length)

function fail(message: string): never {
  console.error(`[stripe-setup] ${message}`)
  process.exit(1)
}

const key = process.env.STRIPE_SECRET_KEY?.trim()
if (!key) fail('STRIPE_SECRET_KEY absente.')
if (!/^(rk|sk)_(test|live)_/.test(key)) fail('STRIPE_SECRET_KEY : forme inattendue (rk_test_… attendu).')
if (key.includes('_live_') && !live) fail('clé live refusée sans --live.')
if (key.startsWith('sk_')) console.warn('[stripe-setup] clé secrète complète détectée : préférer une clé restreinte rk_…')

const stripe = new Stripe(key, { apiVersion: API_VERSION })

async function product(): Promise<Stripe.Product> {
  try {
    const p = await stripe.products.retrieve(PRODUCT_ID)
    console.log(`Product trouvé : ${p.id} (${p.name})`)
    return p
  } catch (err) {
    if (!(err instanceof Stripe.errors.StripeError) || err.statusCode !== 404) throw err
  }
  const p = await stripe.products.create(
    { id: PRODUCT_ID, name: 'Toutou Gourmet Premium', description: "Abonnement Premium au compte Toutou Gourmet : plus d'analyses d'étiquette, alerte de poids, historique complet." },
    { idempotencyKey: `tg-product-${PRODUCT_ID}` },
  )
  console.log(`Product créé : ${p.id}`)
  return p
}

async function price(interval: 'month' | 'year'): Promise<Stripe.Price> {
  const amount = PRICE_CENTS[interval]
  const found = await stripe.prices.list({ lookup_keys: [LOOKUP[interval]], active: true, limit: 1 })
  const existing = found.data[0]
  if (existing) {
    const same = existing.unit_amount === amount && existing.currency === 'eur' && existing.tax_behavior === 'inclusive' && existing.recurring?.interval === interval
    console.log(`Price ${interval} trouvé : ${existing.id}${same ? '' : ' ATTENTION : montant, devise ou tax_behavior différents (un Price ne se modifie pas : en créer un autre)'}`)
    return existing
  }
  const p = await stripe.prices.create(
    { product: PRODUCT_ID, currency: 'eur', unit_amount: amount, tax_behavior: 'inclusive', recurring: { interval }, lookup_key: LOOKUP[interval], nickname: interval === 'month' ? 'Premium mensuel' : 'Premium annuel' },
    { idempotencyKey: `tg-price-${LOOKUP[interval]}-${amount}` },
  )
  console.log(`Price ${interval} créé : ${p.id}`)
  return p
}

async function taxCandidates(): Promise<void> {
  const codes: Stripe.TaxCode[] = []
  for await (const code of stripe.taxCodes.list({ limit: 100 })) codes.push(code)
  // Candidats repérés dans le guide officiel (docs.stripe.com/tax/tax-codes) : relus ici dans l'API
  // pour confirmer qu'ils existent, avec leur libellé exact. Complétés par une recherche par mots.
  const shortlist = SHORTLIST.map((id) => codes.find((c) => c.id === id)).filter((c): c is Stripe.TaxCode => !!c)
  const extra = codes.filter((c) => !SHORTLIST.includes(c.id) && TAX_WORDS.test(c.name) && /personal/i.test(c.name))
  const picks = [...shortlist, ...extra].slice(0, 5)
  console.log('\nCodes de taxe candidats (aucun n’est posé ; à choisir avec le comptable) :')
  for (const c of picks) console.log(`  ${c.id}  ${c.name}\n      ${c.description.slice(0, 200)}`)
  console.log('  Liste complète : https://docs.stripe.com/tax/tax-codes · API : https://docs.stripe.com/api/tax_codes')
}

async function taxStatus(): Promise<void> {
  try {
    const settings = await stripe.tax.settings.retrieve()
    console.log(`\nStripe Tax : statut ${settings.status}${settings.head_office?.address?.country ? `, siège ${settings.head_office.address.country}` : ', siège non renseigné'}`)
    const regs = await stripe.tax.registrations.list({ status: 'active', limit: 20 })
    const list = regs.data.map((r) => `${r.country} (${r.country_options && Object.keys(r.country_options).join(', ')})`)
    console.log(list.length ? `Enregistrements actifs : ${list.join(' · ')}` : 'Aucun enregistrement actif : Stripe ne collectera AUCUNE TVA.')
  } catch (err) {
    console.log(`\nStripe Tax illisible avec cette clé (${err instanceof Stripe.errors.StripeError ? err.code ?? err.type : 'erreur'}) : vérifier dans le Dashboard › Tax.`)
  }
}

async function main(): Promise<void> {
  console.log(`[stripe-setup] mode ${key!.includes('_live_') ? 'LIVE' : 'test'}`)
  const p = await product()
  if (taxCode) {
    if (!/^txcd_\d{8}$/.test(taxCode)) fail('--tax-code : forme txcd_00000000 attendue.')
    await stripe.taxCodes.retrieve(taxCode)
    await stripe.products.update(p.id, { tax_code: taxCode })
    console.log(`Code de taxe ${taxCode} posé sur ${p.id}.`)
  } else {
    console.log(`Code de taxe du Product : ${typeof p.tax_code === 'string' ? p.tax_code : p.tax_code?.id ?? 'aucun (le code par défaut du compte s’applique)'}`)
  }
  const [month, year] = [await price('month'), await price('year')]
  console.log('\nÀ ranger dans /srv/toutou/shared/.env :')
  console.log(`STRIPE_PRICE_MONTHLY=${month.id}`)
  console.log(`STRIPE_PRICE_YEARLY=${year.id}`)
  await taxCandidates()
  await taxStatus()
}

main().catch((err: unknown) => {
  fail(err instanceof Stripe.errors.StripeError ? `${err.type} ${err.code ?? ''} : ${err.message}` : err instanceof Error ? err.message : 'erreur inconnue')
})
