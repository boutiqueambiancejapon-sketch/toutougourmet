import { animalKind, controversialPreservatives, hasColorant, hasSugar, isByProduct, isUnnamedAnimal, normalize } from '../ingredients'
import { hasArtificialFlavor, hasGlycerin, hasSalt, isAnimalPart, isCerealOrFlour, isChewPart, treatAlerts, unnamedPreservative } from '../treat-ingredients'
import { fmt, pasCompte, Plafond, S, total, vide, type Critere, type Entree, type Resultat } from './types'

// @cdc scanner — barème 2 : friandises, sur 100. Tous les points sont des choix éditoriaux.

const MER_10KG = 110 * Math.pow(10, 0.75)
const estimeKcal100g = (e: Entree): number | null => {
  const a = e.constituants
  if (a.proteines === null || a.matieresGrasses === null) return null
  const reste = Math.max(0, 100 - a.proteines - a.matieresGrasses - (a.cendres ?? 5) - (a.cellulose ?? 2) - (a.humidite ?? 12))
  return 3.5 * a.proteines + 8.5 * a.matieresGrasses + 3.5 * reste
}

const OS_RISQUE = /(^|[^a-z])os( de [a-z]+)? (cuits?|fumes?)([^a-z]|$)/

export function noteFriandise(e: Entree): Resultat {
  const ing = e.ingredients
  const textes = [...ing.map((i) => i.nom), ...e.additifs]
  if (ing.length === 0) return vide('friandise', 'La composition manque : pas de note.')
  const vendor = treatAlerts(textes).find((x) => ['rawhide', 'os-cuits'].includes(x.id))
  // treatAlerts ne lit pas la forme « os de bœuf fumé » : elle est lue ici.
  const osLu = [...textes, e.produit ?? ''].some((t) => OS_RISQUE.test(normalize(t)))
  const risque = vendor ?? (osLu ? { label: 'Os cuit ou fumé', text: 'il peut se casser en éclats, à surveiller.' } : undefined)
  const c: Critere[] = []
  const prem = ing[0]
  const viande = (n: string) => (isChewPart(n) ? null : animalKind(n))
  const k = viande(prem.nom)
  c.push({ id: 'premier', libelle: 'Premier ingrédient', max: 25, points: isChewPart(prem.nom) ? 5 : k === 'nommee' && isAnimalPart(prem.nom) ? 15 : k === 'nommee' ? 25 : k === 'non-nommee' ? (isByProduct(prem.nom) ? 5 : 11) : 0, explication: `« ${prem.nom} ».`, source: `${S.REG} ; points : ${S.EDITO}` })
  const animaux = ing.filter((i) => viande(i.nom) !== null)
  const dec = animaux.reduce((s, i) => s + (i.pourcentage ?? 0) * (isByProduct(i.nom) ? 0.5 : 1), 0)
  const que = animaux.length === ing.length && !animaux.some((i) => isByProduct(i.nom))
  const chew = ing.some((i) => isChewPart(i.nom))
  const part = que ? 100 : Math.min(100, Math.max(dec, chew ? 0 : e.partAnimaleDeclaree ?? 0))
  c.push({ id: 'part-animale', libelle: 'Part de viande ou de poisson', max: 20, points: part <= 0 ? 0 : part < 4 ? 1 : part < 14 ? 4 : part < 30 ? 8 : part < 50 ? 12 : part < 70 ? 16 : 20, explication: part > 0 ? `${fmt(part)} % déclarés, sous-produits comptés à moitié.` : 'Aucun pourcentage écrit.', source: S.EDITO })
  const sucre = textes.find(hasSugar)
  c.push({ id: 'sucres', libelle: 'Sucres ajoutés', max: 10, points: sucre ? 0 : 10, explication: sucre ? `« ${sucre} ».` : 'Aucun sucre repéré.', source: S.NRC })
  const defauts = [textes.find(hasColorant), controversialPreservatives(textes)[0] ?? textes.find(unnamedPreservative), textes.find(hasArtificialFlavor)].filter(Boolean)
  c.push({ id: 'additifs', libelle: 'Colorants, conservateurs, arômes', max: 10, points: defauts.length === 0 ? 10 : defauts.length === 1 ? 5 : 0, explication: defauts.length ? `Repéré : ${defauts.join(', ')}.` : 'Rien de repéré.', source: S.EDITO })
  const sel = textes.find(hasSalt)
  c.push({ id: 'sel', libelle: 'Sel ajouté', max: 5, points: sel ? 0 : 5, explication: sel ? `« ${sel} ».` : 'Aucun sel ajouté repéré.', source: S.EDITO })

  const en = e.energie
  const k100 = en?.kcal100g ?? (en?.kcalKg ? en.kcalKg / 10 : null)
  const kPiece = en?.kcalPiece ?? (k100 && en?.poidsPieceG ? (k100 * en.poidsPieceG) / 100 : null)
  const dens = k100 ?? estimeKcal100g(e)
  if (kPiece) c.push({ id: 'ration', libelle: 'Poids dans la ration du jour', max: 12, points: kPiece <= 5 ? 12 : kPiece <= 10 ? 10 : kPiece <= 20 ? 7 : kPiece <= 40 ? 4 : 1, explication: `${fmt(kPiece)} kcal la pièce, soit ${Math.round((kPiece / (MER_10KG * 0.1)) * 100)} % du plafond de friandises d'un chien de 10 kg.`, source: `${S.VCA} ; tranches : ${S.EDITO}` })
  else if (dens === null) c.push(pasCompte('ration', 'Poids dans la ration du jour', 12, 'Ni calories ni analyse : critère sorti du calcul.', S.VCA))
  else c.push({ id: 'ration', libelle: 'Poids dans la ration du jour', max: 12, points: dens <= 250 ? 8 : dens <= 350 ? 6 : dens <= 450 ? 4 : 2, explication: `Environ ${Math.round(dens)} kcal pour 100 g${k100 ? '' : ' (estimé)'}. Sans le poids d'une pièce, le plein score reste hors de portée.`, source: `${S.VCA} ; Atwater modifié ; tranches : ${S.EDITO}` })
  const n = ing.length
  c.push({ id: 'liste', libelle: 'Longueur de la liste', max: 6, points: Math.max(0, 6 - Math.max(0, n - 5)), explication: `${n} ingrédient(s).`, source: S.EDITO })
  const gly = textes.find(hasGlycerin)
  const opaque = ing.find((i) => isByProduct(i.nom) || isUnnamedAnimal(i.nom))
  const nbG = [gly, opaque].filter(Boolean).length
  c.push({ id: 'glycerine', libelle: 'Glycérine, animal sans nom', max: 4, points: nbG === 0 ? 4 : nbG === 1 ? 2 : 0, explication: nbG ? `Repéré : ${[gly, opaque?.nom].filter(Boolean).join(', ')}.` : 'Rien de repéré.', source: S.EDITO })
  c.push({ id: 'cereale', libelle: 'Céréale ou farine en tête', max: 3, points: isCerealOrFlour(prem.nom) ? 0 : 3, explication: isCerealOrFlour(prem.nom) ? `« ${prem.nom} ».` : 'Non.', source: S.EDITO })
  const a = e.constituants
  const nb = [a.proteines, a.matieresGrasses, a.cendres, a.cellulose, a.humidite].filter((v) => v !== null).length
  c.push({ id: 'transparence', libelle: 'Étiquette complète', max: 5, points: (nb >= 4 ? 3 : nb === 3 ? 1 : 0) + (kPiece || k100 ? 2 : 0), explication: `${nb} constituants sur 5, calories ${kPiece || k100 ? 'affichées' : 'absentes'}.`, source: `${S.REG} ; points : ${S.EDITO}` })
  const pl = new Plafond()
  if (risque) pl.baisser(45, `${risque.label} : risque d'étouffement ou d'occlusion, à surveiller.`)
  const sansDonnees = dens === null && !kPiece
  if (sansDonnees) pl.baisser(80, 'Ni calories ni analyse : note plafonnée à 80, hors classement.')
  return total('friandise', c, { fiabilite: kPiece ? 'haute' : dens !== null ? 'moyenne' : 'faible', alertes: risque ? [`${risque.label} : ${risque.text}`] : [], plafond: pl.v, horsClassement: sansDonnees })
}
