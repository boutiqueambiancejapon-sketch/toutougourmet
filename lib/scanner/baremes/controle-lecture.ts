import type { ExtractedLabel } from '../types'

// @cdc scanner — garde-fou sur les chiffres lus : la confiance de l'IA ne prévient pas d'un petit texte
// mal lu (test du 2026-11-05). Trois règles vérifiables, sinon « Reprends une photo du tableau », pas de note.
// Plages vérifiées sur 634 fiches réelles d'aliments et de friandises : aucune n'en sort (2026-11-05).

type Chiffres = ExtractedLabel['constituants']
type Plage = Partial<Record<keyof Chiffres, [number, number]>>

const SEC: Plage = { proteines: [10, 65], matieresGrasses: [2, 45], cendres: [0, 16], cellulose: [0, 20], humidite: [0, 35], calcium: [0, 5], phosphore: [0, 3] }
const HUMIDE: Plage = { proteines: [1, 25], matieresGrasses: [0, 25], cendres: [0, 8], cellulose: [0, 8], humidite: [55, 95], calcium: [0, 2], phosphore: [0, 1.5] }
const FRIANDISE: Plage = { proteines: [0, 95], matieresGrasses: [0, 65], cendres: [0, 35], cellulose: [0, 45], humidite: [0, 90] }
const HUILE: Plage = { proteines: [0, 5], matieresGrasses: [90, 100], cendres: [0, 5], cellulose: [0, 5], humidite: [0, 5] }

function plageDe(l: Pick<ExtractedLabel, 'typeProduit' | 'typeAliment' | 'constituants'>): Plage | null {
  if (l.typeProduit === 'friandise') return FRIANDISE
  if (l.typeProduit === 'huile') return HUILE
  if (l.typeProduit !== 'aliment') return null
  return l.typeAliment === 'humide' || (l.constituants.humidite ?? 0) >= 55 ? HUMIDE : SEC
}

/** Somme au-dessus de 100 % ou valeur hors plage pour ce type. Compléments : somme seulement, leurs recettes varient trop. */
export function chiffresIncoherents(l: Pick<ExtractedLabel, 'typeProduit' | 'typeAliment' | 'constituants'>): string | null {
  const c = l.constituants
  const somme = (c.proteines ?? 0) + (c.matieresGrasses ?? 0) + (c.cendres ?? 0) + (c.cellulose ?? 0) + (c.humidite ?? 0)
  if (somme > 102) return `somme de ${somme} %`
  const plage = plageDe(l)
  if (!plage) return null
  for (const [k, borne] of Object.entries(plage) as [keyof Chiffres, [number, number]][]) {
    const v = c[k]
    if (v !== null && (v < borne[0] || v > borne[1])) return `${k} à ${v} %`
  }
  return null
}

/** Chiffre lu loin de la fiche du même code-barres : plus de 1,5 point et plus de 20 %. */
export function differeDeLaFiche(lu: Chiffres, fiche: Chiffres): string | null {
  for (const k of ['proteines', 'matieresGrasses', 'cendres', 'cellulose', 'humidite'] as const) {
    const a = lu[k]
    const b = fiche[k]
    if (a !== null && b !== null && Math.abs(a - b) > Math.max(1.5, b * 0.2)) return `${k} lu ${a} %, fiche ${b} %`
  }
  return null
}
