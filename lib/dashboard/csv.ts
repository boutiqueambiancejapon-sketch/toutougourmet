// @cdc tableau de bord — export CSV des inscrits : séparateur « ; » et BOM UTF-8 (ouverture
// directe dans Excel en français et dans Numbers). Une cellule qui commence par = + - @ est
// préfixée d'une apostrophe, pour qu'un tableur ne l'exécute pas comme une formule.

export type CsvValue = string | number | boolean | null

function cell(value: CsvValue): string {
  let s = value === null ? '' : typeof value === 'boolean' ? (value ? 'oui' : 'non') : String(value)
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return /[";\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCsv(header: string[], rows: CsvValue[][]): string {
  return `﻿${[header, ...rows].map((r) => r.map(cell).join(';')).join('\r\n')}\r\n`
}

const stamp = new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' })

/** Date et heure de Paris, lisibles dans un tableur (2026-11-03 10:37). */
export function csvDate(value: Date | string): string {
  const d = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return ''
  const time = d.toLocaleTimeString('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit' })
  return `${stamp.format(d)} ${time}`
}

export function csvFileName(kind: string, now = new Date()): string {
  return `toutou-${kind}-${stamp.format(now)}.csv`
}
