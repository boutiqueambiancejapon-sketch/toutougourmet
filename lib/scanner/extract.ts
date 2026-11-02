import { MAX_IMAGES } from './config'
import { geminiProvider } from './providers/gemini'
import { ScannerError, type ExtractionResult, type LabelImage, type LabelProvider } from './types'

// @cdc lot 6 — lecture d'étiquette indépendante du fournisseur. SCANNER_PROVIDER choisit le
// fournisseur (gemini par défaut). Ajouter un fournisseur (ex. anthropic avec @anthropic-ai/sdk) :
// un fichier lib/scanner/providers/<nom>.ts qui exporte un LabelProvider (même consigne et même
// schéma : lib/scanner/label-schema.ts, sortie passée par parseExtractedLabel), puis une ligne
// dans PROVIDERS. Rien d'autre ne change : route, base et note ne connaissent que ExtractedLabel.

const PROVIDERS: Record<string, LabelProvider> = {
  gemini: geminiProvider,
}

/** Délai maximal d'un appel au fournisseur, en millisecondes. */
export const EXTRACT_TIMEOUT_MS = Number(process.env.SCANNER_TIMEOUT_MS) || 30_000

export function scannerProvider(): LabelProvider {
  const name = (process.env.SCANNER_PROVIDER || 'gemini').toLowerCase()
  const provider = PROVIDERS[name]
  if (!provider) throw new ScannerError('unavailable', `Fournisseur de lecture inconnu : ${name}`)
  return provider
}

export async function extractLabel(images: LabelImage[]): Promise<ExtractionResult> {
  if (images.length === 0 || images.length > MAX_IMAGES) throw new ScannerError('bad_request', '1 à 3 images attendues')
  return scannerProvider().extract(images, AbortSignal.timeout(EXTRACT_TIMEOUT_MS))
}
