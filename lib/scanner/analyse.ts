import { BAREMES_ACTIFS, BAREMES_VERSION } from './baremes/config'
import { analyseBaremes } from './baremes/vers-score'
import { kindOf, scoreLabel, SCORE_VERSION, type ProductKind, type ScoreResult } from './score'
import { scoreTreat, TREAT_SCORE_VERSION } from './score-treat'
import type { ExtractedLabel } from './types'

// @cdc lot 6 — aiguillage entre les deux barèmes : friandise, snack ou aliment complémentaire
// (typeImage « friandise ») → lib/scanner/score-treat.ts ; croquettes et pâtées → score.ts.
// Les deux notes ne se mélangent jamais (classement /croquettes séparé). Fonction pure.

export const productKind = (label: Pick<ExtractedLabel, 'typeImage'>): ProductKind => (label.typeImage === 'friandise' ? 'treat' : 'complete')

/** Version du barème qui s'applique à cette étiquette (recalcul en cache si elle a changé). */
export const scoreVersionFor = (label: Pick<ExtractedLabel, 'typeImage'>) => (BAREMES_ACTIFS ? BAREMES_VERSION : productKind(label) === 'treat' ? TREAT_SCORE_VERSION : SCORE_VERSION)

export function analyseLabel(label: ExtractedLabel): ScoreResult {
  if (BAREMES_ACTIFS) return analyseBaremes(label)
  return productKind(label) === 'treat' ? scoreTreat(label) : scoreLabel(label)
}

export const isTreat = (d: Pick<ScoreResult, 'kind'>) => kindOf(d) === 'treat'
