// Tests de l'import Open Pet Food Facts (lib/scanner/opff-import.ts), sans framework :
// npx tsx scripts/test-opff-import.ts
import assert from 'node:assert/strict'
import { assessOpff, flattenNutrition, hashInput, meetsIndexRule, normalizeOpffEan, opffFoodKind, opffImageUrl, opffSpecies, toOpffRecord, type OpffDumpProduct } from '../lib/scanner/opff-import'

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

// Ligne réelle de l'export du 2026-11-03 (réduite) : valeurs au nouveau format `nutrition`
const EMPREINTES: OpffDumpProduct = {
  code: '3616661263714',
  brands: 'Empreintes',
  product_name_fr: 'Croquettes poulet céréales, chien adulte race de grande taille',
  ingredients_text_fr:
    'Poulet (26% dont poulet frais 14%), riz, blé, protéines animales déshydratées, graisses animales, chicorée déshydratée (0,5%), mélange de plantes séchées.',
  categories_tags: ['en:dog-and-cat-food', 'en:dog-food', 'en:dry-dog-food'],
  nutriments: {},
  nutrition: {
    aggregated_set: {
      nutrients: {
        'crude-protein': { value: 28, unit: '%', source_per: '1kg' },
        'crude-fat': { value: 17, unit: '%', source_per: '1kg' },
        'crude-fibre': { value: 3, unit: '%', source_per: '1kg' },
        'crude-ash': { value: 7.5, unit: '%', source_per: '1kg' },
        moisture: { value: 10, unit: '%', source_per: '1kg' },
        calcium: { value: 0.0234, unit: 'g', source_per: '1kg' },
      },
    },
  },
  last_modified_t: 1790000000,
  lang: 'fr',
  images: { selected: { front: { fr: { rev: '5' } } } },
}

test('espèce : catégories d\'abord, nom ensuite, « chien et chat » ne compte pas', () => {
  assert.equal(opffSpecies(EMPREINTES), 'chien')
  assert.equal(opffSpecies({ categories_tags: ['en:dog-and-cat-food', 'en:cat-food'] }), 'chat')
  assert.equal(opffSpecies({ categories_tags: ['en:dog-and-cat-food'], product_name: 'Croquettes pour chiot' }), 'chien')
  assert.equal(opffSpecies({ categories_tags: ['en:pet-food'], product_name: 'Boules mésanges' }), 'autre')
  assert.equal(opffSpecies({ categories_tags: ['en:dog-food', 'en:cat-food'], product_name: 'Hill\'s Canine Adult' }), 'chien')
})

test('aliment complet ou friandise', () => {
  assert.equal(opffFoodKind(EMPREINTES), 'complete')
  assert.equal(opffFoodKind({ categories_tags: ['en:dog-food', 'en:dog-treats'] }), 'treat')
  assert.equal(opffFoodKind({ categories_tags: ['en:dog-food'], product_name: 'Friandises au poulet' }), 'treat')
  assert.equal(opffFoodKind({ categories_tags: ['en:dog-food'], product_name: 'Croquettes biscuits complet' }), 'complete')
})

test('code-barres normalisé comme pour un scan', () => {
  assert.equal(normalizeOpffEan('3616661263714'), '3616661263714')
  assert.equal(normalizeOpffEan('052742121109'), '0052742121109', 'UPC-A complété d\'un 0')
  assert.equal(normalizeOpffEan('3616661263715'), null, 'clé de contrôle fausse')
  assert.equal(normalizeOpffEan('123'), null)
})

test('nouveau format nutrition ramené à l\'ancien', () => {
  const flat = flattenNutrition({
    'crude-protein': { value: 28, unit: '%', source_per: '1kg' },
    proteins: { value: 250, unit: 'g', source_per: '1kg' },
    fat: { value: 3, unit: 'g', source_per: 'serving' },
  })
  assert.equal(flat['crude-protein_100g'], 28)
  assert.equal(flat['proteins_100g'], 25, 'g pour 1 kg divisés par 10')
  assert.equal(flat['fat_100g'], undefined, 'valeur par portion ignorée')
})

test('fiche complète : notée par le barème, indexable selon la règle proposée', () => {
  const r = toOpffRecord('3616661263714', EMPREINTES)
  assert.equal(r.imageUrl, 'https://images.openpetfoodfacts.org/images/products/361/666/126/3714/front_fr.5.400.jpg')
  assert.equal(r.lastModified?.getTime(), 1790000000 * 1000)
  const a = assessOpff(r)
  assert.equal(a.scorable, true)
  if (!a.scorable) return
  assert.ok(a.score > 0 && a.score <= 100)
  assert.equal(a.indexable, true, '5 constituants, marque, nom, composition')
  assert.equal(meetsIndexRule({ ...a.label, constituants: { ...a.label.constituants, cendres: null, humidite: null } }, a.score), false)
})

test('fiche incomplète ou friandise : non notée, avec la raison', () => {
  const noText = assessOpff(toOpffRecord('3616661263714', { ...EMPREINTES, ingredients_text_fr: '' }))
  assert.deepEqual(noText, { scorable: false, reason: 'composition' })
  const noAnalysis = assessOpff(toOpffRecord('3616661263714', { ...EMPREINTES, nutrition: {} }))
  assert.deepEqual(noAnalysis, { scorable: false, reason: 'constituants' })
  const treat = assessOpff(toOpffRecord('3616661263714', { ...EMPREINTES, categories_tags: ['en:dog-food', 'en:dog-treats'] }))
  assert.deepEqual(treat, { scorable: false, reason: 'friandise' })
})

test('empreinte : la date de modification seule ne change rien', () => {
  const a = toOpffRecord('3616661263714', EMPREINTES)
  const b = toOpffRecord('3616661263714', { ...EMPREINTES, last_modified_t: 1800000000 })
  assert.equal(hashInput(a), hashInput(b))
  assert.notEqual(hashInput(a), hashInput(toOpffRecord('3616661263714', { ...EMPREINTES, brands: 'Autre' })))
  assert.equal(opffImageUrl('12345670', {}), null)
})

if (failed) {
  console.error(`\n${failed} test(s) en échec`)
  process.exit(1)
}
console.log('Tous les tests passent.')
