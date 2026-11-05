import { BAREMES_ACTIFS } from './baremes/config'
import { chiffresIncoherents } from './baremes/controle-lecture'
import { estVeterinaire } from './baremes/veterinaire'
import type { PhotoPart } from './result'
import type { ExtractedLabel } from './types'

// @cdc lot 6 — que faire d'une lecture de photos : la refuser sans la décompter (pas une
// étiquette, floue, chat), demander la partie manquante, ou la noter. Une friandise est notée par
// son propre barème (lib/scanner/score-treat.ts), qui n'a besoin que de la composition.
// Fonction pure, testée par scripts/test-scanner-score.ts.

export type ExtractionOutcome =
  | { kind: 'reject'; code: 'not_a_label' | 'blurry' | 'cat_food' | 'recheck' }
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
  // Nouveaux barèmes : type et nom lus sur un devant de paquet, le petit texte seul est flou. On demande le dos.
  const type = baremes ? label.typeProduit ?? null : null
  const known = type !== null && type !== 'autre' && type !== 'indetermine'
  const frontOnly = known && ingredients === 0 && !hasAnalysis && !unreliable && Boolean(label.marque || label.produit)
  if (label.lisibilite === 'floue' && !frontOnly && ((ingredients === 0 && !hasAnalysis) || unreliable)) return { kind: 'reject', code: 'blurry' }
  // Nouveaux barèmes : typeProduit décide. Test réel du 2026-11-05 : Gemini répond typeImage « autre » pour les huiles.
  if (!label.estUneEtiquette || (label.typeImage === 'autre' && !known)) return { kind: 'reject', code: 'not_a_label' }
  if (label.typeImage === 'aliment-chat' || (label.espece === 'chat' && label.typeImage !== 'aliment-chien')) return { kind: 'reject', code: 'cat_food' }
  // Nouveaux barèmes : seul un aliment à noter a besoin de l'analyse.
  if (type === 'autre') return { kind: 'reject', code: 'not_a_label' }
  const needsAnalysis = type ? type === 'aliment' && !label.alimentVeterinaire : label.typeImage !== 'friandise'
  // Vétérinaire : pas de note de toute façon, inutile de demander le dos.
  const veterinary = known && (label.alimentVeterinaire === true || estVeterinaire({ marque: label.marque, produit: label.produit }))
  if (veterinary) return { kind: 'complete' }
  if (known && chiffresIncoherents(label)) return { kind: 'reject', code: 'recheck' }
  const missing: PhotoPart[] = []
  if (ingredients === 0) missing.push('ingredients')
  if (!hasAnalysis && needsAnalysis) missing.push('analyse')
  return missing.length ? { kind: 'incomplete', missing, read: { ingredients, constituants } } : { kind: 'complete' }
}

/** Rien d'utile lu (ex. seulement le devant du sac) : la session n'est pas décomptée. */
export const nothingRead = (o: ExtractionOutcome) => o.kind === 'incomplete' && o.read.ingredients === 0 && o.read.constituants === 0
