import type { TeneurEpaDha } from './teneur'

// @cdc scanner — alertes de sécurité propres aux huiles et aux compléments (décision du 2026-11-05).
// Affichées avec la note et le message, comme les autres alertes de sécurité.

/** Valeur NRC via Bauer 2011 pour un chien de 10 kg. Sert à alerter, pas à conseiller une dose. */
export const NRC_LIMITE_10KG = 2080

export const ALERTE_MORUE = 'Huile de foie de morue : riche en vitamines A et D, à ne pas cumuler avec un autre complément qui en apporte.'
export const ALERTE_LIMITE_NRC = 'Pour un chien de 10 kg, la ration écrite dépasse la limite haute NRC, si le chiffre annoncé est exact. Pas un conseil de dose.'

/** mg d'EPA + DHA apportés par la ration écrite pour 10 kg. Null sans teneur complète ni ration. */
export function mgEpaDha10kg(t: TeneurEpaDha, ration10kgG: number | null | undefined): number | null {
  if (t.epaDhaPct === null || t.partiel || !ration10kgG) return null
  return (ration10kgG * t.epaDhaPct * 1000) / 100
}
