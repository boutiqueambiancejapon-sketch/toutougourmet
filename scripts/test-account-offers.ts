// Tests unitaires des offres du compte et de l'alerte de poids. Lancer : npx tsx scripts/test-account-offers.ts
import assert from 'node:assert/strict'
import { brands } from '../data/brands'
import { CONFIRMED_DISCOUNTS, betterKibbleOffer, lifeStage, offersFor, sizeBand, weightGainOffer, type OfferProfile } from '../lib/account-offers'
import { weightTrend } from '../lib/weight-trend'

let passed = 0
function test(name: string, fn: () => void) {
  fn()
  passed++
  console.log(`ok - ${name}`)
}

const base: OfferProfile = { ageMonths: 48, weightKg: 15, sterilized: false, activity: 'normal' }
const slugs = (p: OfferProfile) => offersFor(p).map((o) => o.slug)

test('âge et gabarit', () => {
  assert.equal(lifeStage(6), 'chiot')
  assert.equal(lifeStage(12), 'adulte')
  assert.equal(lifeStage(84), 'senior')
  assert.equal(lifeStage(null), 'adulte')
  assert.equal(sizeBand(4), 'petit')
  assert.equal(sizeBand(25), 'moyen')
  assert.equal(sizeBand(30), 'grand')
  assert.equal(sizeBand(55), 'geant')
  assert.equal(sizeBand(null), null)
})

test('toujours 2 ou 3 offres, sans doublon, jamais Fidelis', () => {
  const profiles: OfferProfile[] = []
  for (const ageMonths of [null, 3, 30, 100])
    for (const weightKg of [null, 4, 15, 32, 60])
      for (const sterilized of [true, false])
        for (const activity of ['sedentaire', 'normal', 'actif', 'tres-actif'] as const)
          for (const gainingWeight of [true, false]) profiles.push({ ageMonths, weightKg, sterilized, activity, gainingWeight })
  for (const p of profiles) {
    const list = offersFor(p)
    assert.ok(list.length >= 2 && list.length <= 3, JSON.stringify(p))
    assert.equal(new Set(list.map((o) => o.slug)).size, list.length)
    assert.ok(list.every((o) => o.slug !== ('fidelis' as string)))
  }
})

test('remises : seulement celles confirmées, liens de data/brands.ts', () => {
  assert.equal(CONFIRMED_DISCOUNTS['ultra-premium-direct'], '−20 % sur la première commande en abonnement')
  for (const o of [...offersFor(base), weightGainOffer(), betterKibbleOffer()]) {
    const brand = brands.find((b) => b.slug === o.slug)
    assert.ok(brand, o.slug)
    assert.equal(o.url, brand.affiliateUrl)
    assert.equal(o.discount, CONFIRMED_DISCOUNTS[o.slug])
    assert.ok(o.reason.length > 20)
  }
})

test('chiot : Dog Chef (booster Puppy) en tête', () => {
  const list = offersFor({ ...base, ageMonths: 5, weightKg: 6 })
  assert.equal(list[0].slug, 'dog-chef')
  assert.match(list[0].reason, /Puppy/)
  assert.ok(!slugs({ ...base, ageMonths: 5 }).includes('ultra-premium-direct'))
})

test('senior : Elmut puis Dog Chef', () => {
  assert.deepEqual(slugs({ ...base, ageMonths: 100 }).slice(0, 2), ['dog-chef', 'elmut'])
})

test('prise de poids : Dog Chef en tête, jamais Dogfy (menu riche) ni Ultra Premium Direct', () => {
  const list = slugs({ ...base, gainingWeight: true })
  assert.equal(list[0], 'dog-chef')
  assert.ok(!list.includes('dogfy-diet'))
  assert.ok(!list.includes('ultra-premium-direct'))
})

test('adulte sportif : Franklin en tête', () => {
  assert.equal(slugs({ ...base, activity: 'tres-actif' })[0], 'franklin')
})

test('grand adulte non stérilisé : Ultra Premium Direct (prix au kilo)', () => {
  assert.equal(slugs({ ...base, weightKg: 35 })[0], 'ultra-premium-direct')
})

test('géant : pas de Dogfy (box de 5 à 40 kg)', () => {
  assert.ok(!slugs({ ...base, ageMonths: 5, weightKg: 60 }).includes('dogfy-diet'))
})

test('alerte de poids', () => {
  assert.equal(weightTrend([{ date: '2026-09-01', weightKg: 20 }]), null)
  const gain = weightTrend([
    { date: '2026-07-01', weightKg: 19 },
    { date: '2026-09-01', weightKg: 20 },
    { date: '2026-10-15', weightKg: 21.2 },
  ])
  assert.equal(gain?.kind, 'gain')
  assert.equal(gain?.pct, 6)
  assert.equal(gain?.days, 44)
  // 5 % tout juste : pas d'alerte (il faut plus de 5 %)
  assert.equal(weightTrend([{ date: '2026-09-01', weightKg: 20 }, { date: '2026-10-01', weightKg: 21 }]), null)
  // plus de 2 mois entre les deux pesées : pas d'alerte
  assert.equal(weightTrend([{ date: '2026-07-01', weightKg: 20 }, { date: '2026-10-01', weightKg: 23 }]), null)
  // ordre d'entrée indifférent, perte détectée
  assert.equal(weightTrend([{ date: '2026-10-20', weightKg: 18 }, { date: '2026-10-01', weightKg: 20 }])?.kind, 'loss')
})

console.log(`\n${passed} tests passés`)
