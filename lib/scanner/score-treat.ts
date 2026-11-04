import { animalKind, controversialPreservatives, hasColorant, hasSugar, isByProduct, isUnnamedAnimal, speciesInDetailOnly } from './ingredients'
import { bandFor, type Criterion, type CriterionId, type ScoreResult } from './score'
import { treatAllowance } from './treat-allowance'
import { hasArtificialFlavor, hasGlycerin, hasSalt, isCerealOrFlour, isChewPart, treatAlerts, unnamedPreservative } from './treat-ingredients'
import type { ExtractedLabel } from './types'

// @cdc lot 6 — NOTRE note sur 100 d'une friandise, d'un snack ou d'un aliment complémentaire.
// Barème distinct de celui des aliments complets (lib/scanner/score.ts) : une friandise ne nourrit
// pas seule le chien, on ne juge donc ni protéines ni glucides sur matière sèche, mais la recette.
// Fonction pure, testée par scripts/test-scanner-treat.ts. Règles et sources :
// docs/v2/scanner-score.md, « Barème friandise ». Toute modification change TREAT_SCORE_VERSION.

export const TREAT_SCORE_VERSION = 'friandise-1.2'

const P = ' %'
const fmt = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 1 })
const quote = (s: string) => `« ${s} »`

function step(value: number, steps: [number, number][], last: number): number {
  for (const [limit, pts] of steps) if (value < limit) return pts
  return last
}

/** Part animale déclarée : < 4 % : 1 · 4-14 : 3 · 14-30 : 6 · 30-50 : 9 · 50-70 : 12 · ≥ 70 : 15. */
export const meatSharePoints = (share: number) => step(share, [[4, 1], [14, 3], [30, 6], [50, 9], [70, 12]], 15)
/** Liste courte : 10 points jusqu'à 5 ingrédients, 2 de moins par ingrédient au-delà. */
export const shortListPoints = (count: number) => Math.max(0, 10 - 2 * Math.max(0, count - 5))
/** Défauts cumulés d'un critère « sans… ni… » : aucun = plein, un = la moitié (arrondie au-dessous), deux ou plus = 0. */
const flawPoints = (max: number, flaws: number) => (flaws === 0 ? max : flaws === 1 ? Math.floor(max / 2) : 0)

const LABELS: Record<string, string> = {
  'friandise-premier-ingredient': 'Premier ingrédient',
  'friandise-part-animale': 'Part de viande ou de poisson déclarée',
  'friandise-sucres': 'Sucres ajoutés',
  'friandise-additifs': 'Colorants, conservateurs et arômes',
  'friandise-sel': 'Sel ajouté',
  'friandise-liste': 'Longueur de la liste',
  'friandise-glycerine': 'Glycérine et origine animale non nommée',
  'friandise-cereales': 'Céréale ou farine en tête',
}
const MAX: Record<string, number> = {
  'friandise-premier-ingredient': 20,
  'friandise-part-animale': 15,
  'friandise-sucres': 15,
  'friandise-additifs': 15,
  'friandise-sel': 10,
  'friandise-liste': 10,
  'friandise-glycerine': 10,
  'friandise-cereales': 5,
}
export const TREAT_CRITERIA = Object.keys(MAX) as CriterionId[]

export function scoreTreat(label: ExtractedLabel): ScoreResult {
  const ing = label.ingredients
  const texts = [...ing.map((i) => i.nom), ...label.additifs]
  const treat = { allowance: treatAllowance(label.energie), alerts: treatAlerts(texts) }
  const base = { version: TREAT_SCORE_VERSION, kind: 'treat' as const, assumptions: [], dryMatter: null, treat }
  if (label.espece === 'chat')
    return { ...base, score: null, band: null, criteria: [], missing: [], notice: 'Cette friandise est destinée au chat : notre barème note les produits pour chien.' }
  if (ing.length === 0) {
    const criteria = TREAT_CRITERIA.map((id) => ({ id, label: LABELS[id], max: MAX[id], points: null, explanation: 'Liste des ingrédients absente ou illisible : critère non évalué.' }))
    return { ...base, score: null, band: null, criteria, missing: ['liste des ingrédients'], notice: 'La composition manque : sans elle, pas de note.' }
  }
  const criteria: Criterion[] = []
  const add = (id: CriterionId, points: number, explanation: string) => criteria.push({ id, label: LABELS[id], max: MAX[id], points, explanation })

  const first = ing[0]
  // Peau, cuir, corne, sabot, oreille, tendon, nerf, os : une partie à mâcher, pas de la viande
  const meat = (name: string) => (isChewPart(name) ? null : animalKind(name))
  const kind = meat(first.nom)
  if (isChewPart(first.nom))
    add('friandise-premier-ingredient', 4, `${quote(first.nom)} : une partie à mâcher (peau, cuir, corne, os…), comptée comme un sous-produit, pas comme de la viande.`)
  else if (kind === 'nommee') add('friandise-premier-ingredient', 20, `${quote(first.nom)} : une viande ou un poisson dont l'espèce est nommée.`)
  else if (kind === 'non-nommee')
    add('friandise-premier-ingredient', isByProduct(first.nom) ? 4 : 9, `${quote(first.nom)} : origine animale, mais l'espèce n'est pas précisée${speciesInDetailOnly(first.nom) ? ' (celle citée entre parenthèses n\'en désigne qu\'une partie)' : ''}.`)
  else add('friandise-premier-ingredient', 0, `${quote(first.nom)} : l'ingrédient le plus lourd de la recette n'est ni une viande ni un poisson.`)

  // Part animale : pourcentages écrits, part annoncée, ou recette faite seulement de viande ou de
  // poisson. Les parties à mâcher n'y entrent pas.
  const animal = ing.filter((i) => meat(i.nom) !== null)
  const chew = ing.find((i) => isChewPart(i.nom))
  const declared = animal.filter((i) => i.pourcentage !== null).reduce((s, i) => s + (i.pourcentage ?? 0), 0)
  const onlyAnimal = animal.length === ing.length
  const share = onlyAnimal ? 100 : Math.min(100, Math.max(declared, chew ? 0 : label.partAnimaleDeclaree ?? 0))
  if (share <= 0)
    add('friandise-part-animale', 0, chew
      ? `${quote(chew.nom)} est une partie à mâcher : elle ne compte pas comme viande, et aucune part de viande ou de poisson n'est écrite.`
      : 'Aucun pourcentage de viande ou de poisson n\'est écrit : impossible de savoir combien la friandise en contient.')
  else
    add('friandise-part-animale', meatSharePoints(share), onlyAnimal
      ? `Tous les ingrédients sont de la viande ou du poisson : la recette en contient 100${P}.`
      : `${fmt(share)}${P} de viande ou de poisson déclarés sur l'étiquette.`)

  const sugar = texts.find(hasSugar)
  add('friandise-sucres', sugar ? 0 : 15, sugar ? `${quote(sugar)} : un sucre ajouté, il sert l'appétence, pas le chien.` : 'Aucun sucre, miel, sirop ni caramel repéré.')

  const colorant = texts.find(hasColorant)
  const preservative = controversialPreservatives(texts)[0] ?? texts.find(unnamedPreservative)
  const flavor = texts.find(hasArtificialFlavor)
  const flaws = [colorant && `colorant (${quote(colorant)})`, preservative && `conservateur ou antioxygène non nommé ou controversé (${preservative})`, flavor && `arôme artificiel (${quote(flavor)})`].filter((f): f is string => Boolean(f))
  add('friandise-additifs', flawPoints(15, flaws.length), flaws.length ? `Repéré : ${flaws.join(', ')}.` : 'Ni colorant, ni conservateur sans nom, ni arôme artificiel.')

  const salt = texts.find(hasSalt)
  add('friandise-sel', salt ? 0 : 10, salt ? `${quote(salt)} : du sel ajouté, le chien en trouve assez dans sa ration.` : 'Aucun sel ajouté repéré.')

  add('friandise-liste', shortListPoints(ing.length), ing.length <= 5 ? `${ing.length} ingrédient${ing.length > 1 ? 's' : ''} : une recette courte, facile à vérifier.` : `${ing.length} ingrédients : plus la liste est longue, plus la friandise s'éloigne d'un produit simple.`)

  const glycerin = texts.find(hasGlycerin)
  const byProduct = ing.find((i) => isByProduct(i.nom))
  const unnamed = ing.find((i) => isUnnamedAnimal(i.nom))
  const gFlaws = [glycerin && quote(glycerin), byProduct && quote(byProduct.nom), unnamed && quote(unnamed.nom)].filter((f): f is string => Boolean(f))
  const why = [glycerin && 'la glycérine garde la friandise moelleuse sans rien apporter au chien', (byProduct || unnamed) && 'l\'espèce ou la partie de l\'animal n\'est pas dite'].filter(Boolean).join(' ; ')
  add('friandise-glycerine', flawPoints(10, gFlaws.length), gFlaws.length ? `${gFlaws.join(', ')} : ${why}.` : 'Pas de glycérine, et chaque ingrédient animal indique son espèce.')

  const flourFirst = isCerealOrFlour(first.nom)
  add('friandise-cereales', flourFirst ? 0 : 5, flourFirst ? `${quote(first.nom)} : une céréale ou une farine forme la base de la friandise.` : 'Ni céréale ni farine en premier ingrédient.')

  const score = criteria.reduce((s, c) => s + (c.points ?? 0), 0)
  return { ...base, score, band: bandFor(score), criteria, missing: [], notice: null }
}
