import type { ActivityLevel, AgeGroup } from '@/lib/calculators'
import { isPoisonCountry, type PoisonCountry } from '@/data/poison-centers'
import { DEFAULT_TIMES, defaultGrams, type SheetData } from './sheet'

// @cdc fiche de garde — saisie du formulaire, champ par champ (chaînes telles que tapées).
// Sans compte, elle reste dans le navigateur (localStorage) jusqu'à la confirmation de
// l'inscription : rien ne part au serveur avant que le visiteur ait un compte.

export interface SheetDraft {
  dogName: string
  breed: string
  weightKg: string
  ageGroup: AgeGroup
  sterilized: boolean
  activity: ActivityLevel
  /** Vide : ration calculée */
  gramsPerDay: string
  meals: number
  mealTimes: string[]
  food: string
  treats: string
  allergies: string
  meds: string
  notes: string
  ownerPhone: string
  vetName: string
  vetPhone: string
  country: PoisonCountry
  startsOn: string
  endsOn: string
}

export const EMPTY_DRAFT: SheetDraft = {
  dogName: '',
  breed: '',
  weightKg: '',
  ageGroup: 'adulte',
  sterilized: false,
  activity: 'normal',
  gramsPerDay: '',
  meals: 2,
  mealTimes: DEFAULT_TIMES[2],
  food: '',
  treats: '',
  allergies: '',
  meds: '',
  notes: '',
  ownerPhone: '',
  vetName: '',
  vetPhone: '',
  country: 'FR',
  startsOn: '',
  endsOn: '',
}

export const toNumber = (s: string): number => Number(s.trim().replace(',', '.'))

/** Ration affichée : celle tapée, sinon le calcul (null tant que le poids manque). */
export function gramsOf(d: SheetDraft): number | null {
  if (d.gramsPerDay.trim()) return Math.round(toNumber(d.gramsPerDay))
  const kg = toNumber(d.weightKg)
  if (!Number.isFinite(kg) || kg < 0.5 || kg > 120) return null
  return defaultGrams({ weightKg: kg, ageGroup: d.ageGroup, activity: d.activity, sterilized: d.sterilized })
}

/** Objet à valider par parseSheet (lib/garde/sheet.ts). */
export function draftToRaw(d: SheetDraft): Record<string, unknown> {
  return { ...d, weightKg: toNumber(d.weightKg), gramsPerDay: gramsOf(d) ?? 0, mealTimes: d.mealTimes.slice(0, d.meals) }
}

export function sheetToDraft(s: SheetData): SheetDraft {
  return { ...s, weightKg: String(s.weightKg).replace('.', ','), gramsPerDay: String(s.gramsPerDay) }
}

const KEY = 'tg-fiche-garde'

export function saveDraft(d: SheetDraft): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ v: 1, savedAt: Date.now(), draft: d }))
  } catch {
    // Stockage plein ou refusé (navigation privée) : la reprise après inscription ne marchera pas.
  }
}

/** Brouillon gardé il y a moins de 30 jours, complété des champs par défaut. */
export function loadDraft(): SheetDraft | null {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const { savedAt, draft } = parsed as { savedAt?: unknown; draft?: unknown }
    if (typeof savedAt !== 'number' || Date.now() - savedAt > 30 * 86_400_000) return null
    if (!draft || typeof draft !== 'object') return null
    const merged: SheetDraft = { ...EMPTY_DRAFT }
    for (const key of Object.keys(EMPTY_DRAFT) as (keyof SheetDraft)[]) {
      const value = (draft as Record<string, unknown>)[key]
      if (typeof value === typeof EMPTY_DRAFT[key] || (key === 'mealTimes' && Array.isArray(value))) {
        Object.assign(merged, { [key]: value })
      }
    }
    if (!isPoisonCountry(merged.country)) merged.country = 'FR'
    return merged
  } catch {
    return null
  }
}

export function clearDraft(): void {
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    // rien à faire
  }
}
