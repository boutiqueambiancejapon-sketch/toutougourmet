// @cdc lot 6 — PDF d'une page A4 qui enveloppe une image JPEG pleine page (fiche d'un produit
// scanné). Écrit à la main, sans dépendance : Catalog, Pages, Page, XObject Image /DCTDecode
// (le JPEG est copié tel quel), flux de contenu, liens cliquables, Info, table xref.
// Fonction pure, sans import : testée par lib/scanner/pdf.test.mjs (node --test).

/** A4 en points PDF (1/72 de pouce). */
export const A4_POINTS = { width: 595.28, height: 841.89 } as const

export interface PdfLink {
  /** Rectangle en fraction de la page (0 à 1), origine en haut à gauche comme l'image. */
  x: number
  y: number
  width: number
  height: number
  url: string
}

export interface JpegPdfInput {
  jpeg: Uint8Array
  /** Dimensions en pixels du JPEG. */
  width: number
  height: number
  title?: string
  links?: PdfLink[]
}

const encoder = new TextEncoder()
const num = (n: number) => String(Math.round(n * 100) / 100)

/** Chaîne PDF en UTF-16BE (accents des titres) : <FEFF...>. */
function utf16Hex(text: string): string {
  let hex = 'FEFF'
  for (let i = 0; i < text.length; i++) hex += text.charCodeAt(i).toString(16).padStart(4, '0').toUpperCase()
  return `<${hex}>`
}

/** Chaîne littérale ASCII (URL) : parenthèses et barres obliques inverses échappées. */
function literal(text: string): string {
  return `(${text.replace(/[^\x20-\x7e]/g, encodeURIComponent).replace(/([\\()])/g, '\\$1')})`
}

export function jpegToPdf({ jpeg, width, height, title, links = [] }: JpegPdfInput): Uint8Array<ArrayBuffer> {
  const { width: W, height: H } = A4_POINTS
  const annotIds = links.map((_, i) => 7 + i)
  const content = `q ${num(W)} 0 0 ${num(H)} 0 0 cm /Im0 Do Q\n`
  const objects: (string | Uint8Array)[][] = [
    ['<< /Type /Catalog /Pages 2 0 R >>'],
    ['<< /Type /Pages /Kids [3 0 R] /Count 1 >>'],
    [
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${num(W)} ${num(H)}] /Resources << /XObject << /Im0 4 0 R >> /ProcSet [/PDF /ImageC] >> /Contents 5 0 R${
        annotIds.length ? ` /Annots [${annotIds.map((id) => `${id} 0 R`).join(' ')}]` : ''
      } >>`,
    ],
    [
      `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,
      jpeg,
      '\nendstream',
    ],
    [`<< /Length ${encoder.encode(content).length} >>\nstream\n${content}endstream`],
    [`<< /Producer (Toutou Gourmet)${title ? ` /Title ${utf16Hex(title)}` : ''} >>`],
    ...links.map((l) => {
      const x1 = l.x * W
      const y1 = (1 - l.y - l.height) * H
      const rect = [x1, y1, x1 + l.width * W, y1 + l.height * H].map(num).join(' ')
      return [`<< /Type /Annot /Subtype /Link /Rect [${rect}] /Border [0 0 0] /A << /S /URI /URI ${literal(l.url)} >> >>`]
    }),
  ]

  const chunks: Uint8Array[] = []
  let offset = 0
  const push = (part: string | Uint8Array) => {
    const bytes = typeof part === 'string' ? encoder.encode(part) : part
    chunks.push(bytes)
    offset += bytes.length
  }
  // En-tête + commentaire binaire : signale aux outils un fichier à ne pas traiter comme du texte.
  push('%PDF-1.4\n')
  push(new Uint8Array([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]))
  const offsets: number[] = []
  objects.forEach((parts, i) => {
    offsets.push(offset)
    push(`${i + 1} 0 obj\n`)
    parts.forEach(push)
    push('\nendobj\n')
  })
  const xref = offset
  // Chaque entrée de la table fait exactement 20 octets (fin de ligne « espace + \n »).
  push(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`)
  offsets.forEach((o) => push(`${String(o).padStart(10, '0')} 00000 n \n`))
  push(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xref}\n%%EOF\n`)

  const out = new Uint8Array(offset)
  let at = 0
  for (const c of chunks) {
    out.set(c, at)
    at += c.length
  }
  return out
}
