import type { ReactElement } from 'react'
import { ImageResponse } from 'next/og'
import sharp from 'sharp'
import { jpegToPdf } from '@/lib/scanner/pdf'
import type { SitterViewModel } from '@/lib/garde/view'
import { loadOgFonts } from './assets'
import { A4_PX } from './fiche/scale'
import { SitterA4 } from './garde/SitterA4'
import { TemplateA4 } from './garde/TemplateA4'
import { OG_COLORS } from './tokens'

// @cdc fiche de garde — PDF d'une page A4, même chaîne que la fiche croquette (lib/og/fiche-pdf) :
// next/og rend la page en PNG à 2×, sharp la passe en JPEG, lib/scanner/pdf.ts l'enveloppe.

async function a4Pdf(page: ReactElement, title: string): Promise<Uint8Array<ArrayBuffer>> {
  const fonts = await loadOgFonts()
  const png = Buffer.from(await new ImageResponse(page, { ...A4_PX, fonts }).arrayBuffer())
  const jpeg = await sharp(png).flatten({ background: OG_COLORS.cream }).jpeg({ quality: 82, mozjpeg: true, progressive: false }).toBuffer()
  return jpegToPdf({ jpeg: new Uint8Array(jpeg), ...A4_PX, title })
}

function pdfResponse(pdf: Uint8Array<ArrayBuffer>, filename: string, cache: string): Response {
  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(pdf.length),
      'Cache-Control': cache,
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}

const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'chien'

/** Fiche remplie : jamais en cache partagé (contenu privé, lien révocable). */
export async function sitterPdfResponse(m: SitterViewModel): Promise<Response> {
  const pdf = await a4Pdf(<SitterA4 m={m} />, `Fiche de garde de ${m.name}`)
  return pdfResponse(pdf, `fiche-de-garde-${slug(m.name)}.pdf`, 'private, no-store')
}

/** Modèle vierge : identique pour tout le monde. */
export async function templatePdfResponse(): Promise<Response> {
  const pdf = await a4Pdf(<TemplateA4 />, 'Fiche de garde pour chien à imprimer : Toutou Gourmet')
  return pdfResponse(pdf, 'fiche-de-garde-chien-a-imprimer.pdf', 'public, max-age=86400, stale-while-revalidate=604800')
}
