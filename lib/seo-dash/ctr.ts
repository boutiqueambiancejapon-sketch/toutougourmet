// @cdc tableau de bord SEO — taux de clic attendu selon la position moyenne (repère prudent pour un site
// d'information en France, résultats enrichis compris). Un repère, pas une promesse : sert à classer les pages
// qui reçoivent nettement moins de clics que leur place ne le laisse attendre.

const EXPECTED: Record<number, number> = { 1: 0.28, 2: 0.15, 3: 0.1, 4: 0.07, 5: 0.05, 6: 0.04, 7: 0.03, 8: 0.025, 9: 0.02, 10: 0.018 }

export function expectedCtr(position: number): number {
  const p = Math.max(1, Math.round(position))
  if (p <= 10) return EXPECTED[p]
  if (p <= 20) return 0.01
  return 0.003
}

/** Seuil d'affichages ramené à la longueur de la période (repère donné pour 28 jours). */
export function scaled(per28: number, days: number): number {
  return Math.max(5, Math.round((per28 * days) / 28))
}
