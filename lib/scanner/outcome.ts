import { BAREMES_ACTIFS } from './baremes/config'
import type { PhotoPart } from './result'
import type { ExtractedLabel } from './types'

// @cdc lot 6 — que faire d'une lecture de photos : la refuser sans la décompter (pas une
// étiquette, floue, chat), demander la partie manquante, ou la noter. Une friandise est notée par
// son propre barème (lib/scanner/score-treat.ts), qui n'a besoin que de la composition.
// Fonction pure, testée par scripts/test-scanner-score.ts.

export type ExtractionOutcome =
  | { kind: 'reject'; code: 'not_a_label' | 'blurry' | 'cat_food' }
  | { kind: 'incomplete'; missing: PhotoPart[]; read: { ingredients: number; constituants: number } }
  | { kind: 'complete' }

export function classifyExtraction(label: ExtractedLabel, baremes: boolean = BAREMES_ACTIFS): ExtractionOutcome {
  const ingredients = label.ingredients.length
  const constituants = Object.values(label.constituants).filter((v) => v !== null).length
  const hasAnalysis = label.constituants.proteines !== null || label.constituants.matieresGrasses !== null
  // Floue d'abord : sur un texte illisible, l'espèce ou le type annoncés par l'IA sont des suppositions.
  // Test réel du 2026-11-02 : sur une photo floue, Gemini a « lu » 8 ingrédients et 7 chiffres tout en
  // les marquant douteux. Floue + liste ou 3 chiffres douteux = lecture inutilisable, non décomptée.
  const doubts = label.champsDouteux ?? []
  const unreliable = doubts.includes('ingredients') || doubts.filter((d) => d !== 'ingredients').length >= 3
  if (label.lisibilite === 'floue' && ((ingredients === 0 && !hasAnalysis) || unreliable)) return { kind: 'reject', code: 'blurry' }
  if (!label.estUneEtiquette || label.typeImage === 'autre') return { kind: 'reject', code: 'not_a_label' }
  if (label.typeImage === 'aliment-chat' || (label.espece === 'chat' && label.typeImage !== 'aliment-chien')) return { kind: 'reject', code: 'cat_food' }
  // Nouveaux barèmes : seul un aliment à noter a besoin de l'analyse.
  const type = baremes ? label.typeProduit ?? null : null
  if (type === 'autre') return { kind: 'reject', code: 'not_a_label' }
  const needsAnalysis = type ? type === 'aliment' && !label.alimentVeterinaire : label.typeImage !== 'friandise'
  const missing: PhotoPart[] = []
  if (ingredients === 0) missing.push('ingredients')
  if (!hasAnalysis && needsAnalysis) missing.push('analyse')
  return missing.length ? { kind: 'incomplete', missing, read: { ingredients, constituants } } : { kind: 'complete' }
}

/** Rien d'utile lu (ex. seulement le devant du sac) : la session n'est pas décomptée. */
export const nothingRead = (o: ExtractionOutcome) => o.kind === 'incomplete' && o.read.ingredients === 0 && o.read.constituants === 0
