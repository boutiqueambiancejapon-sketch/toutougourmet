import type { FoodNoun } from '../food-noun'
import type { ScoreResult } from '../score'
import type { ExtractedLabel } from '../types'
import { BAREMES_ACTIFS, BAREMES_VERSION } from './config'
import type { Classement } from './noter'
import { analyseBaremes } from './vers-score'

// @cdc scanner — raccord des fiches enregistrées aux nouveaux barèmes. Interrupteur éteint : la note et
// le détail en base, tels quels. Allumé : calcul en mémoire tant que la fiche n'est pas recalculée en base.

interface FicheNotee {
  score: number | null
  details: ScoreResult
  extracted: ExtractedLabel
}

export function noteCourante(r: FicheNotee, actif: boolean = BAREMES_ACTIFS): { score: number | null; details: ScoreResult } {
  if (!actif) return { score: r.score, details: r.details }
  const details = r.details.version === BAREMES_VERSION ? r.details : analyseBaremes(r.extracted)
  return { score: details.score, details }
}

/** Le classement décide de la liste : le sec et l'humide ne se comparent jamais. */
export const NOM_CLASSEMENT: Record<Classement, FoodNoun> = { sec: 'croquettes', humide: 'patee', friandise: 'friandise' }

/** Note seule, sans critère ni tranche : compléments, huiles, note de 0, ou pas de note. Toujours faux avec l'ancien barème. */
export const sansDetail = (d: Pick<ScoreResult, 'bareme' | 'criteria'>): boolean => d.bareme !== undefined && d.criteria.length === 0

/** Hors de toute liste publique : complément, huile, vétérinaire, ou fiche sans note fiable. Toujours faux avec l'ancien barème. */
export const horsListes = (d: Pick<ScoreResult, 'bareme'>): boolean => d.bareme !== undefined && d.bareme.classement === null
