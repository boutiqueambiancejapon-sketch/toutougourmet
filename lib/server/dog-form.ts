import { z } from 'zod'
import { ACTIVITY_VALUES } from '@/db/schema'
import { birthDateFromAge, isKnownBreed } from '@/lib/dog-profile'
import type { DogInput } from './dogs'

// @cdc lot 4 — lecture et validation des formulaires chien et pesée (FormData des actions serveur).

export type FieldErrors = Partial<Record<string, string>>

const decimal = (v: FormDataEntryValue | null) => {
  const s = String(v ?? '').trim().replace(',', '.')
  return s === '' ? undefined : Number(s)
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export function todayIso(): string {
  // Date du jour à Paris (en-CA donne le format AAAA-MM-JJ).
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Paris' })
}

const dogSchema = z.object({
  name: z.string().trim().min(1, 'Donne-lui un nom.').max(40, '40 caractères au plus.'),
  breedSlug: z.string().refine((s) => s === '' || isKnownBreed(s), 'Race inconnue.'),
  ageMode: z.enum(['naissance', 'age']),
  birthDate: z.string().optional(),
  ageYears: z.number().min(0, 'Âge entre 0 et 25 ans.').max(25, 'Âge entre 0 et 25 ans.').optional(),
  weightKg: z.number().min(0.5, 'Poids entre 0,5 et 120 kg.').max(120, 'Poids entre 0,5 et 120 kg.').optional(),
  activity: z.enum(ACTIVITY_VALUES),
  sterilized: z.enum(['oui', 'non']),
})

export function parseDogForm(form: FormData): { ok: true; data: DogInput } | { ok: false; errors: FieldErrors } {
  const parsed = dogSchema.safeParse({
    name: String(form.get('name') ?? ''),
    breedSlug: String(form.get('breedSlug') ?? ''),
    ageMode: form.get('ageMode') === 'age' ? 'age' : 'naissance',
    birthDate: String(form.get('birthDate') ?? '') || undefined,
    ageYears: decimal(form.get('ageYears')),
    weightKg: decimal(form.get('weightKg')),
    activity: String(form.get('activity') ?? 'normal'),
    sterilized: form.get('sterilized') === 'oui' ? 'oui' : 'non',
  })
  if (!parsed.success) {
    const errors: FieldErrors = {}
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message
    return { ok: false, errors }
  }
  const d = parsed.data
  let birthDate: string | null = null
  if (d.ageMode === 'naissance' && d.birthDate) {
    if (!ISO_DATE.test(d.birthDate) || d.birthDate > todayIso() || d.birthDate < '1995-01-01') {
      return { ok: false, errors: { birthDate: 'Date de naissance invalide.' } }
    }
    birthDate = d.birthDate
  } else if (d.ageMode === 'age' && d.ageYears !== undefined) {
    birthDate = birthDateFromAge(d.ageYears)
  }
  return {
    ok: true,
    data: {
      name: d.name,
      breedSlug: d.breedSlug || null,
      birthDate,
      birthDateEstimated: d.ageMode === 'age' && birthDate !== null,
      weightKg: d.weightKg ?? null,
      activity: d.activity,
      sterilized: d.sterilized === 'oui',
    },
  }
}

export function parseWeightForm(form: FormData): { ok: true; date: string; weightKg: number } | { ok: false; errors: FieldErrors } {
  const weightKg = decimal(form.get('weightKg'))
  const date = String(form.get('date') ?? '')
  const errors: FieldErrors = {}
  if (weightKg === undefined || !Number.isFinite(weightKg) || weightKg < 0.5 || weightKg > 120) errors.weightKg = 'Poids entre 0,5 et 120 kg.'
  if (!ISO_DATE.test(date) || date > todayIso() || date < '1995-01-01') errors.date = 'Date invalide.'
  if (Object.keys(errors).length > 0 || weightKg === undefined) return { ok: false, errors }
  return { ok: true, date, weightKg: Math.round(weightKg * 100) / 100 }
}
