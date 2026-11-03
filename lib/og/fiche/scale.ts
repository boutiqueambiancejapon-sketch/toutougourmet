// @cdc lot 6 — fiche A4 du PDF : rendue à 2× (≈ 200 dpi) pour rester nette à l'impression.
// Les composants raisonnent en pixels « page » (827 × 1170) multipliés par u().

export const A4_SCALE = 2
export const A4_PX = { width: 827 * A4_SCALE, height: 1170 * A4_SCALE } as const
export const u = (n: number) => n * A4_SCALE
