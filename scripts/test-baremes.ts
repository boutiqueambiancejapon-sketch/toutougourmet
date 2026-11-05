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
import { chiffresIncoherents, differeDeLaFiche } from '../lib/scanner/baremes/controle-lecture'
import { noteHuile } from '../lib/scanner/baremes/huile'
import { MSG_DOS } from '../lib/scanner/baremes/types'
import { labelPrompt, LABEL_INSTRUCTIONS_V2, LABEL_JSON_SCHEMA_V2 } from '../lib/scanner/baremes/lecture-ia'
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
// Rappel foie de morue et limite haute NRC : huiles et compléments, affichés avec la note et le message
const ROUGE_MORUE = /foie de morue.*ne pas cumuler/i
const ROUGE_NRC = /dépasse la limite haute NRC/
const morueHuile = noter(E({ produit: 'Huile de foie de morue', ingredients: I('huile de foie de morue') }), 'huile')
assert.ok(morueHuile.alertes.some((a) => ROUGE_MORUE.test(a)))
assert.equal(morueHuile.message, MSG_CONSEIL)
assert.ok(noter(E({ produit: 'c', ingredients: I('levure', 'huile de foie de morue') }), 'complement').alertes.some((a) => ROUGE_MORUE.test(a)))
assert.equal(noter(E({ produit: 'c', ingredients: I('levure', 'foie de volaille') }), 'complement').alertes.length, 0)
const dose = (ration10kgG: number) => ({ tableauBrut: 'EPA 12 %, DHA 8 %', ration10kgG })
assert.ok(noter(E({ produit: 'Huile de saumon', ingredients: I('huile de saumon'), ...dose(20) }), 'huile').alertes.some((a) => ROUGE_NRC.test(a)))
assert.ok(!noter(E({ produit: 'Huile de saumon', ingredients: I('huile de saumon'), ...dose(5) }), 'huile').alertes.some((a) => ROUGE_NRC.test(a)))
assert.ok(noter(E({ produit: 'c', ingredients: I('levure', 'huile de saumon'), ...dose(20) }), 'complement').alertes.some((a) => ROUGE_NRC.test(a)))
assert.ok(!noter(E({ produit: 'c', ingredients: I('levure', 'huile de saumon'), ...dose(5) }), 'complement').alertes.some((a) => ROUGE_NRC.test(a)))
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
const morueLue = analyseBaremes(L({ typeProduit: 'huile', produit: 'Huile de foie de morue', ingredients: [{ nom: 'huile de foie de morue', pourcentage: null }] }))
assert.ok(morueLue.alertes?.some((a) => ROUGE_MORUE.test(a)))
assert.equal(morueLue.notice, MSG_CONSEIL)
assert.deepEqual(morueLue.criteria, [])
assert.ok(analyseBaremes(L({ typeProduit: 'complement', produit: 'c', ingredients: [{ nom: 'huile de saumon', pourcentage: null }], tableauBrut: 'EPA 12 %, DHA 8 %', ration10kgG: 20 })).alertes?.some((a) => ROUGE_NRC.test(a)))
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
assert.equal(sansAnalyse({ typeProduit: 'huile', typeImage: 'autre' }), 'complete')
assert.equal(sansAnalyse({ typeProduit: 'indetermine', typeImage: 'autre' }), 'reject')
assert.equal(classifyExtraction(L({ typeImage: 'autre', typeProduit: 'huile' })).kind, 'reject')
assert.equal(classifyExtraction(L({ constituants: SANS, typeImage: 'aliment-chien', typeProduit: 'huile' })).kind, 'incomplete')
// ─── Noms étrangers : sécurité ─────────────────────
for (const n of ['Schokolade', 'Schokoladenüberzug', 'chocolate', 'Kakao', 'Rosinen', 'Trauben', 'Weintrauben', 'raisins', 'grapes', 'Xylit', 'xylitol', 'noix de macadamia', 'Macadamianüsse', 'uvas']) assert.ok(securite({ ingredients: I(n), additifs: [] }).zero, n)
for (const n of ['Knoblauch', 'Knoblauchpulver', 'Zwiebel', 'Zwiebeln', 'garlic', 'onion', 'cebolla', 'aglio']) assert.ok(securite({ ingredients: I(n, 'poulet'), additifs: [] }).zero, n)
for (const n of ['Knoblauch', 'Zwiebel', 'garlic', 'onion']) assert.equal(securite({ ingredients: I('a', 'b', 'c', n), additifs: [] }).plafond?.valeur, 45, n)
for (const n of ['Traubenzucker', 'grape sugar', 'ohne Schokolade', 'ohne Xylit', 'sin xilitol', 'Zwieback', 'Kakadu', 'mayonnaise', 'majoran', 'without garlic', 'Rosmarin', 'Lauchhuhn']) {
  const s = securite({ ingredients: I(n), additifs: [] })
  assert.equal(s.zero, null, n)
  assert.equal(s.plafond, null, n)
}
for (const n of ['Traubenkernöl', 'Traubenkernextrakt', 'grape seed oil', 'Schokoladenaroma']) {
  const s = securite({ ingredients: I(n), additifs: [] })
  assert.equal(s.zero, null, n)
  assert.equal(s.plafond?.valeur, 50, n)
}
// Noms étrangers : huiles
for (const n of ['Lachsöl', 'Lachs Öl', 'salmon oil', 'Fischöl', 'fish oil', 'Rotes Lachsöl', 'Dorsch-Lebertranöl', 'Leinöl']) assert.equal(c(n), 'huile', n)
for (const n of ['Lachs Sticks', 'Fischstäbchen']) assert.notEqual(c(n), 'huile', n)
const hNom = (produit: string, ingredient: string) => noteHuile(E({ produit, ingredients: I(ingredient) }))
for (const [p, i] of [['Rotes Lachsöl', '100 % natürliches rotes Lachsöl'], ['Salmon oil', 'salmon oil'], ['Fischöl', 'Fischöl'], ['Fish oil', 'fish oil']]) {
  const r = hNom(p, i)
  assert.ok(!/végétale/.test(r.plafond?.raison ?? ''), p)
  assert.ok((r.criteres.find((x) => x.id === 'source')?.points ?? 0) >= 8, p)
}
assert.match(hNom('Hanföl', '100 % naturreines Hanföl').plafond?.raison ?? '', /végétale/)
assert.match(hNom('Leinöl', 'Leinöl').plafond?.raison ?? '', /végétale/)
assert.equal(hNom('Dorsch-Lebertranöl', '100 % Lebertranöl').criteres.find((x) => x.id === 'source')?.points, 10)
// Prompt : champs obligatoires, section française, toxiques dans toutes les langues ; ancien prompt intact
for (const k of ['tableauBrut', 'mentions', 'teneurs', 'stade', 'gabarit', 'ration10kgG', 'emballage']) assert.ok(LABEL_JSON_SCHEMA_V2.required?.includes(k), k)
assert.ok(LABEL_INSTRUCTIONS_V2.includes('section française'))
assert.ok(!LABEL_INSTRUCTIONS_V2.includes('Garde la langue et l\'orthographe'))
assert.ok(LABEL_INSTRUCTIONS.includes('Garde la langue et l\'orthographe'))
assert.ok(!(LABEL_JSON_SCHEMA.required ?? []).includes('tableauBrut'))
assert.match(entreeDepuisLabel(L({ teneurs: ['EPA 12 %', 'DHA 8 %'] })).tableauBrut ?? '', /EPA 12 %.*DHA 8 %/)
assert.equal(extraireEpaDha(entreeDepuisLabel(L({ teneurs: ['EPA 12 %', 'DHA 8 %'] })).tableauBrut ?? '').epaDhaPct, 20)
// Rapport calcium/phosphore déclaré sans les deux valeurs (cas Elmut)
const CPAT = (p: Partial<Entree>) => noteAliment(E({ ingredients: I('poulet'), constituants: C(28), ...p }))
const crit = (r: ReturnType<typeof noteAliment>) => r.criteres.find((x) => x.id === 'calcium-phosphore')
assert.equal(crit(CPAT({ rapportCaP: { min: 1.1, max: 1.4 } }))?.points, 6)
assert.notEqual(CPAT({ rapportCaP: { min: 1.1, max: 1.4 } }).plafond?.valeur, 90)
assert.equal(crit(CPAT({ rapportCaP: { min: 0.7, max: 0.9 } }))?.points, 0)
assert.equal(crit(CPAT({}))?.points, null)
assert.equal(CPAT({}).plafond?.valeur, 90)
// Les deux valeurs écrites priment sur le rapport déclaré
assert.equal(crit(CPAT({ constituants: { ...C(28), calcium: 1, phosphore: 0.8 }, rapportCaP: { min: 3, max: 4 } }))?.points, 6)
// Pas de calcium pour les alertes chiot : l'alerte « non lu » reste, aucun plafond calcium
const chiotDeclare = CPAT({ produit: 'Chiot grande race', constituants: C(30), rapportCaP: { min: 1.1, max: 1.4 } })
assert.ok(chiotDeclare.alertes.some((a) => /calcium non lu/.test(a)))
assert.notEqual(chiotDeclare.plafond?.valeur, 59)
assert.equal(crit(CPAT({ produit: 'Chiot grande race', constituants: C(30), rapportCaP: { min: 1.5, max: 1.9 } }))?.points, 0)
assert.equal(entreeDepuisLabel(L({ rapportCaP: { min: 1.1, max: 1.4 } })).rapportCaP?.max, 1.4)
assert.ok(!Object.keys(parseExtractedLabel({})).includes('rapportCaP'))
assert.ok(LABEL_JSON_SCHEMA_V2.required?.includes('rapportCaP'))
// Teneurs écrites comme sur les étiquettes du test du 2026-11-05 (bug trouvé par les lectures)
assert.equal(ex('Eicosapentaenoic acid (EPA) 10% 320 mg, Docosahexaenoic acid (DHA) 7% 215 mg').epaDhaPct, 17)
assert.ok(ex('Eicosapentaenoic Acid (EPA) (min.) 8% Docosahexaenoic Acid (DHA) (min.) 8%').separe)
assert.equal(ex('Eicosapentaenoic Acid (EPA) (min.) 8% Docosahexaenoic Acid (DHA) (min.) 8%').epaDhaPct, 16)
assert.equal(ex('Acide eicosapentaénoïque (EPA) 3 %, acide docosahexaénoïque (DHA) 2 %').epaDhaPct, 5)
assert.equal(ex('Riche en acides gras (EPA) et (DHA)').epaDhaPct, null)
assert.equal(ex('Total Omega-3 Fatty Acids (min.) 20%').epaDhaPct, null)
assert.equal(noter(E({ produit: 'Salmon oil', ingredients: I('Salmon oil'), tableauBrut: 'Eicosapentaenoic Acid (EPA) (min.) 8% Docosahexaenoic Acid (DHA) (min.) 8%' }), 'huile').criteres.find((x) => x.id === 'epa-dha')?.points, 30)
// Garde-fou sur le petit texte
const CH = (p: Partial<ExtractedLabel['constituants']>) => ({ ...SANS, ...p })
assert.ok(chiffresIncoherents({ typeProduit: 'aliment', typeAliment: 'sec', constituants: CH({ proteines: 60, matieresGrasses: 30, cendres: 8, cellulose: 3, humidite: 10 }) }))
assert.ok(chiffresIncoherents({ typeProduit: 'complement', typeAliment: 'autre', constituants: CH({ proteines: 90, cendres: 20 }) }))
assert.ok(chiffresIncoherents({ typeProduit: 'aliment', typeAliment: 'sec', constituants: CH({ cellulose: 30 }) }))
assert.ok(chiffresIncoherents({ typeProduit: 'aliment', typeAliment: 'humide', constituants: CH({ proteines: 30 }) }))
assert.ok(chiffresIncoherents({ typeProduit: 'huile', typeAliment: 'autre', constituants: CH({ matieresGrasses: 40 }) }))
assert.equal(chiffresIncoherents({ typeProduit: 'aliment', typeAliment: 'sec', constituants: CH({ proteines: 27, matieresGrasses: 17, cendres: 7.8, cellulose: 1.8 }) }), null)
assert.equal(chiffresIncoherents({ typeProduit: 'aliment', typeAliment: 'humide', constituants: CH({ proteines: 9.8, matieresGrasses: 6.9, cendres: 1.7, cellulose: 0.4, humidite: 78 }) }), null)
assert.equal(chiffresIncoherents({ typeProduit: 'huile', typeAliment: 'autre', constituants: CH({ matieresGrasses: 99.9 }) }), null)
assert.equal(chiffresIncoherents({ typeProduit: 'complement', typeAliment: 'autre', constituants: CH({ proteines: 55, matieresGrasses: 6 }) }), null)
assert.ok(differeDeLaFiche(CH({ proteines: 18.5 }), CH({ proteines: 55 })))
assert.equal(differeDeLaFiche(CH({ cendres: 8.2 }), CH({ cendres: 7.9 })), null)
assert.equal(differeDeLaFiche(CH({ proteines: 3.7 }), CH({ proteines: 4 })), null)
assert.equal(differeDeLaFiche(CH({ proteines: 27 }), SANS), null)
assert.deepEqual(classifyExtraction(L({ typeProduit: 'aliment', typeAliment: 'sec', constituants: CH({ cellulose: 30, proteines: 20 }) }), true), { kind: 'reject', code: 'recheck' })
assert.equal(classifyExtraction(L({ constituants: CH({ cellulose: 30, proteines: 20 }) })).kind, 'complete')
// Devant du paquet seul : on demande le dos, pas de note
const devant = L({ ingredients: [], constituants: SANS, additifs: [], typeProduit: 'friandise', lisibilite: 'floue', produit: 'Snack', champsDouteux: [] })
assert.deepEqual(classifyExtraction(devant, true).kind, 'incomplete')
assert.equal(classifyExtraction(devant, false).kind, 'reject')
for (const t of ['aliment', 'friandise', 'complement', 'huile'] as const) {
  const r = analyseBaremes(L({ ingredients: [], typeProduit: t, produit: 'Recette' }))
  assert.equal(r.score, null, t)
  assert.equal(r.notice, MSG_DOS, t)
}
assert.equal(classifyExtraction(L({ ingredients: [], constituants: SANS, typeProduit: 'aliment', alimentVeterinaire: true }), true).kind, 'complete')
console.log('tests : tout passe')
