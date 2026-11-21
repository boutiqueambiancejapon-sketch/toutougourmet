// @cdc tableau de bord SEO — échelles des graphiques : graduations rondes (0 / 25 / 50…), une seule échelle par graphique.

export function niceTicks(min: number, max: number, count = 4): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1]
  if (max === min) max = min + 1
  const raw = (max - min) / count
  const mag = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag
  const start = Math.floor(min / step) * step
  const out: number[] = []
  for (let v = start; v <= max + step * 0.001; v += step) out.push(Math.round(v * 1000) / 1000)
  if (out[out.length - 1] < max) out.push(Math.round((out[out.length - 1] + step) * 1000) / 1000)
  return out
}

/** Indices des étiquettes de l'axe des dates : au plus n, réparties, la dernière toujours montrée. */
export function labelIndices(length: number, n: number): number[] {
  if (length <= n) return Array.from({ length }, (_, i) => i)
  const step = Math.ceil((length - 1) / (n - 1))
  const out: number[] = []
  for (let i = 0; i < length - step / 2; i += step) out.push(i)
  out.push(length - 1)
  return out
}
