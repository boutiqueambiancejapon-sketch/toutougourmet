import { noteAliment } from './aliment'
import { classer } from './classer'
import { noteComplement } from './complement'
import { noteFriandise } from './friandise'
import { noteHuile } from './huile'
import { estHumide, matiereSeche } from './matiere-seche'
import { securite } from './securite'
import { MSG_CONSEIL, MSG_DOS, MSG_VETERINAIRE, vide, type Entree, type Resultat, type TypeProduit } from './types'
import { estVeterinaire } from './veterinaire'

// @cdc scanner — porte d'entrée des quatre barèmes.

/** Sécurité d'abord, puis aliment vétérinaire, puis le barème du type. */
export function noter(e: Entree, type: TypeProduit = classer(e)): Resultat {
  const sec = securite(e)
  if (type === 'autre') return vide('autre', 'Ce produit ne se mange pas : pas de note.')
  if (estVeterinaire(e)) return vide(type, MSG_VETERINAIRE, sec.alertes)
  if (type === 'indetermine') return vide('indetermine', 'Type de produit incertain : pas de note.', sec.alertes)
  if (e.ingredients.length === 0) return vide(type, MSG_DOS, sec.alertes)
  if (sec.zero) return { type, note: 0, fiabilite: 'haute', criteres: [], plafond: { valeur: 0, raison: sec.zero.raison }, alertes: sec.alertes, message: type === 'complement' || type === 'huile' ? `${sec.zero.raison} ${MSG_CONSEIL}` : sec.zero.raison, horsClassement: true }
  const r = type === 'aliment' ? noteAliment(e) : type === 'friandise' ? noteFriandise(e) : type === 'complement' ? noteComplement(e) : noteHuile(e)
  const alertes = [...sec.alertes, ...r.alertes]
  let { note, plafond } = r
  if (sec.plafond && note !== null && note > sec.plafond.valeur) { note = sec.plafond.valeur; plafond = sec.plafond }
  else if (sec.plafond && !plafond) plafond = sec.plafond
  return { ...r, note, plafond, alertes }
}

export type Classement = 'sec' | 'humide' | 'friandise'

/** Classements séparés (décision du 2026-11-05) : le sec et l'humide ne se comparent pas. Compléments et huiles : aucun classement. */
export function classementDe(e: Entree, r: Resultat): Classement | null {
  if (r.note === null || r.horsClassement) return null
  if (r.type === 'friandise') return 'friandise'
  if (r.type !== 'aliment') return null
  const h = matiereSeche(e).h
  if (estHumide(e, h)) return 'humide'
  return e.typeAliment === 'sec' || h !== null ? 'sec' : null
}
