import { z } from 'zod'

// @cdc lot 6 — scanner : format de lecture d'une étiquette, commun à tous les fournisseurs d'IA
// (lib/scanner/providers/*). L'IA lit, elle ne note pas : la note vient de lib/scanner/score.ts.
// Chaque sortie de fournisseur passe par parseExtractedLabel() avant d'être utilisée ou stockée.

export const CONFIDENCE = ['haute', 'moyenne', 'faible', 'absent'] as const
export type Confidence = (typeof CONFIDENCE)[number]

/** Champs dont le fournisseur donne une confiance : sert à relancer une lecture douteuse plus tard. */
export const CONFIDENCE_FIELDS = ['marque', 'produit', 'ean', 'ingredients', 'constituants', 'additifs'] as const
export type ConfidenceField = (typeof CONFIDENCE_FIELDS)[number]

export const SPECIES = ['chien', 'chat', 'autre', 'inconnu'] as const
/** Ce que montrent les photos : sert à répondre sans décompter une photo inutilisable. */
export const IMAGE_TYPES = ['aliment-chien', 'aliment-chat', 'friandise', 'autre'] as const
export type ImageType = (typeof IMAGE_TYPES)[number]
export const LEGIBILITY = ['nette', 'floue'] as const
export const FOOD_TYPES = ['sec', 'humide', 'autre', 'inconnu'] as const

/** Constituants analytiques en % du produit tel quel (comme sur l'étiquette). */
export const ANALYTICAL_KEYS = ['proteines', 'matieresGrasses', 'cellulose', 'cendres', 'humidite', 'calcium', 'phosphore'] as const
export type AnalyticalKey = (typeof ANALYTICAL_KEYS)[number]
/** Champs dont une lecture douteuse change la note : affichés « à vérifier », corrigeables. */
export const DOUBT_FIELDS = [...ANALYTICAL_KEYS, 'ingredients'] as const
export type DoubtField = (typeof DOUBT_FIELDS)[number]

const pct = z
  .number()
  .finite()
  .nullable()
  .catch(null)
  .transform((v) => (v === null || v < 0 || v > 100 ? null : Math.round(v * 100) / 100))

const text = (max: number) =>
  z
    .string()
    .nullable()
    .catch(null)
    .transform((v) => {
      const t = v?.replace(/\s+/g, ' ').trim().slice(0, max) ?? ''
      return t === '' ? null : t
    })

const confidence = z.enum(CONFIDENCE).catch('absent')

export const extractedLabelSchema = z.object({
  estUneEtiquette: z.boolean().catch(false),
  typeImage: z.enum(IMAGE_TYPES).catch('autre'),
  lisibilite: z.enum(LEGIBILITY).catch('nette'),
  marque: text(80),
  produit: text(160),
  ean: z
    .string()
    .nullable()
    .catch(null)
    .transform((v) => {
      const digits = v?.replace(/\D/g, '') ?? ''
      return digits.length === 8 || digits.length === 13 ? digits : null
    }),
  espece: z.enum(SPECIES).catch('inconnu'),
  typeAliment: z.enum(FOOD_TYPES).catch('inconnu'),
  ingredients: z
    .array(z.object({ nom: text(160), pourcentage: pct }))
    .catch([])
    .transform((list) => list.filter((i): i is { nom: string; pourcentage: number | null } => i.nom !== null).slice(0, 80)),
  constituants: z.object(Object.fromEntries(ANALYTICAL_KEYS.map((k) => [k, pct])) as Record<AnalyticalKey, typeof pct>).catch(
    Object.fromEntries(ANALYTICAL_KEYS.map((k) => [k, null])) as Record<AnalyticalKey, null>,
  ),
  additifs: z
    .array(text(160))
    .catch([])
    .transform((list) => list.filter((a): a is string => a !== null).slice(0, 60)),
  partAnimaleDeclaree: pct,
  confiance: z.object(Object.fromEntries(CONFIDENCE_FIELDS.map((k) => [k, confidence])) as Record<ConfidenceField, typeof confidence>).catch(
    Object.fromEntries(CONFIDENCE_FIELDS.map((k) => [k, 'absent'])) as Record<ConfidenceField, 'absent'>,
  ),
  illisibles: z
    .array(text(120))
    .catch([])
    .transform((list) => list.filter((a): a is string => a !== null).slice(0, 20)),
  champsDouteux: z
    .array(z.enum(DOUBT_FIELDS).nullable().catch(null))
    .catch([])
    .transform((list) => [...new Set(list.filter((f): f is DoubtField => f !== null))]),
})

export type ExtractedLabel = z.infer<typeof extractedLabelSchema>
export type Ingredient = ExtractedLabel['ingredients'][number]
export type Analytical = ExtractedLabel['constituants']

/** Valide et nettoie la sortie brute d'un fournisseur (JSON déjà parsé). */
export function parseExtractedLabel(raw: unknown): ExtractedLabel {
  return extractedLabelSchema.parse(raw)
}

/** Une image de l'étiquette, déjà contrôlée et normalisée par le serveur (jamais enregistrée). */
export interface LabelImage {
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/heic' | 'image/heif'
  data: Buffer
}

export interface ExtractionResult {
  label: ExtractedLabel
  /** Fournisseur et modèle qui ont lu l'étiquette, gardés avec l'analyse */
  model: string
}

/** Contrat d'un fournisseur : un fichier par fournisseur dans lib/scanner/providers/. */
export interface LabelProvider {
  name: string
  extract(images: LabelImage[], signal: AbortSignal): Promise<ExtractionResult>
}

export type ScannerErrorCode =
  | 'unauthorized'
  | 'rate_limited'
  | 'quota_reached'
  | 'daily_cap'
  | 'bad_request'
  | 'too_large'
  | 'bad_type'
  | 'not_a_label'
  | 'blurry'
  | 'cat_food'
  | 'treat'
  | 'not_found'
  | 'timeout'
  | 'provider_error'
  | 'unavailable'

export class ScannerError extends Error {
  constructor(
    public code: ScannerErrorCode,
    message: string,
  ) {
    super(message)
  }
}
