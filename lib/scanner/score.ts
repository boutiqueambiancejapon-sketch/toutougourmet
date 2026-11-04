import { animalKind, controversialPreservatives, hasColorant, hasSugar, isByProduct, isCereal, isUnnamedAnimal, speciesInDetailOnly, unnamedAntioxidants } from './ingredients'
import type { ExtractedLabel } from './types'

// @cdc lot 6 — NOTRE note sur 100 d'une étiquette de croquettes (l'IA lit, elle ne note pas).
// Fonction pure, testée par scripts/test-scanner-score.ts. Chaque critère, son barème et sa
// source sont décrits dans docs/v2/scanner-score.md : toute modification du barème change
// SCORE_VERSION (les analyses en cache sont alors recalculées à la lecture).

export const SCORE_VERSION = '1.3'

/** Humidité retenue pour des croquettes qui ne la déclarent pas (règlement UE 767/2009 : mention obligatoire au-delà de 14 %). */
export const ASSUMED_DRY_MOISTURE = 10
/** En dessous de ce total de points évaluables, pas de note : trop d'informations manquent. */
export const MIN_EVALUATED_POINTS = 60

export type CriterionId =
  | 'proteines'
  | 'matieres-grasses'
  | 'glucides'
  | 'premier-ingredient'
  | 'part-animale'
  | 'sous-produits'
  | 'cereales'
  | 'sucres'
  | 'conservateurs'
  | 'colorants'
  | 'calcium-phosphore'
  // Barème friandise (lib/scanner/score-treat.ts)
  | 'friandise-premier-ingredient'
  | 'friandise-part-animale'
  | 'friandise-sucres'
  | 'friandise-additifs'
  | 'friandise-sel'
  | 'friandise-liste'
  | 'friandise-glycerine'
  | 'friandise-cereales'

/** complete : aliment complet (croquettes, pâtée) · treat : friandise, snack, aliment complémentaire */
export type ProductKind = 'complete' | 'treat'

export type TreatAlertId = 'xylitol' | 'raisin' | 'chocolat' | 'oignon-ail' | 'rawhide' | 'os-cuits'

export interface TreatAlert {
  id: TreatAlertId
  /** Libellé court (« Xylitol ») */
  label: string
  /** Ingrédient de l'étiquette qui déclenche l'alerte */
  found: string
  text: string
}

export interface TreatAllowanceRow {
  size: 'petit' | 'moyen' | 'grand'
  label: string
  weightKg: number
  dailyKcal: number
  /** 10 % du besoin du jour (FEDIAF) */
  capKcal: number
  /** Friandises par jour (null si le poids ou l'énergie d'une pièce manque) */
  pieces: number | null
  /** Grammes par jour (null si l'énergie au poids manque) */
  grams: number | null
}

export interface TreatInfo {
  /** null : calories non indiquées sur l'étiquette */
  allowance: { kcalPiece: number | null; kcal100g: number | null; rows: TreatAllowanceRow[] } | null
  alerts: TreatAlert[]
}

export interface Criterion {
  id: CriterionId
  label: string
  max: number
  /** null : critère non évalué, faute d'information sur l'étiquette */
  points: number | null
  explanation: string
}

export type Band = 'tres-bon' | 'correct' | 'moyen' | 'faible'

export interface ScoreResult {
  version: string
  /** Absent des analyses enregistrées avant le barème friandise : aliment complet */
  kind?: ProductKind
  score: number | null
  band: Band | null
  criteria: Criterion[]
  /** Informations absentes de l'étiquette qui empêchent d'évaluer un critère */
  missing: string[]
  /** Hypothèses faites (affichées avec la note) */
  assumptions: string[]
  /** Valeurs ramenées sur matière sèche, quand l'humidité est connue ou supposée */
  dryMatter: { proteines: number | null; matieresGrasses: number | null; glucides: number | null } | null
  notice: string | null
  /** Friandise : nombre par jour selon le gabarit et alertes de sécurité */
  treat?: TreatInfo
}

export const kindOf = (d: Pick<ScoreResult, 'kind'>): ProductKind => d.kind ?? 'complete'

export const BAND_LABELS: Record<Band, string> = {
  'tres-bon': 'Très bonne composition',
  correct: 'Composition correcte',
  moyen: 'Composition moyenne',
  faible: 'Composition faible',
}

export function bandFor(score: number): Band {
  if (score >= 75) return 'tres-bon'
  if (score >= 55) return 'correct'
  if (score >= 35) return 'moyen'
  return 'faible'
}

const P = ' %'
const fmt = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 1 })
const round1 = (n: number) => Math.round(n * 10) / 10

function step(value: number, steps: [number, number][], last: number): number {
  for (const [limit, pts] of steps) if (value < limit) return pts
  return last
}

export interface DryMatterBasis {
  /** Humidité retenue (déclarée ou supposée), null si inconnue */
  moisture: number | null
  /** true : humidité non déclarée, ASSUMED_DRY_MOISTURE retenu */
  assumedMoisture: boolean
  protDm: number | null
  fatDm: number | null
  /** Glucides estimés sur le produit tel quel, par différence */
  carbsAsFed: number | null
  carbsDm: number | null
}

type Constituents = Pick<ExtractedLabel['constituants'], 'proteines' | 'matieresGrasses' | 'cendres' | 'cellulose' | 'humidite'>

/** Matière sèche et glucides par différence : le calcul de la note, partagé avec le calculateur de /scanner. */
export function dryMatterBasis(a: Constituents, typeAliment: ExtractedLabel['typeAliment']): DryMatterBasis {
  let moisture = a.humidite
  let assumedMoisture = false
  if (moisture === null && typeAliment !== 'humide' && a.proteines !== null && a.matieresGrasses !== null) {
    const sum = a.proteines + a.matieresGrasses + (a.cendres ?? 0) + (a.cellulose ?? 0)
    if (sum <= 80) {
      moisture = ASSUMED_DRY_MOISTURE
      assumedMoisture = true
    }
  }
  const dm = (v: number | null) => (v === null || moisture === null || moisture >= 100 ? null : round1((v * 100) / (100 - moisture)))
  const carbsAsFed =
    a.proteines !== null && a.matieresGrasses !== null && a.cendres !== null && a.cellulose !== null && moisture !== null
      ? Math.max(0, 100 - a.proteines - a.matieresGrasses - a.cendres - a.cellulose - moisture)
      : null
  return { moisture, assumedMoisture, protDm: dm(a.proteines), fatDm: dm(a.matieresGrasses), carbsAsFed, carbsDm: dm(carbsAsFed) }
}

/** Points (sur 15) et phrase de lecture du critère des glucides. */
export function carbsCriterion(carbsDm: number): { points: number; explanation: string } {
  const points = carbsDm <= 30 ? 15 : carbsDm <= 40 ? 11 : carbsDm <= 50 ? 6 : 2
  return {
    points,
    explanation: `Environ ${fmt(carbsDm)}${P} (100 moins les autres constituants). Le chien n'a pas de besoin minimal en glucides (NRC 2006)${carbsDm > 40 ? ', ici ils forment la plus grosse part.' : '.'}`,
  }
}

export function scoreLabel(label: ExtractedLabel): ScoreResult {
  const a = label.constituants
  const missing: string[] = []
  const assumptions: string[] = []
  const criteria: Criterion[] = []
  const add = (id: CriterionId, lbl: string, max: number, points: number | null, explanation: string) =>
    criteria.push({ id, label: lbl, max, points, explanation })

  const basis = dryMatterBasis(a, label.typeAliment)
  const { moisture, protDm, fatDm, carbsDm } = basis
  if (basis.assumedMoisture)
    assumptions.push(`Humidité non indiquée : on retient ${ASSUMED_DRY_MOISTURE}${P}, valeur courante des croquettes (la mention n'est obligatoire qu'au-delà de 14${P}).`)
  if (a.humidite === null && moisture === null) missing.push('humidité')

  if (a.proteines === null) missing.push('protéines')
  if (protDm === null) add('proteines', 'Protéines sur matière sèche', 20, null, 'Taux de protéines ou humidité absents : critère non évalué.')
  else {
    const pts = step(protDm, [[18, 0], [22, 6], [26, 11], [30, 15], [36, 18]], 20)
    add('proteines', 'Protéines sur matière sèche', 20, pts,
      protDm < 18 ? `${fmt(protDm)}${P}, sous le minimum de 18${P} fixé par la FEDIAF pour un chien adulte.` : `${fmt(protDm)}${P} de protéines une fois l'eau retirée (minimum FEDIAF adulte : 18${P}).`)
  }

  if (a.matieresGrasses === null) missing.push('matières grasses')
  if (fatDm === null) add('matieres-grasses', 'Matières grasses sur matière sèche', 10, null, 'Taux de matières grasses ou humidité absents : critère non évalué.')
  else {
    const pts = fatDm < 5.5 ? 0 : fatDm < 10 ? 5 : fatDm <= 22 ? 10 : fatDm <= 28 ? 8 : 6
    add('matieres-grasses', 'Matières grasses sur matière sèche', 10, pts,
      fatDm < 5.5 ? `${fmt(fatDm)}${P}, sous le minimum FEDIAF de 5,5${P}.` : fatDm > 22 ? `${fmt(fatDm)}${P} : aliment très énergétique, ration à surveiller pour un chien peu actif.` : `${fmt(fatDm)}${P} sur matière sèche, dans la zone habituelle d'un aliment complet.`)
  }

  if (a.cendres === null) missing.push('cendres brutes')
  if (a.cellulose === null) missing.push('cellulose ou fibres brutes')
  if (carbsDm === null) add('glucides', 'Glucides estimés sur matière sèche', 15, null, 'Il faut protéines, matières grasses, cendres, fibres et humidité pour estimer les glucides.')
  else {
    const c = carbsCriterion(carbsDm)
    add('glucides', 'Glucides estimés sur matière sèche', 15, c.points, c.explanation)
  }

  scoreIngredients(label, add, missing)

  // Calcium / phosphore : évalué seulement s'il est donné
  if (a.calcium !== null && a.phosphore !== null && a.phosphore > 0) {
    const ratio = round1(a.calcium / a.phosphore)
    const ok = ratio >= 1 && ratio <= 2
    add('calcium-phosphore', 'Rapport calcium / phosphore', 5, ok ? 5 : 0,
      ok ? `${fmt(ratio)} pour 1, dans la fourchette de 1 à 2 recommandée par la FEDIAF.` : `${fmt(ratio)} pour 1, hors de la fourchette de 1 à 2 recommandée par la FEDIAF.`)
  }

  const evaluated = criteria.filter((c) => c.points !== null)
  const evaluatedMax = evaluated.filter((c) => c.id !== 'calcium-phosphore').reduce((s, c) => s + c.max, 0)
  let notice: string | null = null
  let score: number | null = null
  if (label.espece === 'chat') notice = 'Cet aliment est destiné au chat : notre méthode note les aliments pour chien, les seuils ne sont pas les mêmes.'
  else if (evaluatedMax < MIN_EVALUATED_POINTS) notice = 'Trop d\'informations manquent sur les photos pour donner une note fiable.'
  else {
    const max = evaluated.reduce((s, c) => s + c.max, 0)
    score = Math.round((evaluated.reduce((s, c) => s + (c.points ?? 0), 0) / max) * 100)
  }
  return {
    version: SCORE_VERSION,
    kind: 'complete',
    score,
    band: score === null ? null : bandFor(score),
    criteria,
    missing,
    assumptions,
    dryMatter: moisture === null ? null : { proteines: protDm, matieresGrasses: fatDm, glucides: carbsDm },
    notice,
  }
}

type Add = (id: CriterionId, label: string, max: number, points: number | null, explanation: string) => void

function scoreIngredients(label: ExtractedLabel, add: Add, missing: string[]): void {
  const ing = label.ingredients
  if (ing.length === 0) {
    missing.push('liste des ingrédients')
    for (const [id, lbl, max] of [
      ['premier-ingredient', 'Premier ingrédient', 15],
      ['part-animale', 'Part de viande ou poisson déclarée', 10],
      ['sous-produits', 'Ingrédients animaux non nommés', 10],
      ['cereales', 'Céréales en tête de liste', 5],
      ['sucres', 'Sucres ajoutés', 5],
      ['conservateurs', 'Conservateurs controversés', 5],
      ['colorants', 'Colorants', 5],
    ] as const)
      add(id, lbl, max, null, 'Liste des ingrédients absente ou illisible : critère non évalué.')
    return
  }
  const first = ing[0]
  const kind = animalKind(first.nom)
  const fresh = /fra[iî](s|ches?)([^a-z]|$)/i.test(first.nom)
  if (kind === 'nommee')
    add('premier-ingredient', 'Premier ingrédient', 15, 15, `« ${first.nom} » : une source animale dont l'espèce est nommée.${fresh ? ` Comptée fraîche, elle contient environ 70${P} d\'eau : une fois sèche, elle pèse bien moins.` : ''}`)
  else if (kind === 'non-nommee')
    add('premier-ingredient', 'Premier ingrédient', 15, isByProduct(first.nom) ? 3 : 7, `« ${first.nom} » : origine animale, mais l'espèce n'est pas précisée${speciesInDetailOnly(first.nom) ? ' (celle citée entre parenthèses n\'en désigne qu\'une partie)' : ''}.`)
  else add('premier-ingredient', 'Premier ingrédient', 15, 0, `« ${first.nom} » : l'ingrédient le plus lourd de la recette n'est pas une viande ni un poisson.`)

  const declared = ing.filter((i) => animalKind(i.nom) !== null && i.pourcentage !== null).reduce((s, i) => s + (i.pourcentage ?? 0), 0)
  const share = Math.max(declared, label.partAnimaleDeclaree ?? 0)
  if (share <= 0) add('part-animale', 'Part de viande ou poisson déclarée', 10, 0, 'Aucun pourcentage de viande ou de poisson n\'est écrit : impossible de savoir combien la recette en contient.')
  else {
    const pts = step(share, [[4, 1], [25, 2], [40, 5], [60, 8]], 10)
    add('part-animale', 'Part de viande ou poisson déclarée', 10, pts, `${fmt(share)}${P} d'ingrédients d'origine animale déclarés sur l'étiquette.`)
  }

  const byProducts = ing.filter((i) => isByProduct(i.nom))
  const unnamed = ing.filter((i) => isUnnamedAnimal(i.nom))
  if (byProducts.length)
    add('sous-produits', 'Ingrédients animaux non nommés', 10, 0, `« ${byProducts[0].nom} » : catégorie qui ne dit ni l'espèce ni la partie de l'animal, et peut varier d'un lot à l'autre.`)
  else if (unnamed.length)
    add('sous-produits', 'Ingrédients animaux non nommés', 10, unnamed.length >= 2 ? 3 : 5,
      `${unnamed.map((i) => `« ${i.nom} »`).slice(0, 3).join(', ')} : l'espèce n'est pas indiquée, la matière première peut changer d'un lot à l'autre.`)
  else add('sous-produits', 'Ingrédients animaux non nommés', 10, 10, 'Chaque ingrédient d\'origine animale indique son espèce.')

  const cerealPos = ing.slice(0, 3).findIndex((i) => isCereal(i.nom))
  // Plusieurs céréales en tête (maïs, farine de maïs, blé…) : séparées, chacune pèse moins que la
  // viande ; additionnées, elles pèsent probablement plus (pratique dite du fractionnement).
  const topCereals = ing.slice(0, 5).filter((i) => isCereal(i.nom))
  if (topCereals.length >= 2)
    add('cereales', 'Céréales en tête de liste', 5, cerealPos === 0 ? 0 : 1,
      `${topCereals.length} céréales parmi les 5 premiers ingrédients (${topCereals.map((i) => i.nom).join(', ')}) : additionnées, elles pèsent probablement plus que l'ingrédient animal.`)
  else add('cereales', 'Céréales en tête de liste', 5, cerealPos === 0 ? 0 : cerealPos > 0 ? 3 : 5,
    cerealPos === 0 ? `« ${first.nom} » : une céréale est l'ingrédient principal.` : cerealPos > 0 ? `Une céréale arrive en position ${cerealPos + 1} (« ${ing[cerealPos].nom} »).` : 'Aucune céréale dans les trois premiers ingrédients.')

  const texts = [...ing.map((i) => i.nom), ...label.additifs]
  const sugar = texts.find(hasSugar)
  add('sucres', 'Sucres ajoutés', 5, sugar ? 0 : 5, sugar ? `« ${sugar} » : un sucre ajouté, sans utilité nutritionnelle pour le chien.` : 'Aucun sucre ajouté repéré.')

  const preservatives = controversialPreservatives(texts)
  if (preservatives.length)
    add('conservateurs', 'Conservateurs controversés', 5, 0, `${preservatives.join(', ')} repéré : voir la méthode pour le détail.`)
  else if (unnamedAntioxidants(texts))
    add('conservateurs', 'Conservateurs controversés', 5, 3, 'Conservateurs ou antioxygènes cités sans leur nom : impossible de vérifier qu\'il ne s\'agit pas de BHA, BHT ou éthoxyquine.')
  else add('conservateurs', 'Conservateurs controversés', 5, 5, 'Ni BHA, ni BHT, ni éthoxyquine repérés.')

  const colorant = texts.find(hasColorant)
  add('colorants', 'Colorants', 5, colorant ? 0 : 5, colorant ? `« ${colorant} » : la couleur de l'aliment ne sert qu'au maître, pas au chien.` : 'Aucun colorant repéré.')
}
