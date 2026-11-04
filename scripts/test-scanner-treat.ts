// Tests du barème friandise (lib/scanner/score-treat.ts), node:test : npx tsx --test scripts/test-scanner-treat.ts
// Étiquettes simulées (marques inventées), aucun appel au fournisseur de lecture.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { analyseLabel, productKind, scoreVersionFor } from '../lib/scanner/analyse'
import { calculateDailyCalories } from '../lib/calculators'
import { highlights, verdictText } from '../lib/scanner/highlights'
import { opffImageType, opffToLabel } from '../lib/scanner/opff'
import { classifyExtraction } from '../lib/scanner/outcome'
import { SCORE_VERSION } from '../lib/scanner/score'
import { meatSharePoints, scoreTreat, shortListPoints, TREAT_SCORE_VERSION } from '../lib/scanner/score-treat'
import { alternativesFor, ficheTitle, parseKind } from '../lib/scanner/seo'
import { allowanceText, treatAllowance, treatEnergy } from '../lib/scanner/treat-allowance'
import { hasSalt, treatAlerts, unnamedPreservative } from '../lib/scanner/treat-ingredients'
import { CONFIDENCE_FIELDS, parseExtractedLabel, type ExtractedLabel } from '../lib/scanner/types'

const sure = Object.fromEntries(CONFIDENCE_FIELDS.map((k) => [k, 'haute'])) as ExtractedLabel['confiance']
const NONE = { proteines: null, matieresGrasses: null, cellulose: null, cendres: null, humidite: null, calcium: null, phosphore: null }

function treat(patch: Partial<ExtractedLabel>): ExtractedLabel {
  return {
    estUneEtiquette: true,
    typeImage: 'friandise',
    lisibilite: 'nette',
    marque: 'Brindille',
    produit: 'Bâtonnets',
    ean: null,
    espece: 'chien',
    typeAliment: 'autre',
    ingredients: [],
    constituants: NONE,
    additifs: [],
    partAnimaleDeclaree: null,
    energie: null,
    confiance: sure,
    illisibles: [],
    champsDouteux: [],
    ...patch,
  }
}

/** Bonne friandise : poulet séché seul, énergie par pièce. */
const GOOD = treat({
  produit: 'Filets de poulet séchés',
  ingredients: [{ nom: 'Filet de poulet', pourcentage: 100 }],
  energie: { kcalKg: 3600, kcal100g: null, kcalPiece: null, poidsPieceG: 5 },
})

/** Mauvaise friandise : céréale en tête, sucre, colorant, glycérine, sous-produits, sel. */
const BAD = treat({
  produit: 'Bouchées tendres goût bœuf',
  ingredients: [
    { nom: 'Céréales', pourcentage: null },
    { nom: 'Viandes et sous-produits animaux', pourcentage: 4 },
    { nom: 'Sucres', pourcentage: null },
    { nom: 'Glycérine', pourcentage: null },
    { nom: 'Huiles et graisses', pourcentage: null },
    { nom: 'Sel', pourcentage: null },
    { nom: 'Substances minérales', pourcentage: null },
    { nom: 'Extraits de protéines végétales', pourcentage: null },
  ],
  additifs: ['Colorants', 'Conservateurs', 'Antioxygènes'],
})

const pts = (r: ReturnType<typeof scoreTreat>, id: string) => r.criteria.find((c) => c.id === id)?.points

test('aiguillage : friandise → barème friandise, croquette → barème principal', () => {
  assert.equal(productKind(GOOD), 'treat')
  assert.equal(productKind({ typeImage: 'aliment-chien' }), 'complete')
  assert.equal(analyseLabel(GOOD).kind, 'treat')
  assert.equal(analyseLabel(GOOD).version, TREAT_SCORE_VERSION)
  assert.equal(scoreVersionFor(GOOD), TREAT_SCORE_VERSION)
  assert.equal(scoreVersionFor({ typeImage: 'aliment-chien' }), SCORE_VERSION)
})

test('bonne friandise (poulet seul) : 94 sans analyse affichée, 100 avec, 9 critères, total 100 points', () => {
  const r = scoreTreat(GOOD)
  assert.equal(r.criteria.length, 9)
  assert.equal(r.criteria.reduce((s, c) => s + c.max, 0), 100)
  assert.equal(r.score, 94)
  const full = scoreTreat({ ...GOOD, constituants: { ...GOOD.constituants, proteines: 60, matieresGrasses: 8, cendres: 6, cellulose: 1, humidite: 15 } })
  assert.equal(full.score, 100)
  assert.equal(r.band, 'tres-bon')
  assert.equal(r.dryMatter, null)
  assert.deepEqual(r.treat?.alerts, [])
})

test('mauvaise friandise (sucre, colorant, glycérine, sel, céréale en tête) : note faible', () => {
  const r = scoreTreat(BAD)
  assert.equal(pts(r, 'friandise-premier-ingredient'), 0)
  assert.equal(pts(r, 'friandise-part-animale'), 3, '4 % déclarés : tranche 4-14')
  assert.equal(pts(r, 'friandise-sucres'), 0)
  assert.equal(pts(r, 'friandise-additifs'), 0, 'colorant + conservateur sans nom : deux défauts')
  assert.equal(pts(r, 'friandise-sel'), 0)
  assert.equal(pts(r, 'friandise-liste'), 4, '8 ingrédients')
  assert.equal(pts(r, 'friandise-glycerine'), 0, 'glycérine + sous-produits')
  assert.equal(pts(r, 'friandise-cereales'), 0)
  assert.equal(r.score, 7)
  assert.equal(r.band, 'faible')
})

test('critère additifs : 13 sans défaut, 6 avec un, 0 avec deux ou plus', () => {
  const one = scoreTreat(treat({ ingredients: [{ nom: 'Canard', pourcentage: null }], additifs: ['Colorants'] }))
  assert.equal(pts(one, 'friandise-additifs'), 6)
  const two = scoreTreat(treat({ ingredients: [{ nom: 'Canard', pourcentage: null }], additifs: ['Colorants', 'Arômes artificiels'] }))
  assert.equal(pts(two, 'friandise-additifs'), 0)
  const bha = scoreTreat(treat({ ingredients: [{ nom: 'Canard', pourcentage: null }], additifs: ['BHA'] }))
  assert.equal(pts(bha, 'friandise-additifs'), 6, 'BHA compte comme un défaut de conservateur')
  const named = scoreTreat(treat({ ingredients: [{ nom: 'Canard', pourcentage: null }], additifs: ['Conservateur : sorbate de potassium'] }))
  assert.equal(pts(named, 'friandise-additifs'), 13, 'conservateur nommé : pas de défaut')
})

test('part animale progressive et liste courte', () => {
  assert.deepEqual([0.5, 4, 14, 30, 50, 70, 100].map(meatSharePoints), [1, 3, 6, 9, 12, 15, 15])
  assert.deepEqual([1, 5, 6, 7, 9, 10, 20].map(shortListPoints), [10, 10, 8, 6, 2, 0, 0])
  const none = scoreTreat(treat({ ingredients: [{ nom: 'Poulet', pourcentage: null }, { nom: 'Riz', pourcentage: null }] }))
  assert.equal(pts(none, 'friandise-part-animale'), 0, 'rien d\'écrit : 0')
  const announced = scoreTreat(treat({ ingredients: [{ nom: 'Agneau', pourcentage: null }, { nom: 'Pois', pourcentage: null }], partAnimaleDeclaree: 60 }))
  assert.equal(pts(announced, 'friandise-part-animale'), 12, 'part annoncée sur l\'emballage')
})

test('premier ingrédient, glycérine et farine', () => {
  const unnamed = scoreTreat(treat({ ingredients: [{ nom: 'Viande déshydratée', pourcentage: 40 }, { nom: 'Farine de blé', pourcentage: null }] }))
  assert.equal(pts(unnamed, 'friandise-premier-ingredient'), 9)
  assert.equal(pts(unnamed, 'friandise-glycerine'), 4, 'un ingrédient animal sans espèce')
  const flour = scoreTreat(treat({ ingredients: [{ nom: 'Farine de riz', pourcentage: null }, { nom: 'Saumon', pourcentage: 20 }] }))
  assert.equal(pts(flour, 'friandise-cereales'), 0)
  const fishMeal = scoreTreat(treat({ ingredients: [{ nom: 'Farine de poisson', pourcentage: null }] }))
  assert.equal(pts(fishMeal, 'friandise-cereales'), 4, 'farine de poisson : animale, pas une céréale')
  const glyc = scoreTreat(treat({ ingredients: [{ nom: 'Poulet', pourcentage: 60 }, { nom: 'Glycérine', pourcentage: null }, { nom: 'Sous-produits animaux', pourcentage: null }] }))
  assert.equal(pts(glyc, 'friandise-glycerine'), 0, 'glycérine + sous-produits : deux défauts')
})

test('sel : « sel » et « chlorure de sodium » oui, « sels minéraux » non', () => {
  assert.equal(hasSalt('Sel'), true)
  assert.equal(hasSalt('chlorure de sodium'), true)
  assert.equal(hasSalt('Sels minéraux'), false)
  assert.equal(hasSalt('Sel de mer'), true)
})

test('conservateur sans nom', () => {
  assert.equal(unnamedPreservative('Conservateurs'), true)
  assert.equal(unnamedPreservative('Antioxygènes autorisés CE'), true)
  assert.equal(unnamedPreservative('Conservateur : sorbate de potassium (E202)'), false)
  assert.equal(unnamedPreservative('Antioxygènes : extraits riches en tocophérols'), false)
  assert.equal(unnamedPreservative('Filet de poulet'), false)
})

test('alertes de sécurité', () => {
  const ids = (t: string[]) => treatAlerts(t).map((a) => a.id)
  assert.deepEqual(ids(['Farine de riz', 'Xylitol']), ['xylitol'])
  assert.deepEqual(ids(['E967']), ['xylitol'])
  assert.deepEqual(ids(['Sucre de bouleau']), ['xylitol'])
  assert.deepEqual(ids(['Raisins secs']), ['raisin'])
  assert.deepEqual(ids(['Extrait de pépins de raisin']), [], 'pépins de raisin : pas le fruit')
  assert.deepEqual(ids(['Poudre de cacao']), ['chocolat'])
  assert.deepEqual(ids(['Ail en poudre']), ['oignon-ail'])
  assert.deepEqual(ids(['Volaille', 'Oignon']), ['oignon-ail'], '« volaille » ne déclenche pas « ail »')
  assert.deepEqual(ids(['Peau de buffle']), ['rawhide'])
  assert.deepEqual(ids(['Os de jambon fumé']), ['os-cuits'])
  assert.deepEqual(ids(['Poulet', 'Patate douce']), [])
  const r = scoreTreat(treat({ ingredients: [{ nom: 'Peau de buffle', pourcentage: null }] }))
  assert.equal(r.treat?.alerts[0]?.id, 'rawhide')
  assert.equal(highlights(r).weaknesses[0], 'Peau de buffle ou cuir dans la recette', 'l\'alerte passe en premier point faible')
})

test('nombre par jour : 10 % de l\'apport calorique, gabarits de lib/calculators.ts', () => {
  assert.deepEqual(treatEnergy({ kcalKg: 3600, kcal100g: null, kcalPiece: null, poidsPieceG: 5 }), { kcal100g: 360, kcalPiece: 18 })
  const a = treatAllowance({ kcalKg: 3600, kcal100g: null, kcalPiece: null, poidsPieceG: 5 })
  assert.ok(a)
  assert.deepEqual(a.rows.map((r) => r.weightKg), [5, 15, 32])
  const small = a.rows[0]
  assert.equal(small.dailyKcal, calculateDailyCalories({ animal: 'chien', weightKg: 5, ageGroup: 'adulte', activityLevel: 'normal', sterilized: false }))
  assert.equal(small.capKcal, Math.round(small.dailyKcal * 0.1))
  assert.equal(small.pieces, Math.floor(small.capKcal / 18))
  assert.equal(allowanceText(small), `${small.pieces} friandise${(small.pieces ?? 0) > 1 ? "s" : ""}`)
  // Énergie au poids sans poids de pièce : grammes par jour
  const grams = treatAllowance({ kcalKg: null, kcal100g: 300, kcalPiece: null, poidsPieceG: null })
  assert.equal(grams?.rows[0].pieces, null)
  assert.equal(allowanceText(grams!.rows[0]), `${Math.round((grams!.rows[0].capKcal / 300) * 100)} g`)
  // Pièce très énergétique : moins d'une par jour pour un petit chien
  const big = treatAllowance({ kcalKg: null, kcal100g: null, kcalPiece: 80, poidsPieceG: null })
  assert.equal(allowanceText(big!.rows[0]), 'moins d\'une friandise')
  // Rien d'écrit : pas de chiffre
  assert.equal(treatAllowance(null), null)
  assert.equal(scoreTreat(BAD).treat?.allowance, null)
})

test('sans composition : pas de note ; friandise pour chat : pas de note', () => {
  const r = scoreTreat(treat({}))
  assert.equal(r.score, null)
  assert.deepEqual(r.missing, ['liste des ingrédients'])
  assert.ok(r.criteria.every((c) => c.points === null))
  assert.equal(scoreTreat({ ...GOOD, espece: 'chat' }).score, null)
})

test('tri des lectures : friandise notée sur la composition seule, chat refusé', () => {
  assert.equal(classifyExtraction(GOOD).kind, 'complete', 'constituants absents : pas demandés pour une friandise')
  const missing = classifyExtraction(treat({}))
  assert.equal(missing.kind, 'incomplete')
  assert.deepEqual(missing.kind === 'incomplete' && missing.missing, ['ingredients'])
  assert.deepEqual(classifyExtraction({ ...GOOD, espece: 'chat' }), { kind: 'reject', code: 'cat_food' })
})

test('lecture : énergie absente des anciennes analyses, bornes respectées', () => {
  const raw = { ...GOOD, energie: undefined }
  assert.equal(parseExtractedLabel(raw).energie ?? null, null)
  const parsed = parseExtractedLabel({ ...GOOD, energie: { kcalKg: 3600, kcal100g: -2, kcalPiece: 'x', poidsPieceG: 12 } })
  assert.deepEqual(parsed.energie, { kcalKg: 3600, kcal100g: null, kcalPiece: null, poidsPieceG: 12 })
})

test('Open Pet Food Facts : friandise reconnue et notée, friandise pour chat écartée', () => {
  assert.equal(opffImageType(['en:dog-food', 'en:dog-treats']), 'friandise')
  assert.equal(opffImageType(['en:pet-food', 'en:complementary-dog-food']), 'friandise')
  assert.equal(opffImageType(['en:snacks-pour-chiens']), 'friandise')
  assert.equal(opffImageType(['en:cat-treats']), 'aliment-chat')
  const v = opffToLabel(
    { product_name: 'Bâtonnets au canard', brands: 'Brindille', ingredients_text_fr: 'Canard 80 %, fécule de pomme de terre, glycérine', nutriments: { 'energy-kcal_100g': 320 }, categories_tags: ['en:dog-treats'] },
    '3760000000123',
  )
  assert.equal(v.kind, 'complete')
  if (v.kind !== 'complete') return
  assert.equal(v.label.typeImage, 'friandise')
  assert.equal(v.label.energie?.kcal100g, 320)
  const r = analyseLabel(v.label)
  assert.equal(r.kind, 'treat')
  assert.equal(pts(r, 'friandise-part-animale'), 15, '80 % déclarés')
})

test('fiche : titre « Friandise … », pas d\'alternative partenaire, onglet du classement', () => {
  assert.match(ficheTitle('Brindille', 'Friandises bâtonnets canard', 42, 'treat'), /^Friandise Brindille bâtonnets canard : avis et note 42\/100$/)
  assert.deepEqual(alternativesFor('Brindille', 20, 'treat'), [])
  assert.equal(parseKind('friandises'), 'treat')
  assert.equal(parseKind(undefined), 'complete')
  assert.match(verdictText(scoreTreat(GOOD)), /pour une friandise/)
})

test('parties à mâcher : ni viande nommée au premier ingrédient, ni part de viande', () => {
  // « Peau de bœuf » (os à mâcher en cuir, fiche Open Pet Food Facts) : 100 avant la version 1.1
  const hide = scoreTreat(treat({ ingredients: [{ nom: 'Peau de bœuf', pourcentage: null }] }))
  assert.equal(pts(hide, 'friandise-premier-ingredient'), 4, 'compté comme un sous-produit')
  assert.equal(pts(hide, 'friandise-part-animale'), 0, 'hors de la part de viande')
  assert.match(hide.criteria[1].explanation, /partie à mâcher/)
  assert.equal(hide.treat?.alerts[0]?.id, 'rawhide', 'l\'alerte cuir reste')
  assert.ok(hide.score !== null && hide.score < 75, `note ${hide.score}`)
  const pctHide = scoreTreat(treat({ ingredients: [{ nom: '100% peau de bœuf séchée', pourcentage: 100 }], partAnimaleDeclaree: 100 }))
  assert.equal(pts(pctHide, 'friandise-part-animale'), 0, '« 100 % » de peau ne fait pas 100 % de viande')
  for (const nom of ['Oreilles de porc séchées', 'Sabots de veau séchés', 'Cornes de buffle', 'Tendons de bœuf', 'Nerfs de bœuf', 'Bull pizzle', 'Os à moelle de bœuf', 'Morceaux de peau de tête de bœuf séchés', 'Bois de cerf', 'Beef hide'])
    assert.equal(pts(scoreTreat(treat({ ingredients: [{ nom, pourcentage: null }] })), 'friandise-premier-ingredient'), 4, nom)
  // Vraie viande seule : très bien notée ; « poulet (avec os) » reste de la viande
  assert.equal(scoreTreat(treat({ ingredients: [{ nom: '100 % poulet séché', pourcentage: 100 }] })).score, 90)
  assert.equal(pts(scoreTreat(treat({ ingredients: [{ nom: 'Trachée de bœuf séchée', pourcentage: null }] })), 'friandise-premier-ingredient'), 12)
  assert.equal(pts(scoreTreat(treat({ ingredients: [{ nom: 'Trachée de bœuf séchée', pourcentage: null }] })), 'friandise-part-animale'), 8)
  assert.equal(pts(scoreTreat(treat({ ingredients: [{ nom: '100% getrocknete Rinderhaut', pourcentage: 100 }] })), 'friandise-premier-ingredient'), 4, 'peau de bœuf en allemand')
  assert.equal(pts(scoreTreat(treat({ ingredients: [{ nom: 'Cous de poulet (avec os)', pourcentage: null }] })), 'friandise-premier-ingredient'), 12)
  // Mélange : seule la viande compte dans la part
  const mix = scoreTreat(treat({ ingredients: [{ nom: 'Poulet', pourcentage: 60 }, { nom: 'Peau de bœuf', pourcentage: 40 }] }))
  assert.equal(pts(mix, 'friandise-part-animale'), meatSharePoints(60))
  // Ingrédient générique qui cite une espèce entre parenthèses : sous-produit, plus 100
  const vitakraft = scoreTreat(treat({
    ingredients: [
      { nom: '72% de viande et sous-produits animaux (dont de poulet)', pourcentage: 72 },
      { nom: 'légumes', pourcentage: null },
      { nom: 'levure', pourcentage: null },
    ],
  }))
  assert.equal(pts(vitakraft, 'friandise-premier-ingredient'), 4)
  assert.match(vitakraft.criteria[0].explanation, /celle citée entre parenthèses n'en désigne qu'une partie/)
  assert.ok(vitakraft.score !== null && vitakraft.score < 100)
})
