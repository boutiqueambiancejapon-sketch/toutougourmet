import { readFile, access } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = process.cwd()

/** Polices locales (OFL, woff) : next/og ne lit ni woff2 ni Google Fonts. */
export async function loadOgFonts() {
  const font = (file: string) => readFile(path.join(ROOT, 'assets/og/fonts', file))
  const [display, body, bodyBold] = await Promise.all([
    font('fraunces-latin-900-normal.woff'),
    font('dm-sans-latin-500-normal.woff'),
    font('dm-sans-latin-700-normal.woff'),
  ])
  return [
    { name: 'Fraunces', data: display, weight: 900 as const, style: 'normal' as const },
    { name: 'DM Sans', data: body, weight: 500 as const, style: 'normal' as const },
    { name: 'DM Sans', data: bodyBold, weight: 700 as const, style: 'normal' as const },
  ]
}

/**
 * Photo d'une miniature en data URI JPEG, recadrée au format du panneau photo.
 * Le moteur de rendu de next/og n'affiche pas le WebP : tout passe par sharp.
 * Renvoie null si le fichier n'existe pas (slot pas encore généré).
 */
export async function loadOgPhoto(
  publicPath: string,
  width: number,
  height: number,
  crop: 'centre' | 'entropy' = 'centre',
): Promise<string | null> {
  const file = path.join(ROOT, 'public', publicPath)
  try {
    await access(file)
  } catch {
    return null
  }
  const position = crop === 'entropy' ? sharp.strategy.entropy : 'centre'
  const jpeg = await sharp(file).resize(width * 2, height * 2, { fit: 'cover', position }).jpeg({ quality: 80 }).toBuffer()
  return `data:image/jpeg;base64,${jpeg.toString('base64')}`
}

/** PNG de next/og → JPEG : 3 à 5 fois plus léger, sous la limite des aperçus WhatsApp. */
export async function pngResponseToJpeg(response: Response): Promise<Response> {
  const png = Buffer.from(await response.arrayBuffer())
  const jpeg = await sharp(png).jpeg({ quality: 85, mozjpeg: true }).toBuffer()
  return new Response(new Uint8Array(jpeg), {
    headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=31536000, immutable' },
  })
}
