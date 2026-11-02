import { cleanEan } from './slug'

// @cdc lot 6 — lecture du code-barres dans le navigateur. API BarcodeDetector quand elle existe
// et lit l'EAN (Chrome Android, Safari récent), sinon le polyfill barcode-detector (zxing-wasm),
// chargé à la demande sur ce parcours seulement. Le fichier .wasm est servi par le site
// (public/vendor/zxing, même version que zxing-wasm dans package-lock) : aucun appel à un CDN.
// Rien ne quitte le navigateur : seule la suite de chiffres lue est envoyée ensuite au serveur.

export const ZXING_WASM_URL = '/vendor/zxing/zxing_reader-3.1.6.wasm'
const FORMATS = ['ean_13', 'ean_8', 'upc_a'] as const

interface Detected {
  rawValue: string
  format: string
}
export interface Detector {
  detect(source: ImageBitmapSource): Promise<Detected[]>
}
interface DetectorCtor {
  new (opts: { formats: string[] }): Detector
  getSupportedFormats?: () => Promise<string[]>
}

let cached: Promise<Detector> | null = null

async function nativeDetector(): Promise<Detector | null> {
  const Ctor = (globalThis as unknown as { BarcodeDetector?: DetectorCtor }).BarcodeDetector
  if (!Ctor?.getSupportedFormats) return null
  try {
    const supported = await Ctor.getSupportedFormats()
    if (!supported.includes('ean_13')) return null
    return new Ctor({ formats: FORMATS.filter((f) => supported.includes(f)) })
  } catch {
    return null
  }
}

async function polyfillDetector(): Promise<Detector> {
  const mod = await import('barcode-detector/ponyfill')
  mod.setZXingModuleOverrides({
    locateFile: (path: string, prefix: string) => (path.endsWith('.wasm') ? new URL(ZXING_WASM_URL, window.location.origin).href : prefix + path),
  })
  return new mod.BarcodeDetector({ formats: [...FORMATS] })
}

/** Détecteur prêt à l'emploi (natif ou polyfill), créé une seule fois par page. */
export function getDetector(): Promise<Detector> {
  cached ??= nativeDetector().then((d) => d ?? polyfillDetector())
  cached.catch(() => {
    cached = null
  })
  return cached
}

/** UPC-A (12 chiffres, produits nord-américains) → EAN-13 avec un 0 devant ; contrôle de la clé. */
export function normalizeCode(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  return cleanEan(digits.length === 12 ? `0${digits}` : digits)
}

/** Premier code-barres valide trouvé sur une image (vidéo, photo), sinon null. */
export async function decodeSource(source: ImageBitmapSource): Promise<string | null> {
  const detector = await getDetector()
  const found = await detector.detect(source)
  for (const code of found) {
    const ean = normalizeCode(code.rawValue)
    if (ean) return ean
  }
  return null
}

/** Code-barres lu sur une photo choisie (repli quand la caméra est refusée). */
export async function decodeFile(file: Blob): Promise<string | null> {
  const bitmap = await createImageBitmap(file)
  try {
    return await decodeSource(bitmap)
  } finally {
    bitmap.close()
  }
}
