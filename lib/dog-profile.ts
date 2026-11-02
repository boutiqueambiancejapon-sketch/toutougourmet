import type { ActivityLevel, AgeGroup } from '@/lib/calculators'
import { BREEDS } from '@/data/breeds'

// @cdc lot 4 — calculs autour du profil chien, partagés entre les pages /compte et le
// pré-remplissage des outils. Seuils d'âge identiques à /outils/ration : chiot avant 1 an,
// senior à partir de 7 ans.

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentaire: 'Calme',
  normal: 'Normale',
  actif: 'Sportive',
  'tres-actif': 'Intense',
}

export function breedName(slug: string | null): string | null {
  if (!slug) return null
  return BREEDS.find((b) => b.slug === slug)?.name ?? null
}

export function isKnownBreed(slug: string): boolean {
  return BREEDS.some((b) => b.slug === slug)
}

/** Âge en mois révolus à la date `today` (AAAA-MM-JJ). */
export function ageInMonths(birthDate: string, today: Date = new Date()): number {
  const [y, m, d] = birthDate.split('-').map(Number)
  let months = (today.getFullYear() - y) * 12 + (today.getMonth() + 1 - m)
  if (today.getDate() < d) months -= 1
  return Math.max(0, months)
}

export function ageGroupOf(birthDate: string | null): AgeGroup | undefined {
  if (!birthDate) return undefined
  const months = ageInMonths(birthDate)
  if (months < 12) return 'chiot'
  if (months >= 84) return 'senior'
  return 'adulte'
}

export function formatAge(birthDate: string | null, estimated: boolean): string | null {
  if (!birthDate) return null
  const months = ageInMonths(birthDate)
  const prefix = estimated ? 'environ ' : ''
  if (months < 24) return `${prefix}${months} mois`
  return `${prefix}${Math.floor(months / 12)} ans`
}

/** Date de naissance estimée à partir d'un âge en années (le 1er du mois). */
export function birthDateFromAge(years: number, today: Date = new Date()): string {
  const totalMonths = today.getFullYear() * 12 + today.getMonth() - Math.round(years * 12)
  const y = Math.floor(totalMonths / 12)
  const m = (totalMonths % 12) + 1
  return `${y}-${String(m).padStart(2, '0')}-01`
}

export const formatKg = (kg: number) => `${String(Math.round(kg * 100) / 100).replace('.', ',')} kg`

export function formatDateFr(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}
