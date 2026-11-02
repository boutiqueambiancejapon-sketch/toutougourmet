// Tests de la note du scanner (lib/scanner/score.ts), sans framework : npx tsx scripts/test-scanner-score.ts
import assert from 'node:assert/strict'
import { INCOMPLETE_LABEL, PREMIUM_LABEL, SUPERMARKET_LABEL } from '../lib/scanner/fixtures'
import { animalKind, isByProduct, isCereal } from '../lib/scanner/ingredients'
import { carbsCriterion, dryMatterBasis, scoreLabel, SCORE_VERSION } from '../lib/scanner/score'
import { alternativesFor, ficheTitle, partnerBrand, shortProduct } from '../lib/scanner/seo'
import { parseExtractedLabel } from '../lib/scanner/types'
import { parseIngredientText } from '../lib/scanner/ingredient-text'
import { opffImageType, opffToLabel } from '../lib/scanner/opff'
import { classifyExtraction, nothingRead } from '../lib/scanner/outcome'
import { highlights } from '../lib/scanner/highlights'
import { ingredientClass } from '../lib/scanner/ingredient-class'

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

test('espèces non nommées, céréales fractionnées, antioxygènes sans nom (cas réel du 2026-11-02)', () => {
  const r = scoreLabel({
    ...PREMIUM_LABEL,
    ingredients: [
      { nom: 'protéines de volaille déshydratées', pourcentage: null },
      { nom: 'farine de maïs', pourcentage: null },
      { nom: 'maïs', pourcentage: null },
      { nom: 'farine de blé', pourcentage: null },
      { nom: 'graisses animales', pourcentage: null },
      { nom: 'hydrolysat de protéines animales', pourcentage: null },
    ],
    additifs: ['Vitamine A : 12000 UI', 'Conservateurs', 'Antioxygènes'],
    partAnimaleDeclaree: null,
  })
  assert.equal(pts(r, 'sous-produits'), 3)
  assert.equal(pts(r, 'cereales'), 1)
  assert.equal(pts(r, 'conservateurs'), 3)
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

// ── Open Pet Food Facts et tri des lectures (v2 du scanner) ────────────────

const EMPREINTES_TEXT =
  'Poulet (26% dont poulet frais 14%), riz, blé, protéines animales déshydratées, graisses animales, chicorée déshydratée (0,5%), mélange de plantes séchées (Rosmarinus sp., Curcuma sp.).\r\nADDITIFS (par kg), Vitamine A :, 24 000 U.I., Taurine :, 1 000 mg, Sépiolite : 750 mg'

test('texte d\'ingrédients : ordre, pourcentages, sous-listes, bloc additifs', () => {
  const r = parseIngredientText(EMPREINTES_TEXT)
  assert.deepEqual(r.ingredients.map((i) => i.nom), [
    'Poulet (26% dont poulet frais 14%)',
    'riz',
    'blé',
    'protéines animales déshydratées',
    'graisses animales',
    'chicorée déshydratée',
    'mélange de plantes séchées (Rosmarinus sp., Curcuma sp.)',
  ])
  assert.equal(r.ingredients[0].pourcentage, 26)
  assert.equal(r.ingredients[5].pourcentage, 0.5)
  assert.equal(r.ingredients[1].pourcentage, null)
  assert.deepEqual(r.additifs, ['ADDITIFS (par kg)', 'Vitamine A', 'Taurine', 'Sépiolite : 750 mg'])
})

test('texte d\'ingrédients : pourcentage après le nom, astérisques, antioxygènes en fin', () => {
  const r = parseIngredientText('poulet frais* 40%, pommes de terre* (séchées), huile de saumon* 2,3%.\r\nvitamine A 27 000 UI\r\nantioxygènes')
  assert.deepEqual(r.ingredients, [
    { nom: 'poulet frais', pourcentage: 40 },
    { nom: 'pommes de terre (séchées)', pourcentage: null },
    { nom: 'huile de saumon', pourcentage: 2.3 },
  ])
  assert.deepEqual(r.additifs, ['vitamine A 27 000 UI', 'antioxygènes'])
})

const OPFF_COMPLETE = {
  code: '3616661263714',
  brands: 'Empreintes',
  product_name_fr: 'Croquettes poulet céréales, chien adulte race de grande taille',
  ingredients_text_fr: EMPREINTES_TEXT,
  categories_tags: ['en:dog-food', 'en:dry-dog-food'],
  additives_tags: [],
  nutriments: {
    'crude-protein_100g': 28, 'crude-fat_100g': 17, 'crude-fibre_100g': 3, 'crude-ash_100g': 7.5, 'moisture_100g': 10,
    calcium_100g: 0.0234, calcium_unit: 'g', phosphorus_100g: 0.011, phosphorus_unit: 'g',
  },
}

test('Open Pet Food Facts : fiche complète convertie et notée par notre barème', () => {
  const v = opffToLabel(OPFF_COMPLETE, '3616661263714')
  assert.equal(v.kind, 'complete')
  if (v.kind !== 'complete') return
  assert.equal(v.label.marque, 'Empreintes')
  assert.equal(v.label.constituants.proteines, 28)
  assert.equal(v.label.constituants.humidite, 10)
  assert.equal(v.label.constituants.calcium, null, 'calcium en g : ignoré (unités mélangées dans la base)')
  const r = scoreLabel(v.label)
  assert.ok(r.score !== null)
  assert.equal(pts(r, 'premier-ingredient'), 15)
  assert.equal(pts(r, 'sous-produits'), 3, 'protéines et graisses animales sans espèce')
})

test('Open Pet Food Facts : constituants absents → photos, marque et produit préremplis', () => {
  const v = opffToLabel({ ...OPFF_COMPLETE, nutriments: {} }, '3616661263714')
  assert.deepEqual(v, { kind: 'incomplete', brand: 'Empreintes', product: OPFF_COMPLETE.product_name_fr, type: 'aliment-chien' })
  const noText = opffToLabel({ ...OPFF_COMPLETE, ingredients_text_fr: '', ingredients_text: '' }, '3616661263714')
  assert.equal(noText.kind, 'incomplete')
})

test('Open Pet Food Facts : champs « humains » proteins/fat acceptés, chat et friandise repérés', () => {
  const v = opffToLabel({ ...OPFF_COMPLETE, nutriments: { proteins_100g: 25, fat_100g: 14, fiber_100g: 2.5 } }, '3616661263714')
  assert.equal(v.kind, 'complete')
  assert.equal(opffImageType(['en:cat-food', 'en:dry-cat-food']), 'aliment-chat')
  assert.equal(opffImageType(['en:dog-food', 'en:dog-treats']), 'friandise')
  assert.equal(opffImageType(['en:dog-and-cat-food', 'en:dog-food']), 'aliment-chien')
})

const read = (patch: Partial<typeof PREMIUM_LABEL>) => ({ ...PREMIUM_LABEL, ...patch })
const EMPTY_ANALYSIS = { proteines: null, matieresGrasses: null, cellulose: null, cendres: null, humidite: null, calcium: null, phosphore: null }

test('tri des lectures : refus non décomptés, partie manquante demandée', () => {
  assert.equal(classifyExtraction(PREMIUM_LABEL).kind, 'complete')
  assert.deepEqual(classifyExtraction(read({ estUneEtiquette: false })), { kind: 'reject', code: 'not_a_label' })
  assert.deepEqual(classifyExtraction(read({ typeImage: 'aliment-chat' })), { kind: 'reject', code: 'cat_food' })
  assert.deepEqual(classifyExtraction(read({ typeImage: 'friandise' })), { kind: 'reject', code: 'treat' })
  assert.deepEqual(classifyExtraction(read({ ingredients: [], constituants: EMPTY_ANALYSIS, lisibilite: 'floue' })), { kind: 'reject', code: 'blurry' })
  // Cas réel : photo floue « lue » quand même, tout marqué douteux
  assert.deepEqual(classifyExtraction(read({ lisibilite: 'floue', champsDouteux: ['ingredients', 'proteines'] })), { kind: 'reject', code: 'blurry' })
  assert.deepEqual(classifyExtraction(read({ lisibilite: 'floue', champsDouteux: ['proteines', 'cendres', 'humidite'] })), { kind: 'reject', code: 'blurry' })
  assert.equal(classifyExtraction(read({ lisibilite: 'floue', champsDouteux: ['calcium'] })).kind, 'complete', 'un seul chiffre douteux : note avec « à vérifier »')
  assert.equal(classifyExtraction(read({ espece: 'chat', typeImage: 'aliment-chien' })).kind, 'complete', 'espèce contredite par le type : on suit le type')
  const missing = classifyExtraction(read({ constituants: EMPTY_ANALYSIS }))
  assert.equal(missing.kind, 'incomplete')
  assert.deepEqual(missing.kind === 'incomplete' && missing.missing, ['analyse'])
  assert.equal(nothingRead(missing), false)
  const front = classifyExtraction(read({ ingredients: [], constituants: EMPTY_ANALYSIS }))
  assert.equal(nothingRead(front), true, 'devant du sac seul : rien de lu, non décompté')
})

test('points forts et faibles de la fiche de partage', () => {
  const good = highlights(scoreLabel(PREMIUM_LABEL))
  assert.equal(good.strengths.length, 2)
  assert.ok(good.strengths.some((s) => /protéines/i.test(s)), good.strengths.join(' | '))
  const bad = highlights(scoreLabel(SUPERMARKET_LABEL))
  assert.equal(bad.weaknesses.length, 2)
  assert.ok(bad.weaknesses.every((w) => w.length <= 40), bad.weaknesses.join(' | '))
})

test('couleur des ingrédients sur la fiche A4', () => {
  assert.equal(ingredientClass('Saumon frais'), 'nommee')
  assert.equal(ingredientClass('Graisses animales'), 'non-nommee')
  assert.equal(ingredientClass('Viandes et sous-produits animaux'), 'non-nommee')
  assert.equal(ingredientClass('Farine de maïs'), 'cereale')
  assert.equal(ingredientClass('Antioxydant : BHA (E320)'), 'controverse')
  assert.equal(ingredientClass('Sucres'), 'controverse')
  assert.equal(ingredientClass('Pulpe de betterave'), 'autre')
})

test('calcul des glucides partagé avec le calculateur', () => {
  const b = dryMatterBasis({ proteines: 26, matieresGrasses: 15, cendres: 7, cellulose: 3, humidite: null }, 'sec')
  assert.equal(b.assumedMoisture, true)
  assert.equal(b.moisture, 10)
  assert.equal(b.carbsAsFed, 39)
  assert.equal(b.carbsDm, 43.3)
  const c = carbsCriterion(b.carbsDm as number)
  assert.equal(c.points, 6)
  assert.match(c.explanation, /43,3/)
  assert.equal(scoreLabel(SUPERMARKET_LABEL).dryMatter?.glucides, dryMatterBasis(SUPERMARKET_LABEL.constituants, SUPERMARKET_LABEL.typeAliment).carbsDm)
})

test('title de fiche : 60 caractères au plus, nom du produit coupé au mot', () => {
  const t = ficheTitle('Royal Canin', 'Royal Canin Medium Adult croquettes pour chien adulte de taille moyenne', 48)
  assert.ok(t.length <= 60, `${t.length} ${t}`)
  assert.match(t, /^Croquettes Royal Canin Medium/)
  assert.match(t, / : avis et note 48\/100$/)
  assert.equal(ficheTitle('Edgard & Cooper', 'Poulet', 81), 'Croquettes Edgard & Cooper Poulet : avis et note 81/100')
  assert.equal(ficheTitle(null, null, null), 'Croquettes : avis et composition')
  assert.equal(ficheTitle('Lidl', 'Orlando multi-croquettes boeuf', 18), 'Croquettes Lidl Orlando : avis et note 18/100')
  assert.equal(shortProduct('Lidl', 'Lidl Orlando multi-croquettes pour chien'), 'Orlando multi-croquettes')
  assert.ok(ficheTitle('Une marque au nom vraiment très très long', 'Produit', 12).length <= 60)
})

test('marque partenaire et alternatives sous 55', () => {
  assert.equal(partnerBrand('Franklin')?.slug, 'franklin')
  assert.equal(partnerBrand('Franklin Pet Food')?.slug, 'franklin')
  assert.equal(partnerBrand('Ultra Premium Direct')?.slug, 'ultra-premium-direct')
  assert.equal(partnerBrand('Pedigree'), null)
  assert.deepEqual(alternativesFor('Pedigree', 70), [])
  const alt = alternativesFor('Pedigree', 30)
  assert.ok(alt.length >= 1 && alt.length <= 2)
  assert.ok(alt.every((a) => a.brand.type.includes('croquettes') && !a.brand.stockNote))
  assert.ok(alternativesFor('Franklin', 30).every((a) => a.brand.slug !== 'franklin'))
})

if (failed) {
  console.error(`${failed} test(s) en échec`)
  process.exit(1)
}
console.log('Tous les tests passent.')
