import type { AnalysisSource, FoodAnalysis } from '@/db/schema'
import { FREE_MONTHLY_SCANS, PREMIUM_MONTHLY_SCANS } from './config'
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
  label: ExtractedLabel
  source: AnalysisSource
  analysedAt: string
}

/** D'où vient le résultat affiché : cache (déjà analysé), Open Pet Food Facts (copie locale ou API), Open Food Facts ou photos lues par l'IA. */
export type ResultOrigin = 'cache' | 'openpetfoodfacts' | 'openfoodfacts' | 'photo'

/** Parties de l'étiquette demandées en photo. */
export type PhotoPart = 'ingredients' | 'analyse' | 'face'

export interface Prefill {
  ean: string | null
  brand: string | null
  product: string | null
}

export interface ScanQuota {
  used: number
  limit: number
  /** Formule du compte : le message de quota atteint propose Premium aux comptes gratuits */
  plan?: 'free' | 'premium'
}

export type ScanResponse =
  | { ok: true; analysis: ScanAnalysis; fromCache: boolean; origin: ResultOrigin; quota?: ScanQuota }
  /** Une partie manque : on garde ce qui est lu, on demande la photo manquante (session déjà décomptée). */
  | { ok: false; error: 'incomplete'; message: string; missing: PhotoPart[]; read: { ingredients: number; constituants: number }; session: string; quota?: ScanQuota }
  | { ok: false; error: ScannerErrorCode; message: string; quota?: ScanQuota; prefill?: Prefill }

export function toScanAnalysis(row: FoodAnalysis): ScanAnalysis {
  return {
    id: row.id,
    slug: row.slug,
    brand: row.brand,
    product: row.product,
    ean: row.ean,
    score: row.score,
    details: row.details,
    label: { ...row.extracted, champsDouteux: row.extracted.champsDouteux ?? [] },
    source: row.source,
    analysedAt: row.createdAt.toISOString(),
  }
}

export const INCOMPLETE_MESSAGE = 'Une partie de l\'étiquette manque sur les photos. On garde ce qui est lu : ajoute la photo manquante, ce nouvel envoi ne sera pas décompté.'

export const QUOTA_FREE_MESSAGE = `Tu as utilisé tes ${FREE_MONTHLY_SCANS} analyses gratuites du mois. Passe Premium depuis ton compte, c'est gratuit pendant le lancement : ${PREMIUM_MONTHLY_SCANS} analyses par mois.`

export const ERROR_MESSAGES: Record<ScannerErrorCode, string> = {
  unauthorized: 'Connecte-toi pour lancer une analyse.',
  rate_limited: 'Trop d\'analyses d\'affilée. Attends une minute avant de recommencer.',
  quota_reached: 'Tu as utilisé toutes tes analyses du mois. Le compteur repart à zéro le 1er du mois prochain.',
  daily_cap: 'Le scanner a atteint sa limite d\'analyses pour aujourd\'hui. Réessaie demain : ton quota n\'est pas touché.',
  bad_request: 'Envoie une photo de la composition et une des constituants analytiques.',
  too_large: 'Une photo dépasse 8 Mo. Reprends-la ou envoie une version plus légère.',
  bad_type: 'Format non reconnu. Envoie une photo en JPEG, PNG, WebP ou HEIC.',
  not_a_label: 'Ces photos ne montrent pas une étiquette d\'aliment pour chien. Photographie le dos du sac, là où sont écrits la composition et les constituants analytiques. Analyse non décomptée.',
  blurry: 'Le texte est trop flou pour être lu. Rapproche-toi à 15 ou 20 cm, coupe le flash pour éviter le reflet et cadre seulement le texte. Analyse non décomptée.',
  cat_food: 'Cet aliment est destiné au chat. Notre barème note les aliments pour chien : les besoins du chat ne sont pas les mêmes (FEDIAF : 25 g de protéines pour 100 g de matière sèche chez le chat adulte, 18 g chez le chien). Analyse non décomptée.',
  treat: 'Ce produit est une friandise ou un aliment complémentaire. Il ne nourrit pas seul le chien : notre barème, fait pour les aliments complets, ne le note pas. Analyse non décomptée.',
  not_found: 'Ce code-barres n\'est pas encore dans notre base. Prends l\'étiquette en photo pour l\'analyser.',
  timeout: 'La lecture a pris trop de temps. Réessaie : l\'analyse ne t\'a pas été décomptée.',
  provider_error: 'La lecture de l\'étiquette a échoué. Réessaie dans un instant : l\'analyse ne t\'a pas été décomptée.',
  unavailable: 'Le scanner est indisponible pour le moment. Réessaie plus tard.',
}
