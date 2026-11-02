import type { FoodAnalysis } from '@/db/schema'
import type { ScoreResult } from './score'
import type { ExtractedLabel, ScannerErrorCode } from './types'

// @cdc lot 6 — format de réponse de /api/scanner, partagé par la route et l'interface.

export interface ScanAnalysis {
  id: string
  slug: string
  brand: string | null
  product: string | null
  ean: string | null
  score: number | null
  details: ScoreResult
  label: Pick<ExtractedLabel, 'ingredients' | 'constituants' | 'additifs' | 'illisibles' | 'confiance'>
  analysedAt: string
}

export interface ScanQuota {
  used: number
  limit: number
}

export type ScanResponse =
  | { ok: true; analysis: ScanAnalysis; fromCache: boolean; quota: ScanQuota }
  | { ok: false; error: ScannerErrorCode; message: string; quota?: ScanQuota }

export function toScanAnalysis(row: FoodAnalysis): ScanAnalysis {
  const { ingredients, constituants, additifs, illisibles, confiance } = row.extracted
  return {
    id: row.id,
    slug: row.slug,
    brand: row.brand,
    product: row.product,
    ean: row.ean,
    score: row.score,
    details: row.details,
    label: { ingredients, constituants, additifs, illisibles, confiance },
    analysedAt: row.createdAt.toISOString(),
  }
}

export const ERROR_MESSAGES: Record<ScannerErrorCode, string> = {
  unauthorized: 'Connecte-toi pour lancer une analyse.',
  rate_limited: 'Trop d\'analyses d\'affilée. Attends une minute avant de recommencer.',
  quota_reached: 'Tu as utilisé toutes tes analyses du mois. Le compteur repart à zéro le 1er du mois prochain.',
  bad_request: 'Envoie une ou deux photos de l\'étiquette.',
  too_large: 'Une photo dépasse 8 Mo. Reprends-la ou envoie une version plus légère.',
  bad_type: 'Format non reconnu. Envoie une photo en JPEG, PNG, WebP ou HEIC.',
  not_a_label: 'On ne trouve pas d\'étiquette d\'aliment pour animal sur ces photos. Cadre la composition et les constituants analytiques.',
  timeout: 'La lecture a pris trop de temps. Réessaie : l\'analyse ne t\'a pas été décomptée.',
  provider_error: 'La lecture de l\'étiquette a échoué. Réessaie dans un instant : l\'analyse ne t\'a pas été décomptée.',
  unavailable: 'Le scanner est indisponible pour le moment. Réessaie plus tard.',
}
