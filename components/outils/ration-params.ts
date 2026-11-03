import { BARF_BODY_PCT, type ActivityLevel, type AgeGroup, type RationValues } from '@/lib/calculators'

// Paramètres d'URL de /outils/ration (pré-remplissage depuis l'accueil et les pages race) :
// ?poids=12&age=adulte&activite=normal&sterilise=oui&aliment=croquettes. Tout est facultatif ;
// une valeur inconnue est ignorée.
export type RationFood = 'croquettes' | 'frais' | 'barf'

/** Libellés des choix « Il mange » (même ordre partout). */
export const FOOD_OPTIONS = [['croquettes', 'Croquettes'], ['frais', 'Repas frais'], ['barf', 'BARF']] as const

/** Ce qui suit « {n} g » dans le résultat. */
export const FOOD_WHAT: Record<RationFood, string> = {
  croquettes: 'de croquettes',
  frais: 'de repas frais cuits',
  barf: 'de BARF (cru)',
}

export function gramsFor(r: RationValues, food: RationFood): number {
  return food === 'croquettes' ? r.gKibble : food === 'frais' ? r.gFresh : r.gBarf
}

/** Équivalence affichée sous le résultat : les croquettes, ou le repas frais pour qui donne des croquettes. */
export function otherFood(r: RationValues, food: RationFood): string {
  return food === 'croquettes' ? `${r.gFresh}\u00a0g de repas frais` : `${r.gKibble}\u00a0g de croquettes`
}

/** Phrase de contrôle propre au BARF : le repère 2 à 3 % du poids. */
export function barfCheck(weightKg: number): string {
  const lo = Math.round(weightKg * BARF_BODY_PCT.min * 10)
  const hi = Math.round(weightKg * BARF_BODY_PCT.max * 10)
  return `Repère courant du BARF : ${BARF_BODY_PCT.min} à ${BARF_BODY_PCT.max} % de son poids, soit ${lo} à ${hi}\u00a0g. Une viande grasse fait baisser la quantité, une viande maigre l'augmente.`
}

export interface RationPrefill {
  weightKg?: string
  ageGroup?: AgeGroup
  activityLevel?: ActivityLevel
  sterilized?: boolean
  food?: RationFood
}

/** Réponse de GET /api/compte/ration : premier chien du compte connecté. */
export interface AccountRationPrefill {
  dog: { id: string; name: string; prefill: RationPrefill } | null
}

/** Réponse de GET /api/compte/profil : le même chien, avec ce qu'il faut aux autres outils. */
export interface AccountProfile {
  dog:
    | (NonNullable<AccountRationPrefill['dog']> & {
        weightKg: number | null
        /** Âge en mois révolus, null si inconnu */
        ageMonths: number | null
        /** Milieu de la fourchette de poids adulte de sa race (data/breeds.ts), null sans race connue */
        breedMidKg: number | null
        breedName: string | null
      })
    | null
  /** Chiens du compte qui ont des allergies notées (prénom et allergies seulement) : alerte du scanner */
  allergies?: { name: string; allergies: string[] }[]
}

const AGES: readonly AgeGroup[] = ['chiot', 'adulte', 'senior']
const ACTIVITIES: readonly ActivityLevel[] = ['sedentaire', 'normal', 'actif', 'tres-actif']
const FOODS: readonly RationFood[] = ['croquettes', 'frais', 'barf']

const pick = <T extends string>(list: readonly T[], value: string | null): T | undefined =>
  list.find((v) => v === value)

interface ParamReader {
  get(name: string): string | null
}

function yesNo(value: string | null): boolean | undefined {
  if (value === 'oui' || value === '1') return true
  if (value === 'non' || value === '0') return false
  return undefined
}

export function parseRationParams(params: ParamReader): RationPrefill {
  const kg = parseFloat((params.get('poids') ?? '').replace(',', '.'))
  return {
    weightKg: Number.isFinite(kg) && kg >= 0.5 && kg <= 100 ? String(kg) : undefined,
    ageGroup: pick(AGES, params.get('age')),
    activityLevel: pick(ACTIVITIES, params.get('activite')),
    sterilized: yesNo(params.get('sterilise')),
    food: pick(FOODS, params.get('aliment')),
  }
}

export function rationHref(p: {
  weightKg: number
  ageGroup: AgeGroup
  activityLevel: ActivityLevel
  sterilized: boolean
  food: RationFood
}): string {
  const q = new URLSearchParams({
    poids: String(p.weightKg),
    age: p.ageGroup,
    activite: p.activityLevel,
    sterilise: p.sterilized ? 'oui' : 'non',
    aliment: p.food,
  })
  return `/outils/ration?${q.toString()}`
}
