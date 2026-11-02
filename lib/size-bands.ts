// Portions par gabarit lues dans le tableau <SizeRow> de l'article (même source que le texte),
// pour que le mini-calculateur affiche exactement la portion conseillée par l'article.

export interface SizeBand {
  /** Poids mini inclus (kg) */
  min: number
  /** Poids maxi exclu (kg), null = sans limite */
  max: number | null
  gMin: number
  gMax: number
  frequency?: string
}

const num = (s: string) => Number(s.replace(',', '.'))

function parseWeight(label: string): [number, number | null] | null {
  const n = [...label.matchAll(/(\d+(?:[.,]\d+)?)/g)].map((m) => num(m[1]))
  if (n.length === 0) return null
  if (/^(moins|<|jusqu)/i.test(label.trim())) return [0, n[0]]
  if (/^(plus|>|au-delà|à partir)/i.test(label.trim())) return [n[0], null]
  return n.length >= 2 ? [n[0], n[1]] : null
}

function parseGrams(amount: string): [number, number] | null {
  const range = /(\d+(?:[.,]\d+)?)\s*(?:à|-|–)\s*(\d+(?:[.,]\d+)?)\s*g\b/.exec(amount)
  if (range) return [num(range[1]), num(range[2])]
  const single = /(\d+(?:[.,]\d+)?)\s*g\b/.exec(amount)
  return single ? [num(single[1]), num(single[1])] : null
}

/** Tranches du premier <SizeTable> de l'article, ou [] si une ligne n'a pas de grammes lisibles. */
export function extractSizeBands(mdx: string): SizeBand[] {
  const bands: SizeBand[] = []
  for (const m of mdx.matchAll(/<SizeRow\b([^>]*)\/>/g)) {
    const attr = (name: string) => new RegExp(`${name}="([^"]*)"`).exec(m[1])?.[1]
    const w = parseWeight(attr('weight') ?? '')
    const g = parseGrams(attr('amount') ?? '')
    if (!w || !g) return []
    bands.push({ min: w[0], max: w[1], gMin: g[0], gMax: g[1], frequency: attr('frequency') })
  }
  return bands
}

export function bandFor(bands: SizeBand[], kg: number): SizeBand | undefined {
  return bands.find((b) => kg >= b.min && (b.max === null || kg < b.max)) ?? bands.at(-1)
}
