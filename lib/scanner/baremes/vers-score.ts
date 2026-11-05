import { bandFor, type Criterion, type CriterionId, type ScoreResult } from '../score'
import { treatAllowance } from '../treat-allowance'
import { treatAlerts } from '../treat-ingredients'
import type { ExtractedLabel } from '../types'
import { classer } from './classer'
import { BAREMES_VERSION } from './config'
import { matiereSeche } from './matiere-seche'
import { classementDe, noter, type Classement } from './noter'
import { round1, type Critere, type Entree, type Fiabilite, type Resultat, type TypeProduit } from './types'

// @cdc scanner — fait passer une lecture d'étiquette dans les barèmes et rend le format affiché.
// Compléments et huiles : une note et le message, sans détail ni tranche (décision du 2026-11-05).

export interface BaremeInfo {
  type: TypeProduit
  /** Afficher la note et le message, rien d'autre */
  simple: boolean
  classement: Classement | null
  horsClassement: boolean
  fiabilite: Fiabilite
}

export function entreeDepuisLabel(l: ExtractedLabel): Entree {
  return {
    marque: l.marque,
    produit: l.produit,
    typeAliment: l.typeAliment,
    ingredients: l.ingredients,
    additifs: l.additifs,
    constituants: l.constituants,
    partAnimaleDeclaree: l.partAnimaleDeclaree,
    energie: l.energie,
    mentions: l.mentions,
    tableauBrut: l.tableauBrut,
    rationLue: l.rationLue === true,
    ration10kgG: l.ration10kgG,
    emballage: l.emballage,
    alimentVeterinaire: l.alimentVeterinaire === true,
    stade: l.stade,
    gabarit: l.gabarit,
  }
}

/** La lecture de l'IA d'abord. Fiche sans ce champ : son rayon, sauf si le nom dit complément ou huile. */
export function typeDepuisLabel(l: ExtractedLabel): TypeProduit {
  if (l.typeProduit) return l.typeProduit
  const parNom = classer(entreeDepuisLabel(l))
  if (parNom === 'complement' || parNom === 'huile' || parNom === 'autre') return parNom
  return l.typeImage === 'friandise' ? 'friandise' : l.typeImage === 'aliment-chien' ? 'aliment' : 'indetermine'
}

const IDS_ALIMENT: Record<string, CriterionId> = { premier: 'premier-ingredient', especes: 'sous-produits', 'base-vegetale': 'cereales' }
const IDS_FRIANDISE: Record<string, CriterionId> = {
  premier: 'friandise-premier-ingredient',
  'part-animale': 'friandise-part-animale',
  sucres: 'friandise-sucres',
  additifs: 'friandise-additifs',
  sel: 'friandise-sel',
  ration: 'friandise-ration',
  liste: 'friandise-liste',
  glycerine: 'friandise-glycerine',
  cereale: 'friandise-cereales',
  transparence: 'friandise-transparence',
}

function versCritere(c: Critere, type: TypeProduit): Criterion {
  const id = ((type === 'friandise' ? IDS_FRIANDISE : IDS_ALIMENT)[c.id] ?? c.id) as CriterionId
  return { id, label: c.libelle, max: c.max, points: c.points, explanation: c.explication, ...(c.points === null ? { undeclared: true } : {}) }
}

function versScore(l: ExtractedLabel, e: Entree, r: Resultat): ScoreResult {
  const simple = r.type === 'complement' || r.type === 'huile'
  const zero = r.note === 0 && r.criteres.length === 0
  const ms = r.type === 'aliment' ? matiereSeche(e) : null
  const hSupposee = ms !== null && ms.h !== null && l.constituants.humidite === null
  const plafonne = r.plafond !== null && r.note === r.plafond.valeur && !zero
  const texts = [...l.ingredients.map((i) => i.nom), ...l.additifs]
  return {
    version: BAREMES_VERSION,
    kind: r.type === 'friandise' ? 'treat' : 'complete',
    score: r.note,
    band: r.note === null || simple || zero ? null : bandFor(r.note),
    criteria: simple ? [] : r.criteres.map((c) => versCritere(c, r.type)),
    missing: simple ? [] : r.criteres.filter((c) => c.points === null).map((c) => c.libelle.toLowerCase()),
    assumptions: simple ? [] : [...(hSupposee ? [`Humidité non indiquée : on retient ${ms?.h} %, valeur courante des croquettes.`] : []), ...(plafonne && r.plafond ? [r.plafond.raison] : [])],
    dryMatter: ms && ms.h !== null ? { proteines: nul1(ms.prot), matieresGrasses: nul1(ms.mg), glucides: nul1(ms.glu) } : null,
    notice: r.message,
    ...(r.type === 'friandise' ? { treat: { allowance: treatAllowance(l.energie), alerts: treatAlerts(texts) } } : {}),
    bareme: { type: r.type, simple, classement: classementDe(e, r), horsClassement: r.horsClassement, fiabilite: r.fiabilite },
    alertes: r.alertes,
  }
}

const nul1 = (v: number | null) => (v === null ? null : round1(v))

export function analyseBaremes(label: ExtractedLabel): ScoreResult {
  const e = entreeDepuisLabel(label)
  const type = typeDepuisLabel(label)
  if (label.espece === 'chat') return versScore(label, e, { type, note: null, fiabilite: 'faible', criteres: [], plafond: null, alertes: [], message: 'Ce produit est destiné au chat : nos barèmes notent les produits pour chien.', horsClassement: true })
  return versScore(label, e, noter(e, type))
}
