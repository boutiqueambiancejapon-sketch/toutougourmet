import type { ScannerErrorCode } from './types'

// @cdc scanner — vocabulaire d'analytics.scanner_events, partagé par les routes (écriture), le
// tableau de bord (lecture) et les tests. Liste fermée, reprise par la contrainte CHECK de
// db/analytics.sql : un texte d'erreur brut ne peut pas entrer dans la table.

export type ScanType = 'code' | 'photo'

/** Une tentative sans compte sur la route photo n'est pas un scan : elle n'est pas enregistrée. */
// « recheck » est journalisé comme « blurry » : la contrainte SQL de scanner_events reste inchangée.
export type ScannerResult = Exclude<ScannerErrorCode, 'unauthorized' | 'recheck'> | 'found' | 'incomplete' | 'not_scorable' | 'lookup_error'

/** success : note affichée · partial : photo manquante demandée · missing : produit inconnu · failure : tout le reste */
export type ResultFamily = 'success' | 'partial' | 'missing' | 'failure'

interface ResultInfo {
  label: string
  family: ResultFamily
  /** Pastille d'un échec : ce qui a coincé, en un mot */
  pill: 'Lecture' | 'Service' | 'Limite' | 'Envoi' | null
}

export const SCANNER_RESULTS: Record<ScannerResult, ResultInfo> = {
  found: { label: 'Produit noté', family: 'success', pill: null },
  incomplete: { label: 'Photo manquante demandée', family: 'partial', pill: null },
  not_found: { label: 'Produit introuvable', family: 'missing', pill: null },
  not_scorable: { label: 'Fiche trop incomplète pour une note', family: 'missing', pill: null },
  not_a_label: { label: 'Pas une étiquette', family: 'failure', pill: 'Lecture' },
  blurry: { label: 'Étiquette illisible', family: 'failure', pill: 'Lecture' },
  cat_food: { label: 'Aliment pour chat', family: 'failure', pill: 'Lecture' },
  timeout: { label: 'Lecture trop longue', family: 'failure', pill: 'Service' },
  provider_error: { label: 'Erreur de service', family: 'failure', pill: 'Service' },
  unavailable: { label: 'Service indisponible', family: 'failure', pill: 'Service' },
  lookup_error: { label: 'Open Pet Food Facts injoignable', family: 'failure', pill: 'Service' },
  email_unverified: { label: 'Adresse non confirmée', family: 'failure', pill: 'Limite' },
  quota_reached: { label: 'Quota du mois atteint', family: 'failure', pill: 'Limite' },
  daily_cap: { label: 'Plafond du jour atteint', family: 'failure', pill: 'Limite' },
  rate_limited: { label: 'Trop d’essais rapprochés', family: 'failure', pill: 'Limite' },
  bad_request: { label: 'Envoi incomplet', family: 'failure', pill: 'Envoi' },
  too_large: { label: 'Photo trop lourde', family: 'failure', pill: 'Envoi' },
  bad_type: { label: 'Format de photo refusé', family: 'failure', pill: 'Envoi' },
}

export const ALL_RESULTS = Object.keys(SCANNER_RESULTS) as ScannerResult[]
export const FAILURE_RESULTS = ALL_RESULTS.filter((r) => SCANNER_RESULTS[r].family === 'failure')

export const isScannerResult = (value: string): value is ScannerResult => Object.hasOwn(SCANNER_RESULTS, value)

export const SCAN_TYPE_LABEL: Record<ScanType, string> = { code: 'code-barres', photo: 'photo' }

export interface EventCountRow {
  scan_type: string
  result: string
  today: number
  week: number
}

export interface PeriodCounts {
  code: number
  photo: number
  failures: number
  missing: number
}

export interface ScannerCounts {
  today: PeriodCounts
  week: PeriodCounts
}

export const EMPTY_COUNTS: ScannerCounts = {
  today: { code: 0, photo: 0, failures: 0, missing: 0 },
  week: { code: 0, photo: 0, failures: 0, missing: 0 },
}

/** Lignes groupées par type et résultat vers les chiffres de l'écran. Un résultat inconnu reste un scan. */
export function summarizeEvents(rows: EventCountRow[]): ScannerCounts {
  const out: ScannerCounts = { today: { ...EMPTY_COUNTS.today }, week: { ...EMPTY_COUNTS.week } }
  for (const r of rows) {
    const family = isScannerResult(r.result) ? SCANNER_RESULTS[r.result].family : null
    for (const [period, n] of [['today', r.today], ['week', r.week]] as const) {
      if (r.scan_type === 'code') out[period].code += n
      if (r.scan_type === 'photo') out[period].photo += n
      if (family === 'failure') out[period].failures += n
      if (family === 'missing') out[period].missing += n
    }
  }
  return out
}

/**
 * Comment un scan enregistré a été fait, sans rien inventer. Le journal le dit quand il a une ligne
 * pour ce scan. Sinon, une fiche créée par ce scan (from_cache faux) le dit par sa source. Une fiche
 * déjà connue peut venir d'un code-barres ou d'une photo : le type reste alors inconnu.
 */
export function scanOriginLabel(scan: { fromCache: boolean; source: string; eventType: string | null }): string {
  const type = scan.eventType === 'code' || scan.eventType === 'photo' ? scan.eventType : scan.fromCache ? null : scan.source === 'photo' ? 'photo' : 'code'
  if (!type) return 'fiche déjà connue'
  return scan.fromCache ? `${SCAN_TYPE_LABEL[type]}, fiche déjà connue` : SCAN_TYPE_LABEL[type]
}
