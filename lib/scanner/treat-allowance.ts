import { calculateDailyCalories, dogSizeRanges } from '@/lib/calculators'
import type { TreatInfo, TreatAllowanceRow } from './score'
import type { LabelEnergy } from './types'

// @cdc lot 6 — combien de friandises par jour, par gabarit. Plafond : 10 % de l'apport calorique
// du jour (FEDIAF, Nutritional Guidelines 2021, friandises et aliments complémentaires). Besoin du
// jour : même formule que le calculateur de ration (lib/calculators.ts, NRC 2006), chien adulte
// non stérilisé à activité normale, au poids de référence du gabarit (dogSizeRanges.midKg).
// Fonction pure, testée par scripts/test-scanner-treat.ts.

/** Part maximale de l'apport calorique du jour venant des friandises (FEDIAF). */
export const TREAT_SHARE = 0.1

const SIZES = ['petit', 'moyen', 'grand'] as const
const SIZE_LABELS: Record<(typeof SIZES)[number], string> = { petit: 'Petit chien', moyen: 'Chien moyen', grand: 'Grand chien' }

/** Énergie pour 100 g et par pièce, à partir de ce qui est écrit (kcal/kg, kcal/100 g, par pièce). */
export function treatEnergy(e: LabelEnergy | null | undefined): { kcal100g: number | null; kcalPiece: number | null } {
  if (!e) return { kcal100g: null, kcalPiece: null }
  const kcal100g = e.kcal100g ?? (e.kcalKg !== null ? Math.round(e.kcalKg) / 10 : null)
  const fromWeight = kcal100g !== null && e.poidsPieceG !== null ? Math.round(kcal100g * e.poidsPieceG) / 100 : null
  return { kcal100g, kcalPiece: e.kcalPiece ?? fromWeight }
}

export function treatAllowance(e: LabelEnergy | null | undefined): TreatInfo['allowance'] {
  const { kcal100g, kcalPiece } = treatEnergy(e)
  if (kcal100g === null && kcalPiece === null) return null
  const rows: TreatAllowanceRow[] = SIZES.map((size) => {
    const weightKg = dogSizeRanges[size].midKg
    const dailyKcal = calculateDailyCalories({ animal: 'chien', weightKg, ageGroup: 'adulte', activityLevel: 'normal', sterilized: false })
    const capKcal = Math.round(dailyKcal * TREAT_SHARE)
    return {
      size,
      label: SIZE_LABELS[size],
      weightKg,
      dailyKcal,
      capKcal,
      pieces: kcalPiece !== null ? Math.floor(capKcal / kcalPiece) : null,
      grams: kcal100g !== null ? Math.round((capKcal / kcal100g) * 100) : null,
    }
  })
  return { kcalPiece, kcal100g, rows }
}

/** « 3 friandises », « moins d'une friandise », ou « 25 g » quand le poids d'une pièce manque. */
export function allowanceText(row: TreatAllowanceRow): string {
  if (row.pieces !== null) return row.pieces === 0 ? 'moins d\'une friandise' : `${row.pieces} friandise${row.pieces > 1 ? 's' : ''}`
  return row.grams !== null ? `${row.grams} g` : 'non calculé'
}
