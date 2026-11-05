// @cdc cluster scanner — liens [ancre](adresse) des textes de classement et de page mère : adresse du site
// ou externe en https. Fonctions pures.

const LINK = /\[([^\]]+)\]\(((?:\/|https:\/\/)[^)]*)\)/g

export type InlinePart = { text: string } | { label: string; href: string; external: boolean }

export function inlineParts(text: string): InlinePart[] {
  const parts: InlinePart[] = []
  let last = 0
  for (const m of text.matchAll(LINK)) {
    if (m.index > last) parts.push({ text: text.slice(last, m.index) })
    parts.push({ label: m[1], href: m[2], external: m[2].startsWith('https://') })
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push({ text: text.slice(last) })
  return parts
}

/** Le texte sans ses liens, pour le JSON-LD. */
export const inlinePlain = (text: string): string => inlineParts(text).map((p) => ('text' in p ? p.text : p.label)).join('')
