import { animalKind, controversialPreservatives, hasColorant, hasSugar, isByProduct, isCereal, isUnnamedAnimal, normalize, unnamedAntioxidants } from '../ingredients'
import { estAllege, estGrand, estPetit, stadeDe } from './classer'
import { estHumide, matiereSeche, partAnimaleSeche } from './matiere-seche'
import { fmt, pasCompte, Plafond, round1, S, total, type Critere, type Entree, type Fiabilite, type Resultat } from './types'

// @cdc scanner — barème 1 : croquettes et pâtées, sur 100.
// Hypothèse écrite : les pourcentages d'une croquette sont lus comme des pourcentages avant cuisson.

const FAMILLE: [string, RegExp][] = [
  ['mais', /(^|[^a-z])mais([^a-z]|$)/], ['ble', /(^|[^a-z])ble([^a-z]|$)|gluten/], ['riz', /(^|[^a-z])riz([^a-z]|$)/],
  ['pois', /(^|[^a-z])(pois|lentilles?|feves?|feverole|pois chiches?)([^a-z]|$)/], ['tubercule', /pommes? de terre|patates? douces?|manioc|tapioca/],
]
const familleDe = (n: string) => FAMILLE.find(([, r]) => r.test(normalize(n)))?.[0] ?? null
const estBaseVegetale = (n: string) => animalKind(n) === null && (familleDe(n) !== null || isCereal(n))

export function noteAliment(e: Entree): Resultat {
  const a = e.constituants
  const ms = matiereSeche(e)
  const stade = e.stade ?? stadeDe(e.produit)
  const croissance = stade === 'chiot' || stade === 'tous'
  const grand = e.gabarit === 'grand' || estGrand(e.produit)
  const allege = estAllege(e.produit)
  const c: Critere[] = []
  const alertes: string[] = []
  const pl = new Plafond()

  // Profil unique de croissance : colonne FEDIAF « croissance précoce », la recette vise le chiot dès le sevrage.
  const protMin = croissance ? 25 : stade === 'senior' || allege ? 21 : 18
  const plateau = protMin * 1.4
  if (ms.prot === null) c.push(pasCompte('proteines', 'Protéines pour ce stade de vie', 10, 'Protéines ou humidité absentes.', S.FEDIAF))
  else {
    const pts = ms.prot < protMin ? 0 : Math.min(10, 3 + (7 * (ms.prot - protMin)) / (plateau - protMin))
    const ex = ms.prot < 18 ? `${fmt(ms.prot)} % sur sec, sous le minimum FEDIAF de 18 %.` : ms.prot < protMin ? `${fmt(ms.prot)} % sur sec, en dessous du repère de ${protMin} % pour ce profil, au-dessus du seuil adulte de 18 %.` : `${fmt(ms.prot)} % sur sec, repère de ${protMin} % pour ce profil, plein score dès ${fmt(plateau)} %.`
    c.push({ id: 'proteines', libelle: 'Protéines pour ce stade de vie', max: 10, points: round1(pts), explication: ex, source: `${S.FEDIAF} ; ${S.FEDIAF_MER} ; plateau : ${S.EDITO}` })
    if (ms.prot < 18) pl.baisser(49, 'Protéines sous le minimum FEDIAF de 18 % sur sec.')
  }

  const mgMin = croissance ? 8.5 : 5.5
  if (ms.mg === null) c.push(pasCompte('matieres-grasses', 'Matières grasses', 5, 'Matières grasses ou humidité absentes.', S.FEDIAF))
  else {
    const m = ms.mg
    const pts = allege ? (m < mgMin ? 0 : m <= 16 ? 5 : m <= 20 ? 3 : 1) : m < mgMin ? 0 : m < 10 ? 3 : m <= 22 ? 5 : m <= 28 ? 4 : 2
    c.push({ id: 'matieres-grasses', libelle: 'Matières grasses', max: 5, points: pts, explication: `${fmt(m)} % sur sec, repère ${mgMin} %${allege ? ', recette annoncée allégée' : ''}.`, source: `${S.FEDIAF} ; tranches : ${S.EDITO}` })
    if (m < 5.5) pl.baisser(49, 'Matières grasses sous le minimum FEDIAF de 5,5 % sur sec.')
  }

  if (ms.glu === null) c.push(pasCompte('glucides', 'Glucides estimés', 8, 'Il faut protéines, matières grasses, cendres, fibres et humidité.', S.NRC))
  else c.push({ id: 'glucides', libelle: 'Glucides estimés', max: 8, points: ms.glu <= 30 ? 8 : ms.glu <= 40 ? 7 : ms.glu <= 50 ? 5 : 2, explication: `Environ ${fmt(ms.glu)} % sur sec.`, source: `${S.NRC} ; tranches : ${S.EDITO}` })

  // Calcium et phosphore. Le calcium d'un chiot est testé dès qu'il existe, même sans phosphore.
  const caMin = croissance ? 1 : 0.5
  // FEDIAF : 1,6 % en croissance précoce. 1,8 % seulement si le nom annonce un petit gabarit, moins exposé.
  const petit = (e.gabarit === 'petit' || estPetit(e.produit)) && !grand
  const caMax = croissance ? (petit ? 1.8 : 1.6) : 2.5
  const pMin = croissance ? 0.9 : 0.4
  const rMax = croissance ? (petit ? 1.8 : 1.6) : 2
  if (croissance && ms.ca !== null && ms.ca > caMax) {
    pl.baisser(59, `Calcium au-dessus de ${caMax} % sur sec pour ce chiot.`)
    alertes.push(`Chiot : calcium à ${fmt(ms.ca)} % sur sec, au-dessus du maximum FEDIAF de ${caMax} % pour ce profil.`)
  }
  if (croissance && grand && ms.ca === null) alertes.push('Chiot de grande race : calcium non lu, à vérifier sur l\'emballage.')
  // Décision du propriétaire : sans les deux valeurs, le rapport déclaré par la marque rapporte ses points,
  // mais le plafond de 90 reste, pour toutes les marques. Il reste hors des alertes chiot.
  const declare = ms.ca === null || ms.p === null ? e.rapportCaP : null
  if (declare) {
    const dedans = declare.min >= 1 && declare.max <= rMax
    c.push({ id: 'calcium-phosphore', libelle: 'Calcium et phosphore', max: 6, points: dedans ? 6 : 0, explication: `Rapport de ${fmt(declare.min)}${declare.max !== declare.min ? ` à ${fmt(declare.max)}` : ''} déclaré par la marque, sans les valeurs de calcium et de phosphore. Repère : de 1 à ${rMax}.`, source: `${S.FEDIAF} ; rapport déclaré : décision éditoriale` })
  } else if (ms.ca === null || ms.p === null || ms.p <= 0) c.push(pasCompte('calcium-phosphore', 'Calcium et phosphore', 6, 'Pas tous les deux sur cette fiche : critère sorti du calcul.', S.FEDIAF))
  else {
    const r = ms.ca / ms.p
    c.push({ id: 'calcium-phosphore', libelle: 'Calcium et phosphore', max: 6, points: (ms.ca >= caMin && ms.ca <= caMax ? 2 : 0) + (ms.p >= pMin && ms.p <= 1.6 ? 2 : 0) + (r >= 1 && r <= rMax ? 2 : 0), explication: `Calcium ${fmt(ms.ca)} %, phosphore ${fmt(ms.p)} % sur sec, rapport ${fmt(r)}. Repères : calcium de ${caMin} à ${caMax} %, rapport de 1 à ${rMax}.`, source: S.FEDIAF })
  }

  if (ms.cendres === null) c.push(pasCompte('cendres', 'Cendres', 3, 'Cendres absentes.', S.EDITO))
  else c.push({ id: 'cendres', libelle: 'Cendres', max: 3, points: ms.cendres <= 8 ? 3 : ms.cendres <= 10 ? 2 : ms.cendres <= 12 ? 1 : 0, explication: `${fmt(ms.cendres)} % sur sec.`, source: S.EDITO })

  const ing = e.ingredients
  if (ing.length === 0) {
    for (const [id, l, m] of [['premier', 'Premier ingrédient', 15], ['part-animale', 'Part animale sur sec', 16], ['especes', 'Espèces nommées', 8], ['base-vegetale', 'Base végétale', 8], ['sucres', 'Sucres ajoutés', 4], ['conservateurs', 'Conservateurs', 4], ['colorants', 'Colorants', 3]] as const)
      c.push(pasCompte(id, l, m, 'Liste des ingrédients absente.', S.REG))
  } else {
    const prem = ing[0]
    const k = animalKind(prem.nom)
    const fraisPremier = /frais|fraiche|crue?s?\b/.test(normalize(prem.nom)) && !/deshydrat|seche?s?\b|farine/.test(normalize(prem.nom))
    const vegetalDerriere = ing.slice(1, 3).some((i) => estBaseVegetale(i.nom))
    let pts = 0
    let ex = `« ${prem.nom} » : ni viande ni poisson.`
    if (k === 'nommee' && fraisPremier && vegetalDerriere && !estHumide(e, ms.h)) { pts = 11; ex = `« ${prem.nom} » : nommé, mais pesé frais, et un ingrédient végétal suit de près.` }
    else if (k === 'nommee') { pts = 15; ex = `« ${prem.nom} » : espèce nommée.` }
    else if (k === 'non-nommee') { pts = isByProduct(prem.nom) ? 2 : 7; ex = `« ${prem.nom} » : espèce non précisée.` }
    c.push({ id: 'premier', libelle: 'Premier ingrédient', max: 15, points: pts, explication: ex, source: `${S.REG} (ordre par poids) ; points : ${S.EDITO}` })

    const part = partAnimaleSeche(e, ms.h)
    if (part === null) c.push({ id: 'part-animale', libelle: 'Part animale sur sec', max: 16, points: 5, explication: 'Aucun pourcentage de viande ou de poisson : valeur prudente de 5 sur 16, ni bonus ni zéro.', source: S.EDITO })
    else c.push({ id: 'part-animale', libelle: 'Part animale sur sec', max: 16, points: part < 10 ? 1 : part < 20 ? 5 : part < 35 ? 9 : part < 50 ? 13 : 16, explication: `Environ ${fmt(part)} % de la matière sèche, viande sans son eau, sous-produits comptés à moitié. Pourcentages supposés avant cuisson.`, source: `Eau de la viande fraîche : environ 70 %. Tranches : ${S.EDITO}` })

    const byp = ing.filter((i) => isByProduct(i.nom))
    const sans = ing.filter((i) => isUnnamedAnimal(i.nom))
    c.push({ id: 'especes', libelle: 'Espèces nommées', max: 8, points: byp.length ? 0 : sans.length >= 2 ? 3 : sans.length ? 5 : 8, explication: byp.length ? `« ${byp[0].nom} » : ni l'espèce ni la partie.` : sans.length ? `${sans.length} ingrédient(s) animal(aux) sans espèce.` : 'Chaque ingrédient animal dit son espèce.', source: `Directive 82/475/CEE ; points : ${S.EDITO}` })

    const tete = ing.slice(0, 5).filter((i) => estBaseVegetale(i.nom))
    const familles = tete.map((i) => familleDe(i.nom) ?? 'cereale')
    const fraction = familles.some((f, i) => familles.indexOf(f) !== i) || familles.filter((f) => ['mais', 'ble', 'riz', 'cereale'].includes(f)).length >= 2
    const pos = ing.slice(0, 3).findIndex((i) => estBaseVegetale(i.nom))
    c.push({ id: 'base-vegetale', libelle: 'Base végétale', max: 8, points: pos === 0 ? 0 : fraction ? 2 : pos > 0 ? 5 : 8, explication: pos === 0 ? 'Un végétal ouvre la liste.' : fraction ? `Plusieurs végétaux proches parmi les 5 premiers.` : pos > 0 ? `Un végétal en position ${pos + 1}.` : 'Aucun végétal féculent en tête.', source: S.EDITO })

    const textes = [...ing.map((i) => i.nom), ...e.additifs]
    const sucre = textes.find(hasSugar)
    c.push({ id: 'sucres', libelle: 'Sucres ajoutés', max: 4, points: sucre ? 0 : 4, explication: sucre ? `« ${sucre} ».` : 'Aucun sucre ajouté repéré.', source: S.NRC })
    const cons = controversialPreservatives(textes)
    c.push({ id: 'conservateurs', libelle: 'Conservateurs', max: 4, points: cons.length ? 0 : unnamedAntioxidants(textes) ? 2 : 4, explication: cons.length ? cons.join(', ') : unnamedAntioxidants(textes) ? 'Cités sans leur nom.' : 'Ni BHA, ni BHT, ni éthoxyquine.', source: 'Règlement d\'exécution (UE) 2017/962 (éthoxyquine)' })
    const col = textes.find(hasColorant)
    c.push({ id: 'colorants', libelle: 'Colorants', max: 3, points: col ? 0 : 3, explication: col ? `« ${col} ».` : 'Aucun colorant repéré.', source: S.EDITO })
  }

  const nb = [a.proteines, a.matieresGrasses, a.cendres, a.cellulose].filter((v) => v !== null).length + (a.humidite !== null ? 1 : e.typeAliment === 'sec' ? 1 : 0)
  const pct = ing.some((i) => animalKind(i.nom) !== null && i.pourcentage !== null) || Boolean(e.partAnimaleDeclaree)
  const caP = a.calcium !== null && a.phosphore !== null
  const kcal = Boolean(e.energie && (e.energie.kcalKg ?? e.energie.kcal100g))
  c.push({ id: 'transparence', libelle: 'Étiquette complète', max: 10, points: (nb >= 5 ? 4 : nb === 4 ? 3 : nb === 3 ? 2 : 0) + (caP ? 3 : 0) + (pct ? 2 : 0) + (kcal ? 1 : 0), explication: `${nb} constituants sur 5, calcium et phosphore ${caP ? 'affichés' : 'absents'}, part animale ${pct ? 'chiffrée' : 'non chiffrée'}, calories ${kcal ? 'affichées' : 'absentes'}.`, source: `${S.REG} ; points : ${S.EDITO}` })

  const non = c.filter((x) => x.points === null).map((x) => x.id)
  // Composition sans analyse : la composition seule ne dit rien de la nutrition. 70 reste sous la tranche « très bonne » (75).
  if (ms.prot === null || ms.mg === null) pl.baisser(70, 'Composition sans analyse : la nutrition n\'est pas vérifiée, note plafonnée à 70.')
  else if (non.includes('glucides')) pl.baisser(85, 'Glucides impossibles à estimer : note plafonnée à 85.')
  else if (non.includes('calcium-phosphore') || declare) pl.baisser(90, 'Calcium et phosphore absents : note plafonnée à 90.')
  const fiabilite: Fiabilite = non.includes('glucides') || ing.length === 0 ? 'faible' : caP && pct ? 'haute' : 'moyenne'
  return total('aliment', c, { fiabilite, alertes, plafond: pl.v, horsClassement: fiabilite === 'faible' })
}
