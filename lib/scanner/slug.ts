// @cdc lot 6 — EAN et adresses des fiches /croquettes/[slug] (fonctions pures).

/** Vérifie la clé de contrôle d'un EAN-8 ou EAN-13. */
export function isValidEan(value: string | null | undefined): value is string {
  if (!value || !/^(\d{8}|\d{13})$/.test(value)) return false
  const digits = value.split('').map(Number)
  const check = digits.pop() as number
  const sum = digits.reverse().reduce((s, d, i) => s + d * (i % 2 === 0 ? 3 : 1), 0)
  return (10 - (sum % 10)) % 10 === check
}

export function cleanEan(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const digits = value.replace(/\D/g, '')
  return isValidEan(digits) ? digits : null
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '')
}

export function baseSlug(brand: string | null, product: string | null, ean: string | null): string {
  const s = slugify([brand, product].filter(Boolean).join(' '))
  if (s.length >= 3) return s
  return ean ? `croquettes-${ean}` : 'croquettes'
}
