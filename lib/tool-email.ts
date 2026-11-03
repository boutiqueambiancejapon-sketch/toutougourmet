import { calculateDogHumanAge, computeRation, evaluateBodyScore, type ActivityLevel, type AgeGroup, type SizeCategory } from '@/lib/calculators'
import { BILAN_QUESTIONS, computeBilan, getActiveTips, getVerdict, type BilanAnswers } from '@/data/bien-nourri'
import { FOOD_WHAT, barfCheck, gramsFor, otherFood, rationHref, type RationFood } from '@/components/outils/ration-params'

// @cdc outils — « Reçois ton résultat par e-mail » : le navigateur envoie les réglages de l'outil,
// jamais le texte du résultat. Le serveur (app/api/outils/email) recalcule avec les mêmes
// fonctions que l'outil (lib/calculators.ts, data/bien-nourri.ts) : l'e-mail porte le chiffre
// exact, et personne ne peut faire écrire un texte libre à une adresse tierce.

export type EmailTool = 'ration' | 'poids' | 'age' | 'bilan'

export type ToolEmailInput =
  | { tool: 'ration'; weightKg: number; ageGroup: AgeGroup; activityLevel: ActivityLevel; sterilized: boolean; highEnergy: boolean; food: RationFood }
  | { tool: 'poids'; currentKg: number; idealKg: number }
  | { tool: 'age'; years: number; months: number; size: SizeCategory }
  | { tool: 'bilan'; answers: BilanAnswers }

export interface ToolResultText {
  /** Objet de l'e-mail */
  subject: string
  /** Le chiffre, en une ligne */
  headline: string
  /** Détails du résultat, une phrase par ligne */
  details: string[]
  /** Chemin pour refaire le calcul */
  redoPath: string
}

const AGES: readonly AgeGroup[] = ['chiot', 'adulte', 'senior']
const ACTIVITIES: readonly ActivityLevel[] = ['sedentaire', 'normal', 'actif', 'tres-actif']
const SIZES: readonly SizeCategory[] = ['petit', 'moyen', 'grand', 'tres-grand']
const SIZE_LABEL: Record<SizeCategory, string> = { petit: 'petit', moyen: 'moyen', grand: 'grand', 'tres-grand': 'très grand' }

const isNum = (v: unknown, min: number, max: number): v is number => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max
const oneOf = <T extends string>(list: readonly T[], v: unknown): v is T => typeof v === 'string' && (list as readonly string[]).includes(v)
const kg = (n: number): string => `${String(n).replace('.', ',')} kg`

/** Réponses du bilan limitées aux questions et options connues. */
function cleanAnswers(raw: unknown): BilanAnswers | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const out: BilanAnswers = {}
  for (const q of BILAN_QUESTIONS) {
    const value: unknown = (raw as Record<string, unknown>)[q.id]
    const values = Array.isArray(value) ? value : [value]
    const known = values.filter((v): v is string => typeof v === 'string' && q.options.some((o) => o.value === v))
    if (!known.length) return null
    out[q.id] = q.type === 'single' ? known[0] : known
  }
  return out
}

/** Réglages valides reçus du navigateur, sinon null. */
export function parseToolEmailInput(raw: unknown): ToolEmailInput | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const r = raw as Record<string, unknown>
  if (r.tool === 'ration') {
    if (!isNum(r.weightKg, 0.5, 100) || !oneOf(AGES, r.ageGroup) || !oneOf(ACTIVITIES, r.activityLevel)) return null
    if (typeof r.sterilized !== 'boolean' || typeof r.highEnergy !== 'boolean' || (r.food !== 'croquettes' && r.food !== 'frais' && r.food !== 'barf')) return null
    return { tool: 'ration', weightKg: r.weightKg, ageGroup: r.ageGroup, activityLevel: r.activityLevel, sterilized: r.sterilized, highEnergy: r.highEnergy, food: r.food }
  }
  if (r.tool === 'poids') {
    return isNum(r.currentKg, 0.5, 120) && isNum(r.idealKg, 0.5, 120) ? { tool: 'poids', currentKg: r.currentKg, idealKg: r.idealKg } : null
  }
  if (r.tool === 'age') {
    if (!isNum(r.years, 0, 25) || !isNum(r.months, 0, 11) || !Number.isInteger(r.years) || !Number.isInteger(r.months)) return null
    return oneOf(SIZES, r.size) && r.years + r.months > 0 ? { tool: 'age', years: r.years, months: r.months, size: r.size } : null
  }
  if (r.tool === 'bilan') {
    const answers = cleanAnswers(r.answers)
    return answers ? { tool: 'bilan', answers } : null
  }
  return null
}

/** Le résultat en clair, recalculé : mêmes phrases que l'écran de l'outil. */
export function describeToolResult(input: ToolEmailInput): ToolResultText {
  switch (input.tool) {
    case 'ration': {
      const r = computeRation({ animal: 'chien', ...input, isRaceHighEnergy: input.highEnergy })
      const grams = gramsFor(r, input.food)
      const meals = input.ageGroup === 'chiot' ? 3 : 2
      const what = FOOD_WHAT[input.food]
      return {
        subject: `Sa ration : ${grams} g ${what} par jour`,
        headline: `${grams} g ${what} par jour`,
        details: [
          `Pour un chien ${input.ageGroup === 'chiot' ? 'jeune' : input.ageGroup} de ${kg(input.weightKg)}, soit ${r.kcal} kcal par jour.`,
          `En ${meals} repas : environ ${Math.round(grams / meals)}\u00a0g chacun. Pour la même énergie, il faudrait ${otherFood(r, input.food)}.`,
          ...(input.food === 'barf' && input.ageGroup !== 'chiot' ? [barfCheck(input.weightKg)] : []),
          'Pèse la ration avec une balance de cuisine et compte les friandises dedans. Ajuste de 10 % si son poids bouge sur 4 semaines.',
        ],
        redoPath: rationHref(input),
      }
    }
    case 'poids': {
      const r = evaluateBodyScore(input.currentKg, input.idealKg)
      const gap = `${r.gapPct > 0 ? '+' : ''}${r.gapPct} %`
      return {
        subject: `Son poids : ${r.label.toLowerCase()}`,
        headline: `${r.label} (${gap} par rapport à son poids de forme)`,
        details: [`${kg(input.currentKg)} aujourd'hui pour un poids de forme de ${kg(input.idealKg)}.`, r.advice, 'Ce repère ne remplace pas la palpation des côtes par ton vétérinaire.'],
        redoPath: '/outils/poids',
      }
    }
    case 'age': {
      const r = calculateDogHumanAge(input.years + input.months / 12, input.size)
      const years = `${input.years} an${input.years > 1 ? 's' : ''}`
      const label = input.months > 0 ? `${years} et ${input.months} mois` : years
      return {
        subject: `Son âge humain : ${r.humanAge} ans`,
        headline: `${r.humanAge} ans en âge humain`,
        details: [`${label}, gabarit ${SIZE_LABEL[input.size]} : ${r.lifeStage.toLowerCase()}.`, r.context],
        redoPath: '/outils/age',
      }
    }
    case 'bilan': {
      const scores = computeBilan(input.answers)
      const verdict = getVerdict(scores.normalized)
      const tips = getActiveTips(input.answers, scores)
      return {
        subject: `Son bilan : ${scores.normalized}/100`,
        headline: `${scores.normalized}/100, ${verdict.label.toLowerCase()}`,
        details: [verdict.summary, ...tips.map((t) => `${t.title}. ${t.detail}`)],
        redoPath: '/outils/bien-nourri',
      }
    }
  }
}
