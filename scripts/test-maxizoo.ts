// Vérifie la lecture des pages Maxi Zoo, sans réseau : npx tsx scripts/test-maxizoo.ts
import assert from 'node:assert/strict'
import { isMixedProduct, maxiZooLabel, pageText, parseMaxiZooPage, productName } from '../lib/scanner/maxizoo'
import { analyseLabel } from '../lib/scanner/analyse'

const dry = 'Ingrédients Composants analytiques WILDERNESS Maxi 12 kg (1297078): Protéines 31 %, matières grasses 16 %, cendres brutes 7,8 %, cellulose brute 3 %, calcium 1,6 %, phosphore 1,1 %. Composition WILDERNESS Maxi 12 kg (1297078) : Protéines de canard (27 %), viande fraîche de canard (25 %), Flocons de pomme de terre (23,6 %), graisse de canard (5,1 %). Peut contenir des traces. Additifs par kg : Vitamine A 16 000 UI'
const a = parseMaxiZooPage(dry)
assert.ok(a.ok)
if (a.ok) {
  assert.deepEqual([a.constituants.proteines, a.constituants.matieresGrasses, a.constituants.cendres, a.constituants.cellulose, a.constituants.calcium, a.constituants.phosphore], [31, 16, 7.8, 3, 1.6, 1.1])
  assert.equal(a.constituants.humidite, null)
  assert.match(a.composition, /^Protéines de canard/)
  assert.doesNotMatch(a.composition, /Additifs|traces/)
  const label = maxiZooLabel({ brand: 'REAL NATURE', name: 'REAL NATURE WILDERNESS Maxi 12 kg', ean: '4047777102199', category: 'Chien > Nourriture pour chien > Croquettes pour chiens' }, a)
  assert.equal(label?.typeAliment, 'sec')
  assert.equal(label?.ingredients[0].pourcentage, 27)
  assert.equal(label?.produit, 'WILDERNESS Maxi 12 kg')
  assert.ok(label && analyseLabel(label).score !== null)
}
const wet = parseMaxiZooPage('Composants analytiques Protéine 8,1 %, matières grasses 4,5 %, cendres brutes 2,4 %, cellulose brute 0,4 %, humidité 79 % Composition 70 % cheval, 25 % bouillon de cheval, 2 % panais.')
assert.ok(wet.ok && wet.constituants.humidite === 79)
const treat = parseMaxiZooPage('Composants analytiques Protéines : 19,6 % - Fibres brutes : 1,4 % - Teneur en matières grasses : 9,2 % - Cendres brutes : 9,9 % - Humidité : 18 % - Valeur énergétique (ME) : 3131 kcal/kg Composition Protéine de volaille séchée, farine de blé, glycérine.')
assert.ok(treat.ok && treat.constituants.matieresGrasses === 9.2 && treat.constituants.cellulose === 1.4 && treat.kcal100g === 313)
assert.deepEqual(parseMaxiZooPage('Rien ici'), { ok: false, reason: 'section-absente' })
assert.deepEqual(parseMaxiZooPage('Composants analytiques Protéines 8 %, matières grasses 4 %. Bœuf : protéines 9 %, matières grasses 5 %. Composition bœuf, eau, carottes et sel.'), { ok: false, reason: 'plusieurs-recettes' })
assert.deepEqual(parseMaxiZooPage('Composants analytiques cendres 8 %. Composition bœuf, eau, carottes et sel.'), { ok: false, reason: 'chiffres-manquants' })
assert.deepEqual(parseMaxiZooPage('Composants analytiques Protéines 8 %, matières grasses 4 %.'), { ok: false, reason: 'composition-absente' })
assert.equal(isMixedProduct('Pedigree Mix en sauce 12x85 g'), true)
assert.equal(isMixedProduct('Royal Canin Mini Adult 8 kg'), false)
assert.equal(productName({ brand: 'Pedigree', name: 'Pedigree Adult bœuf' }), 'Adult bœuf')
assert.equal(pageText('<p>a&nbsp;b</p><script>x</script>'), ' a b ')
console.log('test-maxizoo : tout passe')
