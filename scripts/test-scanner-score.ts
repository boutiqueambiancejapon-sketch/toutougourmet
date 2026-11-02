// Tests de la note du scanner (lib/scanner/score.ts), sans framework : npx tsx scripts/test-scanner-score.ts
import assert from 'node:assert/strict'
import { INCOMPLETE_LABEL, PREMIUM_LABEL, SUPERMARKET_LABEL } from '../lib/scanner/fixtures'
import { animalKind, isByProduct, isCereal } from '../lib/scanner/ingredients'
import { scoreLabel, SCORE_VERSION } from '../lib/scanner/score'
import { parseExtractedLabel } from '../lib/scanner/types'

let failed = 0
function test(name: string, fn: () => void) {
  try {
    fn()
    console.log(`ok  ${name}`)
  } catch (err) {
    failed++
    console.error(`ÉCHEC ${name}\n${err instanceof Error ? err.message : String(err)}`)
  }
}
const pts = (r: ReturnType<typeof scoreLabel>, id: string) => r.criteria.find((c) => c.id === id)?.points

test('croquette premium riche en viande : très bonne note', () => {
  const r = scoreLabel(PREMIUM_LABEL)
  assert.equal(r.version, SCORE_VERSION)
  assert.ok(r.score !== null && r.score >= 85, `note ${r.score}`)
  assert.equal(r.band, 'tres-bon')
  assert.equal(pts(r, 'premier-ingredient'), 15)
  assert.equal(pts(r, 'part-animale'), 8) // saumon 30 % + poulet 25 %, graisse et huile exclues
  assert.equal(r.dryMatter?.proteines, 34.8)
  assert.match(r.criteria[3].explanation, /70\u00a0% d'eau/, 'ingrédient frais signalé')
  assert.equal(pts(r, 'calcium-phosphore'), 5)
  assert.deepEqual(r.missing, [])
  assert.ok(r.criteria.every((c) => c.explanation.length > 10))
})

test('croquette de supermarché, céréales en tête : note faible', () => {
  const r = scoreLabel(SUPERMARKET_LABEL)
  assert.ok(r.score !== null && r.score < 35, `note ${r.score}`)
  assert.equal(r.band, 'faible')
  assert.equal(pts(r, 'premier-ingredient'), 0)
  assert.equal(pts(r, 'cereales'), 0)
  assert.equal(pts(r, 'sous-produits'), 0)
  assert.equal(pts(r, 'sucres'), 0)
  assert.equal(pts(r, 'conservateurs'), 0)
  assert.equal(pts(r, 'colorants'), 0)
  assert.equal(r.assumptions.length, 1, 'humidité supposée à 10 %')
  assert.equal(r.criteria.find((c) => c.id === 'calcium-phosphore'), undefined)
})

test('étiquette incomplète : pas de note, informations manquantes listées', () => {
  const r = scoreLabel(INCOMPLETE_LABEL)
  assert.equal(r.score, null)
  assert.equal(r.band, null)
  assert.ok(r.notice)
  for (const m of ['protéines', 'matières grasses', 'cendres brutes', 'humidité']) assert.ok(r.missing.includes(m), `manque ${m}`)
  assert.equal(pts(r, 'proteines'), null)
  assert.equal(pts(r, 'premier-ingredient'), 15)
})

test('aliment pour chat : pas de note', () => {
  const r = scoreLabel({ ...PREMIUM_LABEL, espece: 'chat' })
  assert.equal(r.score, null)
  assert.match(r.notice ?? '', /chat/)
})

test('pâtée sans humidité déclarée : pas de supposition', () => {
  const r = scoreLabel({ ...PREMIUM_LABEL, typeAliment: 'humide', constituants: { ...PREMIUM_LABEL.constituants, humidite: null } })
  assert.equal(r.assumptions.length, 0)
  assert.equal(pts(r, 'proteines'), null)
})

test('reconnaissance des ingrédients', () => {
  assert.equal(animalKind('Poulet déshydraté (25 %)'), 'nommee')
  assert.equal(animalKind('Protéines de volaille déshydratées'), 'non-nommee')
  assert.equal(animalKind('Graisse de poulet'), null)
  assert.equal(animalKind("Dérivés d'origine végétale"), null)
  assert.equal(animalKind('Œufs entiers séchés'), 'nommee')
  assert.ok(isByProduct('Viandes et sous-produits animaux'))
  assert.ok(!isByProduct('Foie de poulet'))
  assert.ok(isCereal('Farine de maïs'))
  assert.ok(!isCereal('Pommes de terre'))
  assert.ok(!isCereal('Poisson blanc'))
})

test('nettoyage de la sortie du fournisseur', () => {
  const l = parseExtractedLabel({
    estUneEtiquette: true,
    marque: '  Brindille ',
    produit: '',
    ean: '3 760000 000017',
    espece: 'loup',
    ingredients: [{ nom: 'Poulet', pourcentage: 140 }, { nom: null, pourcentage: 3 }],
    constituants: { proteines: 26, humidite: 'x' },
    additifs: 'pas une liste',
  })
  assert.equal(l.marque, 'Brindille')
  assert.equal(l.produit, null)
  assert.equal(l.ean, '3760000000017')
  assert.equal(l.espece, 'inconnu')
  assert.deepEqual(l.ingredients, [{ nom: 'Poulet', pourcentage: null }])
  assert.equal(l.constituants.proteines, 26)
  assert.equal(l.constituants.humidite, null)
  assert.deepEqual(l.additifs, [])
  assert.equal(l.confiance.marque, 'absent')
})

if (failed) {
  console.error(`${failed} test(s) en échec`)
  process.exit(1)
}
console.log('Tous les tests passent.')
