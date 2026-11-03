import { POISON_COUNTRIES, type PoisonCenter } from '@/data/poison-centers'
import { formatDay, formatTime, splitList, splitNotes, type SheetData } from './sheet'

// @cdc fiche de garde — textes de la fiche du gardien, communs à la page /garde/[jeton], à
// l'aperçu de la page publique et au PDF A4 (même contenu partout).

const AGE_LABEL = { chiot: 'chiot', adulte: 'adulte', senior: 'senior' } as const

export interface SitterViewModel {
  name: string
  period: string
  facts: string
  grams: string
  split: string
  splitDetail: string
  food: string | null
  treats: string[]
  allergies: string | null
  meds: string | null
  notes: string[]
  owner: { label: string; phone: string; tel: string }
  vet: { label: string; phone: string; tel: string } | null
  poison: PoisonCenter[]
  poisonAdvice: string | null
}

export const telOf = (phone: string): string => `tel:${phone.replace(/[^+0-9]/g, '')}`

const kg = (n: number) => `${String(n).replace('.', ',')} kg`

export function sitterView(d: SheetData): SitterViewModel {
  const perMeal = Math.round(d.gramsPerDay / d.meals)
  const times = d.mealTimes.map(formatTime)
  const country = POISON_COUNTRIES.find((c) => c.code === d.country) ?? POISON_COUNTRIES[0]
  const facts = [d.breed || null, kg(d.weightKg), AGE_LABEL[d.ageGroup], d.sterilized ? 'stérilisé' : null].filter(Boolean).join(', ')
  return {
    name: d.dogName,
    period: d.startsOn === d.endsOn ? `le ${formatDay(d.startsOn)}` : `du ${formatDay(d.startsOn)} au ${formatDay(d.endsOn)}`,
    facts: facts.charAt(0).toUpperCase() + facts.slice(1),
    grams: `${d.gramsPerDay} g`,
    split: d.meals === 1 ? '1 repas' : `${d.meals} × ${perMeal} g`,
    splitDetail: d.meals === 1 ? `à ${times[0]}` : `à ${times.slice(0, -1).join(', ')} et ${times[times.length - 1]}`,
    food: d.food || null,
    treats: splitList(d.treats),
    allergies: d.allergies || null,
    meds: d.meds || null,
    notes: splitNotes(d.notes),
    owner: { label: 'Propriétaire', phone: d.ownerPhone, tel: telOf(d.ownerPhone) },
    vet: d.vetPhone ? { label: d.vetName || 'Son vétérinaire', phone: d.vetPhone, tel: telOf(d.vetPhone) } : null,
    // Un seul centre, le premier du pays (CNITV en France : 24 h/24, comme sur la maquette).
    poison: country.centers.slice(0, 1),
    poisonAdvice: [country.centers[0]?.note, country.advice].filter(Boolean).join(' ') || null,
  }
}

/** Exemple de la page publique (maquette validée : Rex, 12 kg). */
export const EXAMPLE_SHEET: SheetData = {
  dogName: 'Rex',
  breed: 'Croisé beagle',
  weightKg: 12,
  ageGroup: 'adulte',
  sterilized: true,
  activity: 'normal',
  gramsPerDay: 160,
  meals: 2,
  mealTimes: ['08:00', '19:00'],
  food: 'Franklin Pet Food, adulte poulet',
  treats: 'Carotte, pomme sans pépins, 2 biscuits par jour au plus',
  allergies: 'bœuf',
  meds: '',
  notes: "A peur de l'orage.\nPromenade avant chaque repas.",
  ownerPhone: '06 12 34 56 78',
  vetName: 'Clinique des Lilas',
  vetPhone: '04 72 00 00 00',
  country: 'FR',
  startsOn: '2027-07-12',
  endsOn: '2027-07-26',
}
