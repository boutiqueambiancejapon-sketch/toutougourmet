import { MAX_IMAGE_SIDE } from './config'

// @cdc lot 6 — réduction des photos dans le navigateur avant envoi (moins de données mobiles,
// envoi plus rapide). Si le navigateur ne sait pas décoder le format (HEIC hors Safari),
// la photo part telle quelle : le serveur la contrôle et la convertit.

export async function shrinkPhoto(file: File): Promise<Blob> {
  if (typeof createImageBitmap !== 'function') return file
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(bitmap.width, bitmap.height))
    if (scale === 1 && file.type === 'image/jpeg' && file.size < 1_500_000) {
      bitmap.close()
      return file
    }
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85))
    return blob && blob.size < file.size ? blob : file
  } catch {
    return file
  }
}

interface DetectedBarcode {
  rawValue: string
}
interface BarcodeDetectorLike {
  detect(source: ImageBitmapSource): Promise<DetectedBarcode[]>
}
type BarcodeDetectorCtor = new (opts: { formats: string[] }) => BarcodeDetectorLike

/** Lit le code-barres d'une photo quand le navigateur sait le faire (Chrome Android), sinon null. */
export async function readBarcode(file: File): Promise<string | null> {
  const Ctor = (globalThis as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector
  if (!Ctor) return null
  try {
    const bitmap = await createImageBitmap(file)
    const codes = await new Ctor({ formats: ['ean_13', 'ean_8'] }).detect(bitmap)
    bitmap.close()
    return codes[0]?.rawValue ?? null
  } catch {
    return null
  }
}
