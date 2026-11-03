import { z } from 'zod'
import { computeRation, type ActivityLevel, type AgeGroup } from '@/lib/calculators'
import { isPoisonCountry, type PoisonCountry } from '@/data/poison-centers'

// @cdc fiche de garde — contenu d'une fiche, partagé par le formulaire public (brouillon gardé
// dans le navigateur), l'espace compte (app.sitter_sheet.data) et la page du gardien.
// Aucune donnée sur le gardien : la fiche ne parle que du chien et de son propriétaire.

export const ACTIVITY_OPTIONS: ActivityLevel[] = ['sedentaire', 'normal', 'actif', 'tres-actif']
export const AGE_OPTIONS: AgeGroup[] = ['chiot', 'adulte', 'senior']

/** Plus longue absence couverte par une fiche, et délai maximal avant le départ. */
export const MAX_SPAN_DAYS = 92
export const MAX_AHEAD_DAYS = 366

const text = (max: number) => z.string().trim().max(max, `${max} caractères au plus.`)
const PHONE = /^[+0-9 .()-]{6,24}$/
const phone = z
  .string()
  .trim()
  .refine((s) => s === '' || PHONE.test(s), 'Numéro de téléphone invalide.')
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export const sheetSchema = z.object({
  dogName: text(40).min(1, 'Donne le nom du chien.'),
  breed: text(60),
  weightKg: z.number().min(0.5, 'Poids entre 0,5 et 120 kg.').max(120, 'Poids entre 0,5 et 120 kg.'),
  ageGroup: z.enum(['chiot', 'adulte', 'senior']),
  sterilized: z.boolean(),
  activity: z.enum(['sedentaire', 'normal', 'actif', 'tres-actif']),
  /** Grammes par jour : la ration calculée, ou celle que le propriétaire a corrigée */
  gramsPerDay: z.number().int().min(10, 'Entre 10 et 3 000 g.').max(3000, 'Entre 10 et 3 000 g.'),
  meals: z.number().int().min(1).max(4),
  mealTimes: z.array(z.string().regex(TIME, 'Heure invalide.')).min(1).max(4),
  food: text(120),
  treats: text(200),
  allergies: text(200),
  meds: text(300),
  notes: text(400),
  ownerPhone: phone.refine((s) => s !== '', 'Ton numéro est nécessaire au gardien.'),
  vetName: text(80),
  vetPhone: phone,
  country: z.custom<PoisonCountry>((v) => isPoisonCountry(v)),
  startsOn: z.string().regex(ISO_DATE, 'Date invalide.'),
  endsOn: z.string().regex(ISO_DATE, 'Date invalide.'),
})

export type SheetData = z.infer<typeof sheetSchema>

export type SheetErrors = Partial<Record<keyof SheetData | 'form', string>>

const DAY_MS = 86_400_000
const dayNumber = (iso: string) => Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10))) / DAY_MS

/** Validation complète (champs puis cohérence des dates). `today` au format AAAA-MM-JJ. */
export function parseSheet(raw: unknown, today: string): { ok: true; data: SheetData } | { ok: false; errors: SheetErrors } {
  const parsed = sheetSchema.safeParse(raw)
  if (!parsed.success) {
    const errors: SheetErrors = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form') as keyof SheetErrors
      errors[key] ??= issue.message
    }
    return { ok: false, errors }
  }
  const d = parsed.data
  const start = dayNumber(d.startsOn)
  const end = dayNumber(d.endsOn)
  const now = dayNumber(today)
  if (end < start) return { ok: false, errors: { endsOn: 'Le retour doit suivre le départ.' } }
  if (end < now) return { ok: false, errors: { endsOn: 'La date de retour est passée.' } }
  if (end - start > MAX_SPAN_DAYS) return { ok: false, errors: { endsOn: 'Trois mois au plus par fiche.' } }
  if (start - now > MAX_AHEAD_DAYS) return { ok: false, errors: { startsOn: 'Départ dans moins d’un an.' } }
  const mealTimes = d.mealTimes.slice(0, d.meals)
  if (mealTimes.length !== d.meals) return { ok: false, errors: { mealTimes: 'Une heure par repas.' } }
  return { ok: true, data: { ...d, mealTimes } }
}

/** Ration du jour par le calcul des outils (NRC 2006, croquettes à 360 kcal / 100 g). */
export function defaultGrams(d: Pick<SheetData, 'weightKg' | 'ageGroup' | 'activity' | 'sterilized'>): number {
  return computeRation({ animal: 'chien', weightKg: d.weightKg, ageGroup: d.ageGroup, activityLevel: d.activity, sterilized: d.sterilized }).gKibble
}

/** Heures proposées par défaut selon le nombre de repas. */
export const DEFAULT_TIMES: Record<number, string[]> = {
  1: ['18:00'],
  2: ['08:00', '19:00'],
  3: ['08:00', '13:00', '19:00'],
  4: ['07:30', '12:00', '16:30', '20:00'],
}

/** « 8 h », « 19 h 30 » */
export function formatTime(t: string): string {
  const [h, m] = t.split(':')
  return m === '00' ? `${Number(h)} h` : `${Number(h)} h ${m}`
}

const dateFr = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', timeZone: 'UTC' })

/** « 12 juillet » à partir de AAAA-MM-JJ (lu en UTC : pas de décalage de jour). */
export function formatDay(iso: string): string {
  return dateFr.format(new Date(`${iso}T12:00:00Z`))
}

/** Expiration du lien : fin du lendemain du retour, heure de Paris (marge si le retour glisse). */
export function expiryOf(endsOn: string): Date {
  const next = new Date(`${endsOn}T00:00:00Z`)
  next.setUTCDate(next.getUTCDate() + 2)
  // Minuit à Paris = 22 h ou 23 h UTC la veille : on prend 23 h UTC, au plus une heure de rab.
  next.setUTCHours(next.getUTCHours() - 1)
  return next
}

/** Liste tapée avec des virgules → pastilles. */
export function splitList(s: string): string[] {
  return s
    .split(/[,;\n]/)
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
    .slice(0, 12)
}

/** Une phrase par ligne ou par point, pour la liste « À savoir ». */
export function splitNotes(s: string): string[] {
  return s
    .split(/\n|(?<=\.)\s+/)
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 8)
}
