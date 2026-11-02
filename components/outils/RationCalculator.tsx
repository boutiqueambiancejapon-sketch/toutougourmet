'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { track } from '@/lib/analytics'
import { RationResult, type RationValues } from './RationResult'
import { parseRationParams, type RationPrefill } from './ration-params'
import {
  calculateDailyCalories,
  caloriesToGramsKibble,
  caloriesToGramsFresh,
  type Animal,
  type AgeGroup,
  type ActivityLevel,
} from '@/lib/calculators'

interface FormState {
  animal: Animal
  weightKg: string
  ageGroup: AgeGroup
  activityLevel: ActivityLevel
  sterilized: boolean
  isHighEnergy: boolean
}

const defaultForm: FormState = {
  animal: 'chien',
  weightKg: '',
  ageGroup: 'adulte',
  activityLevel: 'normal',
  sterilized: false,
  isHighEnergy: false,
}

function compute(form: FormState): RationValues | null {
  const weight = parseFloat(form.weightKg)
  if (!weight || weight <= 0) return null
  const kcal = calculateDailyCalories({
    animal: form.animal,
    weightKg: weight,
    ageGroup: form.ageGroup,
    activityLevel: form.activityLevel,
    sterilized: form.sterilized,
    isRaceHighEnergy: form.isHighEnergy,
  })
  return { kcal, gKibble: caloriesToGramsKibble(kcal), gFresh: caloriesToGramsFresh(kcal) }
}

/**
 * Lit les paramètres d'URL (?poids=…) pour pré-remplir le formulaire. useSearchParams impose
 * une limite <Suspense> dans la page : la page reste statique, son repli est <RationCalculator />.
 */
export function RationCalculatorFromUrl() {
  const params = useSearchParams()
  const prefill = parseRationParams(params)
  return <RationCalculator key={params.toString()} prefill={prefill} />
}

export function RationCalculator({ prefill = {} }: { prefill?: RationPrefill }) {
  const { food, ...fields } = prefill
  // Les clés absentes de l'URL valent undefined : elles ne doivent pas écraser les valeurs par défaut.
  const initial: FormState = { ...defaultForm, ...Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined)) }
  const [form, setForm] = useState<FormState>(initial)
  // Poids reçu dans l'URL : le résultat s'affiche tout de suite.
  const [result, setResult] = useState<RationValues | null>(() => (fields.weightKg ? compute(initial) : null))
  const fromUrl = Boolean(fields.weightKg)

  useEffect(() => {
    if (fromUrl) track('Tool Result', { tool: 'ration', source: 'lien' })
  }, [fromUrl])

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault()
    const values = compute(form)
    if (!values) return
    setResult(values)
    track('Tool Result', { tool: 'ration' })
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setResult(null)
  }

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 md:p-8">
      <form onSubmit={handleCalculate} className="flex flex-col gap-5">
        {/* Animal */}
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">Mon animal</p>
          <div className="flex gap-3">
            {(['chien', 'chat'] as Animal[]).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => set('animal', a)}
                className={`flex-1 py-3 rounded-[var(--radius-lg)] border-2 font-medium text-sm transition-all ${
                  form.animal === a
                    ? 'border-[var(--accent-1)] bg-[var(--accent-1)] text-white'
                    : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent-1)]'
                }`}
              >
                {a === 'chien' ? '🐶 Chien' : '🐱 Chat'}
              </button>
            ))}
          </div>
        </div>

        {/* Poids */}
        <div>
          <label htmlFor="weight" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
            Poids actuel (kg)
          </label>
          <input
            id="weight"
            type="number"
            min="0.5"
            max="100"
            step="0.1"
            required
            placeholder="Ex : 12.5"
            value={form.weightKg}
            onChange={(e) => set('weightKg', e.target.value)}
            className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface-2)] focus:outline-none focus:border-[var(--accent-1)]"
          />
        </div>

        {/* Âge */}
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">Tranche d&apos;âge</p>
          <div className="grid grid-cols-3 gap-2">
            {([
              ['chiot', form.animal === 'chien' ? 'Chiot (< 1 an)' : 'Chaton (< 1 an)'],
              ['adulte', 'Adulte (1–7 ans)'],
              ['senior', 'Senior (+ 7 ans)'],
            ] as [AgeGroup, string][]).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => set('ageGroup', val)}
                className={`py-2 px-3 rounded-[var(--radius-md)] border-2 text-xs font-medium transition-all ${
                  form.ageGroup === val
                    ? 'border-[var(--accent-1)] bg-[var(--accent-1)] text-white'
                    : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent-1)]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Activité */}
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">Niveau d&apos;activité</p>
          <div className="grid grid-cols-2 gap-2">
            {([
              ['sedentaire', '🛋️ Sédentaire', 'Peu de sorties, vie en appartement'],
              ['normal', '🚶 Normal', '2 sorties/jour, 30-60 min'],
              ['actif', '🏃 Actif', 'Sport régulier, randonnées'],
              ['tres-actif', '⚡ Très actif', 'Sport intensif, chien de travail'],
            ] as [ActivityLevel, string, string][]).map(([val, label, desc]) => (
              <button
                key={val}
                type="button"
                onClick={() => set('activityLevel', val)}
                className={`py-3 px-4 rounded-[var(--radius-md)] border-2 text-left transition-all ${
                  form.activityLevel === val
                    ? 'border-[var(--accent-1)] bg-[var(--accent-1)] text-white'
                    : 'border-[var(--border)] hover:border-[var(--accent-1)]'
                }`}
              >
                <span className="block text-sm font-semibold">{label}</span>
                <span className={`text-xs ${form.activityLevel === val ? 'text-white/80' : 'text-[var(--text-muted)]'}`}>
                  {desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.sterilized}
              onChange={(e) => set('sterilized', e.target.checked)}
              className="w-4 h-4 accent-[var(--accent-1)]"
            />
            <span className="text-sm text-[var(--text-secondary)]">
              Stérilisé(e) <span className="text-[var(--text-muted)]">(−15% de calories)</span>
            </span>
          </label>
          {form.animal === 'chien' && (
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isHighEnergy}
                onChange={(e) => set('isHighEnergy', e.target.checked)}
                className="w-4 h-4 accent-[var(--accent-1)]"
              />
              <span className="text-sm text-[var(--text-secondary)]">
                Race à haute énergie{' '}
                <span className="text-[var(--text-muted)]">(Border Collie, Husky, Terriers...)</span>
              </span>
            </label>
          )}
        </div>

        <button type="submit" className="btn-primary text-base py-3">
          Calculer ma ration →
        </button>
      </form>

      {result && <RationResult result={result} food={food} />}
    </div>
  )
}
