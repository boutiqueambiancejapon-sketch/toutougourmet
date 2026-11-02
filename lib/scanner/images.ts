import sharp from 'sharp'
import { MAX_IMAGE_BYTES, MAX_IMAGE_SIDE } from './config'
import { ScannerError, type LabelImage } from './types'

// @cdc lot 6 — contrôle des photos côté serveur, en mémoire uniquement (jamais d'écriture sur
// disque ni en base). Le type est lu dans les premiers octets, pas dans le nom ni l'en-tête
// envoyés par le navigateur. Re-encodage JPEG : retire les métadonnées (EXIF, position GPS) et
// réduit la taille envoyée au fournisseur. HEIC que sharp ne sait pas lire : transmis tel quel.

type Sniffed = LabelImage['mimeType']

export function sniffImageType(buf: Buffer): Sniffed | null {
  if (buf.length < 12) return null
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg'
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png'
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'image/webp'
  if (buf.toString('ascii', 4, 8) === 'ftyp') {
    const brand = buf.toString('ascii', 8, 12)
    if (['heic', 'heix', 'hevc', 'hevx', 'heim', 'heis'].includes(brand)) return 'image/heic'
    if (['mif1', 'msf1', 'heif'].includes(brand)) return 'image/heif'
  }
  return null
}

export async function prepareImage(file: File): Promise<LabelImage> {
  if (file.size === 0) throw new ScannerError('bad_request', 'Photo vide')
  if (file.size > MAX_IMAGE_BYTES) throw new ScannerError('too_large', 'Photo trop lourde')
  const buf = Buffer.from(await file.arrayBuffer())
  const type = sniffImageType(buf)
  if (!type) throw new ScannerError('bad_type', 'Format non accepté')
  try {
    const data = await sharp(buf, { failOn: 'error', limitInputPixels: 50_000_000 })
      .rotate()
      .resize({ width: MAX_IMAGE_SIDE, height: MAX_IMAGE_SIDE, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer()
    return { mimeType: 'image/jpeg', data }
  } catch {
    if (type === 'image/heic' || type === 'image/heif') return { mimeType: type, data: buf }
    throw new ScannerError('bad_type', 'Image illisible')
  }
}
