// @cdc lot 6 — limite de débit en mémoire (fenêtres glissantes), par clé. Suffit pour un seul
// processus Node sur le VPS ; le quota mensuel, lui, est en base (lib/server/scanner.ts).

const hits = new Map<string, number[]>()

/** Enregistre une tentative ; true si une des fenêtres est dépassée (la tentative est refusée). */
export function overLimit(key: string, limits: readonly { windowMs: number; max: number }[], now = Date.now()): boolean {
  const longest = Math.max(...limits.map((l) => l.windowMs))
  const recent = (hits.get(key) ?? []).filter((t) => now - t < longest)
  const exceeded = limits.some((l) => recent.filter((t) => now - t < l.windowMs).length >= l.max)
  if (!exceeded) recent.push(now)
  hits.set(key, recent)
  if (hits.size > 10_000) for (const [k, v] of hits) if (v.every((t) => now - t >= longest)) hits.delete(k)
  return exceeded
}
