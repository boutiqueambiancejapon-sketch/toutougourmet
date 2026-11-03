import { ImageResponse } from 'next/og'
import sharp from 'sharp'
import type { FoodAnalysis } from '@/db/schema'
import { jpegToPdf } from '@/lib/scanner/pdf'
import { loadOgFonts } from './assets'
import { ficheA4Data } from './fiche/data'
import { FicheA4 } from './fiche/FicheA4'
import { QR_LINK } from './fiche/FicheA4Bottom'
import { A4_PX } from './fiche/scale'
import { OG_COLORS } from './tokens'

// @cdc lot 6 — fiche d'un produit scanné en PDF d'une page A4, téléchargée en un geste
// (remplace l'impression du navigateur, pénible sur iPhone). next/og rend la page en PNG à 2×,
// sharp la passe en JPEG, lib/scanner/pdf.ts l'enveloppe dans un PDF écrit à la main.

const HEADERS = { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' }

export async function fichePdfResponse(row: FoodAnalysis): Promise<Response> {
  const fonts = await loadOgFonts()
  const data = ficheA4Data(row)
  const png = Buffer.from(await new ImageResponse(<FicheA4 d={data} />, { ...A4_PX, fonts }).arrayBuffer())
  const jpeg = await sharp(png).flatten({ background: OG_COLORS.cream }).jpeg({ quality: 82, mozjpeg: true, progressive: false }).toBuffer()
  const pdf = jpegToPdf({
    jpeg: new Uint8Array(jpeg),
    ...A4_PX,
    title: `${[row.brand, row.product].filter(Boolean).join(' ') || 'Croquettes'} : fiche Toutou Gourmet`,
    links: [{ ...QR_LINK, url: data.url }],
  })
  return new Response(pdf, {
    headers: {
      ...HEADERS,
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="toutou-gourmet-${row.slug}.pdf"`,
      'Content-Length': String(pdf.length),
      'X-Robots-Tag': 'noindex',
    },
  })
}
