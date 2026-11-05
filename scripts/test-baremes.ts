// Tests des quatre barèmes (lib/scanner/baremes) : npx tsx scripts/test-baremes.ts
import assert from 'node:assert/strict'
import { noteAliment } from '../lib/scanner/baremes/aliment'
import { classer, stadeDe } from '../lib/scanner/baremes/classer'
import { noteFriandise } from '../lib/scanner/baremes/friandise'
import { matiereSeche } from '../lib/scanner/baremes/matiere-seche'
import { classementDe, noter } from '../lib/scanner/baremes/noter'
import { securite } from '../lib/scanner/baremes/securite'
import { extraireEpaDha } from '../lib/scanner/baremes/teneur'
import { MSG_CONSEIL, type Entree } from '../lib/scanner/baremes/types'
import { estVeterinaire } from '../lib/scanner/baremes/veterinaire'
import { BAREMES_ACTIFS } from '../lib/scanner/baremes/config'
import { labelPrompt, LABEL_JSON_SCHEMA_V2 } from '../lib/scanner/baremes/lecture-ia'
import { analyseBaremes, entreeDepuisLabel, typeDepuisLabel } from '../lib/scanner/baremes/vers-score'
import { analyseLabel, scoreVersionFor } from '../lib/scanner/analyse'
import { PREMIUM_LABEL, SUPERMARKET_LABEL } from '../lib/scanner/fixtures'
import { LABEL_INSTRUCTIONS, LABEL_JSON_SCHEMA } from '../lib/scanner/label-schema'
import { classifyExtraction } from '../lib/scanner/outcome'
import { scoreLabel, SCORE_VERSION } from '../lib/scanner/score'
import { parseExtractedLabel, type ExtractedLabel } from '../lib/scanner/types'
const vide = { proteines: null, matieresGrasses: null, cendres: null, cellulose: null, humidite: null, calcium: null, phosphore: null }
const I = (...n: string[]) => n.map((nom) => ({ nom, pourcentage: null as number | null }))
const E = (p: Partial<Entree>): Entree => ({ marque: 'x', produit: 'y adulte', ingredients: [], additifs: [], constituants: vide, ...p })
// Sécurité
assert.equal(securite({ ingredients: I('poulet', 'arôme sans chocolat'), additifs: [] }).zero, null)
assert.equal(securite({ ingredients: I('poulet', 'extrait de raisin'), additifs: [] }).zero, null)
assert.ok(securite({ ingredients: I('poulet', 'extrait de raisin'), additifs: [] }).alertes.length)
assert.equal(securite({ ingredients: I('poulet', 'huile de pépins de raisin'), additifs: [] }).zero, null)
assert.equal(securite({ ingredients: I('poulet', 'sans xylitol'), additifs: [] }).zero, null)
assert.ok(securite({ ingredients: I('poulet', 'riz', 'carotte', 'xylitol'), additifs: [] }).zero)
assert.ok(securite({ ingredients: I('poulet', 'noix de macadamia'), additifs: [] }).zero)
assert.ok(securite({ ingredients: I('poulet', 'cacao'), additifs: [] }).zero)
assert.ok(securite({ ingredients: I('oignon', 'poulet'), additifs: [] }).zero)
assert.equal(securite({ ingredients: I('poulet', 'riz', 'carotte', 'pois', 'ail des ours'), additifs: [] }).zero, null)
assert.equal(securite({ ingredients: I('poulet', 'riz', 'carotte', 'pois', 'ail des ours'), additifs: [] }).plafond?.valeur, 45)
assert.ok(securite({ ingredients: [{ nom: 'poulet', pourcentage: null }, { nom: 'riz', pourcentage: null }, { nom: 'carotte', pourcentage: null }, { nom: 'ail', pourcentage: 6 }], additifs: [] }).zero)
assert.ok(securite({ ingredients: I('poulet', 'houblon'), additifs: [] }).alertes.some((a) => /Houblon.*vétérinaire/.test(a)))
assert.equal(noter(E({ ingredients: I('poulet', 'chocolat') }), 'complement').note, 0)
assert.equal(noter(E({ ingredients: I('huile de saumon', 'xylitol') }), 'huile').note, 0)
assert.ok(securite({ ingredients: [{ nom: 'Enrobage de chocolat noir [sucre, pâte de cacao, arômes]', pourcentage: 39 }], additifs: [] }).zero)
assert.ok(securite({ ingredients: I('Cobertura de chocolate negro [azúcar, aromas]'), additifs: [] }).zero)
assert.equal(securite({ ingredients: [...I('a', 'b', 'c'), { nom: 'ail des ours séché', pourcentage: 1 }], additifs: [] }).zero, null)
assert.equal(securite({ ingredients: I('poulet', 'arôme de chocolat'), additifs: [] }).zero, null)
// Vétérinaire
for (const n of ['Royal Canin Renal', 'Hill\'s k/d', 'Hill\'s Prescription Diet', 'Veterinary Urinary', 'Hepatic HF 16', 'Glycobalance', 'croquettes diabetic']) assert.ok(estVeterinaire({ marque: '', produit: n }), n)
for (const n of ['Empreintes poulet céréales', 'friandise au foie', 'Adulte Maxi']) assert.ok(!estVeterinaire({ marque: '', produit: n }), n)
assert.ok(estVeterinaire({ marque: '', produit: 'x', alimentVeterinaire: true }))
assert.equal(noter(E({ produit: 'Renal' }), 'aliment').note, null)
assert.equal(noter(E({ produit: 'Renal' }), 'aliment').message, 'Aliment vétérinaire ou lié à une maladie : pas de note, à juger avec ton vétérinaire.')
// Extracteur
const ex = extraireEpaDha
assert.equal(ex('EPA 12 %, DHA 8 %').epaDhaPct, 20)
assert.ok(ex('EPA 12 %, DHA 8 %').separe)
assert.equal(ex('EPA+DHA : 3 %').epaDhaPct, 3)
assert.equal(ex('EPA et DHA 1 200 mg/g').epaDhaPct, null) // 120 % : rejeté
assert.equal(ex('EPA et DHA 1 200 mg/100 g').epaDhaPct, 1.2)
assert.equal(ex('EPA 180 mg/g, DHA 120 mg/g').epaDhaPct, 30)
assert.ok(Math.abs((ex('EPA + DHA 276 mg/ml').epaDhaPct ?? 0) - 30) < 0.01)
assert.equal(ex('30 % d’oméga‑3 (EPA/DHA)').epaDhaPct, 30)
assert.equal(ex('acide eicosapentaénoïque 0,37 %').epaDhaPct, 0.37)
assert.ok(ex('acide eicosapentaénoïque 0,37 %').partiel)
assert.equal(ex('17,4 % d’acides gras oméga-3').epaDhaPct, null)
assert.equal(ex('17,4 % d’acides gras oméga-3').omega3Pct, 17.4)
assert.equal(ex('250 mg d\'EPA et de DHA par comprimé').mgParPiece, 250)
assert.equal(ex('250 mg d\'EPA et de DHA par comprimé').epaDhaPct, null)
assert.equal(ex('sans chiffre, epargne, dhaka').epaDhaPct, null)
// Refus
const c = (produit: string) => classer({ marque: '', produit, ingredients: [], constituants: vide })
for (const n of ['Huile de coupe', 'Huile de massage pour chien', 'Lubrifiant', "Moser Huile spéciale d'entretien des kits de coupe"]) assert.equal(c(n), 'autre', n)
assert.equal(c('Fit & Trim'), 'indetermine')
assert.equal(c('Huile de cameline'), 'huile')
assert.equal(c('Cod liver oil'), 'huile')
// Données absentes
assert.equal(noter(E({}), 'complement').note, null)
assert.equal(noter(E({}), 'huile').note, null)
const fri = noter(E({ ingredients: I('poulet') }), 'friandise')
assert.ok((fri.note ?? 0) <= 80 && fri.horsClassement)
const alimentSansAnalyse = noteAliment(E({ ingredients: I('poulet frais', 'patate douce', 'pois', 'graisse de poulet', 'carotte', 'levure') }))
assert.ok((alimentSansAnalyse.note ?? 100) <= 70, String(alimentSansAnalyse.note))
// Plafond FEDIAF et eau
const C = (p: number, h: number | null = 10) => ({ ...vide, proteines: p, matieresGrasses: 12, cendres: 7, cellulose: 3, humidite: h })
const r19 = noteAliment(E({ produit: 'Light adulte', ingredients: I('poulet'), constituants: C(17.2) }))
assert.ok(!r19.plafond || r19.plafond.valeur !== 49, 'entre 18 et 21 : pas de plafond 49')
assert.ok(!r19.criteres[0].explication.includes('sous le minimum'))
const r15 = noteAliment(E({ ingredients: I('poulet'), constituants: C(14) }))
assert.equal(r15.plafond?.valeur, 49)
assert.equal(matiereSeche(E({ typeAliment: 'inconnu', constituants: { ...vide, proteines: 10, matieresGrasses: 6, cendres: 2, cellulose: 1 } })).h, null)
assert.equal(matiereSeche(E({ typeAliment: 'sec', constituants: { ...vide, proteines: 28, matieresGrasses: 15, cendres: 7, cellulose: 3 } })).h, 10)
// Senior
for (const n of ['Adult 7+ Medium', 'Mini Adult 8+', 'Maxi 5+', 'Ageing 12+']) assert.equal(stadeDe(n), 'senior', n)
assert.equal(stadeDe('Mini Adulte 4 kg'), 'adulte')
assert.equal(stadeDe('Pack 2+1'), 'adulte')
// Chiot
const chiot = (p: Partial<Entree['constituants']>, produit = 'Chiot grande race') => noteAliment(E({ produit, ingredients: I('poulet'), constituants: { ...C(30), ...p } }))
assert.ok(chiot({ calcium: 1.7 }).alertes.some((a) => /calcium/i.test(a)))
assert.equal(chiot({ calcium: 1.7 }).plafond?.valeur, 59)
assert.ok(chiot({}).alertes.some((a) => /non lu/.test(a)))
assert.ok(chiot({ calcium: 1.75 }, 'Chiot mini').alertes.some((a) => /calcium/i.test(a)))
assert.equal(chiot({ calcium: 1.3 }, 'Chiot mini').alertes.length, 0)
// ─── Second contrôle, un test par point ─────────────────────
// 1
for (const n of ['Poulet, enrobage (sucre, arômes, chocolat noir), riz', 'biscuit sans gluten au chocolat', 'xylitol (extrait de bouleau)', 'arômes, xylitol', 'xylit', 'xilitol', 'E-967']) assert.ok(securite({ ingredients: I(n), additifs: [] }).zero, n)
assert.ok(securite({ ingredients: I('poulet'), additifs: ['arômes, xylitol'] }).zero)
assert.equal(securite({ ingredients: I('sucre de raisin'), additifs: [] }).zero, null)
assert.equal(securite({ ingredients: I('sucre de raisin'), additifs: [] }).alertes.length, 0)
assert.equal(securite({ ingredients: I('grape seed extract'), additifs: [] }).zero, null)
assert.equal(securite({ ingredients: I('poulet sans ajout de chocolat'), additifs: [] }).zero, null)
// 5
assert.equal(ex('Riche en EPA et DHA, 100 % naturel').epaDhaPct, null)
assert.equal(ex('Riche en oméga-3, 100 % naturel').omega3Pct, null)
assert.equal(ex('EPA, DHA : 30 %').epaDhaPct, 30)
assert.equal(ex('18 % d\'EPA et 12 % de DHA').epaDhaPct, 30)
assert.equal(ex('3 g/100 g EPA et DHA').epaDhaPct, 3)
assert.equal(ex('EPA + DHA 30 g/kg').epaDhaPct, 3)
assert.ok(Math.abs((ex('EPA et DHA 2760 mg/100 ml').epaDhaPct ?? 0) - 3) < 0.01)
assert.equal(ex('EPA et DHA 300 mg / g').epaDhaPct, 30)
assert.equal(ex('EPA (C20:5) 18 %, DHA (C22:6) 12 %').epaDhaPct, 30)
assert.equal(ex('EPA (C20:5) 18 %').epaDhaPct, 18)
assert.equal(ex('EPA 120 %').epaDhaPct, null)
// 6
for (const n of ['Croquettes rénales', 'Soutien rénal', 'Soin hépatique', 'Confort urinaire', 'Gastro Intestinal', 'Gastro-intestinal', 'a/d', 'i/d', 'z/d']) assert.ok(estVeterinaire({ marque: '', produit: n }), n)
for (const n of ['Recommandé par les vétérinaires', 'Hypoallergenic adulte', 'poulet 2/d']) assert.ok(!estVeterinaire({ marque: '', produit: n }), n)
// 7
const CM = (produit: string, ca: number) => chiot({ calcium: ca }, produit)
assert.equal(CM('Chiot', 1.5).plafond?.valeur, 59) // 1,67 % sur sec, défaut 1,6
assert.notEqual(CM('Chiot Mini', 1.5).plafond?.valeur, 59)
assert.notEqual(CM('Puppy Small', 1.5).plafond?.valeur, 59)
assert.equal(CM('Chiot Moyen et Grand', 1.5).plafond?.valeur, 59)
assert.ok(chiot({}, 'Chiot Moyen et Grand').alertes.some((a) => /non lu/.test(a)))
// 8
const H = (produit: string, ingredients = I('huile')) => noter(E({ produit, ingredients }), 'huile')
assert.ok((H('Huile de cameline').note ?? 100) <= 30); assert.ok((H('Huile de chanvre bio').note ?? 100) <= 30); assert.ok((H('Huile de sésame', I('huile de sésame')).note ?? 100) <= 30)
assert.ok(!/végétale/.test(H('Huile de saumon', I('huile de saumon')).plafond?.raison ?? '')); assert.ok(!/végétale/.test(H('Huile d\'algue', I('huile d\'algue')).plafond?.raison ?? ''))
// 9
const M = (mentions: string) => noter(E({ produit: 'Huile de foie de morue', ingredients: I('huile de foie de morue'), mentions, tableauBrut: 'EPA 8 %, DHA 10 %' }), 'huile')
assert.equal(M('Vitamine A 1000 UI, vitamine D3 100 UI').plafond, null)
assert.equal(M('Riche en vitamine A et vitamine D, 2 cuillères').plafond?.valeur, 60)
assert.equal(M('Vitamine A pour la peau, 5 ml').plafond?.valeur, 60)
// 11
const CO = (p: Partial<Entree>) => noter(E({ produit: 'complément', ingredients: I('levure', 'SF68'), ...p }), 'complement')
assert.equal(CO({ additifs: ['Enterococcus faecium SF68 5 x 10^8 UFC'] }).criteres.find((x) => x.id === 'teneur')?.points, 35)
assert.equal(CO({ additifs: ['SF68 250 mg par comprimé'] }).criteres.find((x) => x.id === 'teneur')?.points, 35)
const dansAdditif = noter(E({ produit: 'c', ingredients: I('avoine'), additifs: ['glucosamine 500 mg'] }), 'complement').note
const dansMentions = noter(E({ produit: 'c', ingredients: I('avoine'), mentions: 'Contient glucosamine 500 mg.' }), 'complement').note
assert.equal(dansAdditif, dansMentions)
assert.equal(noter(E({ produit: 'c', ingredients: I('avoine', 'plante rare') }), 'complement').criteres.find((x) => x.id === 'teneur')?.explication, 'Actif non reconnu.')
assert.equal(noter(E({ produit: 'c', ingredients: [{ nom: 'huile de saumon', pourcentage: 5 }] }), 'complement').criteres.find((x) => x.id === 'teneur')?.points, 0)
// 12
assert.notEqual(c('Croquettes au poulet, coussin de viande'), 'autre')
assert.equal(c('Coussin pour chien'), 'autre')
assert.notEqual(c('Friandises motorisées'), 'autre')
assert.equal(c('Distributeur de croquettes'), 'autre')
for (const n of ['Huile de soin', 'Huile de ricin', 'Huile à la lavande']) assert.equal(c(n), 'autre', n)
// 14
for (const n of ['os de boeuf fumé', 'os cuit', 'os fumés', 'os de veau cuit']) assert.equal(noteFriandise(E({ ingredients: I(n) })).plafond?.valeur, 45, n)
// ─── Décisions du 2026-11-05 ─────────────────────
// Compléments et huiles : la note et le message, rien d'autre
const huile = noter(E({ produit: 'Huile de saumon', ingredients: I('huile de saumon'), tableauBrut: 'EPA 12 %, DHA 8 %' }), 'huile')
assert.equal(huile.message, MSG_CONSEIL)
assert.equal(MSG_CONSEIL, "Attention, ce n'est pas un conseil de vétérinaire")
assert.ok(!('etudes' in huile))
assert.equal(noter(E({ produit: 'Huile de cameline', ingredients: I('huile de cameline') }), 'huile').message, MSG_CONSEIL)
assert.equal(noter(E({ produit: 'Huile de foie de morue', ingredients: I('huile de foie de morue') }), 'huile').alertes.length, 0)
const comp = noter(E({ produit: 'c', ingredients: I('glucosamine') }), 'complement')
assert.equal(comp.message, MSG_CONSEIL)
assert.ok(noter(E({ ingredients: I('poulet', 'chocolat') }), 'huile').message?.endsWith(MSG_CONSEIL))
// Maladie grave lue par l'IA, tous types : pas de note
for (const t of ['aliment', 'friandise', 'complement', 'huile'] as const) {
  const r = noter(E({ ingredients: I('poulet'), alimentVeterinaire: true }), t)
  assert.equal(r.note, null)
  assert.match(r.message ?? '', /à juger avec ton vétérinaire/)
}
// Stade et gabarit lus par l'IA : priment sur le nom
assert.equal(noteAliment(E({ produit: 'Recette', stade: 'chiot', gabarit: 'grand', ingredients: I('poulet'), constituants: { ...C(30), calcium: 1.7 } })).plafond?.valeur, 59)
assert.ok(noteAliment(E({ produit: 'Recette', stade: 'chiot', gabarit: 'grand', ingredients: I('poulet'), constituants: C(30) })).alertes.some((a) => /non lu/.test(a)))
assert.notEqual(noteAliment(E({ produit: 'Recette', stade: 'chiot', gabarit: 'petit', ingredients: I('poulet'), constituants: { ...C(30), calcium: 1.5 } })).plafond?.valeur, 59)
// Classements séparés
const secEntree = E({ typeAliment: 'sec', ingredients: I('poulet'), constituants: { ...C(28), cendres: 7, calcium: 1, phosphore: 0.8 } })
const humEntree = E({ typeAliment: 'humide', ingredients: I('poulet'), constituants: { ...C(10, 78), matieresGrasses: 6, cendres: 2, cellulose: 1, calcium: 0.3, phosphore: 0.2 } })
assert.equal(classementDe(secEntree, noteAliment(secEntree)), 'sec')
assert.equal(classementDe(humEntree, noteAliment(humEntree)), 'humide')
assert.equal(classementDe(E({ ingredients: I('huile de saumon') }), huile), null)
// ─── Interrupteur : une fusion ne change aucune note en ligne ─────────────────────
assert.equal(BAREMES_ACTIFS, false)
for (const l of [PREMIUM_LABEL, SUPERMARKET_LABEL]) {
  assert.deepEqual(analyseLabel(l), scoreLabel(l))
  assert.equal(scoreVersionFor(l), SCORE_VERSION)
}
assert.equal(labelPrompt().system, LABEL_INSTRUCTIONS)
assert.equal(labelPrompt().schema, LABEL_JSON_SCHEMA)
assert.ok(!('typeProduit' in (LABEL_JSON_SCHEMA.properties ?? {})))
assert.ok(!Object.keys(parseExtractedLabel({})).includes('typeProduit'))
assert.deepEqual(JSON.parse(JSON.stringify(parseExtractedLabel({ ...PREMIUM_LABEL }))), JSON.parse(JSON.stringify(PREMIUM_LABEL)))
assert.ok(LABEL_JSON_SCHEMA_V2.required?.includes('typeProduit'))
// ─── Lecture IA vers barème ─────────────────────
const L = (p: Partial<ExtractedLabel>): ExtractedLabel => parseExtractedLabel({ ...PREMIUM_LABEL, ...p })
const lue = L({ typeProduit: 'huile', mentions: 'x'.repeat(900), produit: 'Huile', ingredients: [{ nom: 'huile de saumon', pourcentage: null }], tableauBrut: 'EPA 12 %, DHA 8 %', stade: null, gabarit: null })
assert.equal(lue.mentions?.length, 500)
assert.equal(typeDepuisLabel(lue), 'huile')
assert.equal(entreeDepuisLabel(lue).tableauBrut, 'EPA 12 %, DHA 8 %')
const simple = analyseBaremes(lue)
assert.ok(simple.score !== null && simple.bareme?.simple)
assert.equal(simple.notice, MSG_CONSEIL)
assert.equal(simple.band, null)
assert.deepEqual([simple.criteria, simple.missing, simple.assumptions], [[], [], []])
assert.equal(analyseBaremes(L({ typeProduit: 'aliment', alimentVeterinaire: true })).score, null)
assert.match(analyseBaremes(L({ typeProduit: 'aliment', alimentVeterinaire: true })).notice ?? '', /à juger avec ton vétérinaire/)
assert.equal(analyseBaremes(L({ typeProduit: 'indetermine' })).score, null)
assert.equal(analyseBaremes(L({ typeProduit: 'aliment', espece: 'chat' })).score, null)
const al = analyseBaremes(L({ typeProduit: 'aliment' }))
assert.ok(al.score !== null && al.band !== null && al.criteria.length > 0 && !al.bareme?.simple)
assert.equal(new Set(al.criteria.map((x) => x.id)).size, al.criteria.length)
// Fiche sans champ IA : rayon d'origine, sauf nom clair de complément ou d'huile
assert.equal(typeDepuisLabel(L({ typeImage: 'aliment-chien', produit: 'Recette' })), 'aliment')
assert.equal(typeDepuisLabel(L({ typeImage: 'friandise', produit: 'Recette' })), 'friandise')
assert.equal(typeDepuisLabel(L({ typeImage: 'friandise', produit: 'Comprimés articulations' })), 'complement')
// Lecture : l'analyse n'est demandée qu'à un aliment
const SANS = { proteines: null, matieresGrasses: null, cellulose: null, cendres: null, humidite: null, calcium: null, phosphore: null }
const sansAnalyse = (p: Partial<ExtractedLabel>) => classifyExtraction(L({ constituants: SANS, typeImage: 'aliment-chien', ...p }), true).kind
assert.equal(sansAnalyse({ typeProduit: 'complement' }), 'complete')
assert.equal(sansAnalyse({ typeProduit: 'huile' }), 'complete')
assert.equal(sansAnalyse({ typeProduit: 'aliment' }), 'incomplete')
assert.equal(sansAnalyse({ typeProduit: 'aliment', alimentVeterinaire: true }), 'complete')
assert.equal(sansAnalyse({ typeProduit: 'autre' }), 'reject')
assert.equal(classifyExtraction(L({ constituants: SANS, typeImage: 'aliment-chien', typeProduit: 'huile' })).kind, 'incomplete')
console.log('tests : tout passe')
