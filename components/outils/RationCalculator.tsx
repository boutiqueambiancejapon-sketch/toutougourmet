'use client'

import { useState } from 'react'
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

export function RationCalculator() {
  const [form, setForm] = useState<FormState>(defaultForm)
  const [result, setResult] = useState<{ kcal: number; gKibble: number; gFresh: number } | null>(null)

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault()
    const weight = parseFloat(form.weightKg)
    if (!weight || weight <= 0) return
    const kcal = calculateDailyCalories({
      animal: form.animal,
      weightKg: weight,
      ageGroup: form.ageGroup,
      activityLevel: form.activityLevel,
      sterilized: form.sterilized,
      isRaceHighEnergy: form.isHighEnergy,
    })
    setResult({
      kcal,
      gKibble: caloriesToGramsKibble(kcal),
      gFresh: caloriesToGramsFresh(kcal),
    })
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

      {/* Résultat */}
      {result && (
        <div className="mt-6 pt-6 border-t border-[var(--border)]">
          <h3 className="font-bold text-[var(--text-primary)] mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
            Besoins journaliers estimés
          </h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-[var(--bg-surface-2)] rounded-[var(--radius-lg)] p-4 text-center">
              <p className="text-2xl font-black text-[var(--accent-1)]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {result.kcal}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">kcal / jour</p>
            </div>
            <div className="bg-[var(--bg-surface-2)] rounded-[var(--radius-lg)] p-4 text-center">
              <p className="text-2xl font-black text-[var(--accent-2)]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {result.gKibble}g
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">croquettes / jour</p>
            </div>
            <div className="bg-[var(--bg-surface-2)] rounded-[var(--radius-lg)] p-4 text-center">
              <p className="text-2xl font-black text-[var(--accent-3)]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {result.gFresh}g
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">repas frais / jour</p>
            </div>
          </div>
          <p className="text-xs text-[var(--text-muted)] italic">
            Estimation basée sur les formules vétérinaires standard (NRC 2006). Ajuste en fonction
            du poids de ton animal sur 4 semaines. En cas de doute, consulte un vétérinaire.
          </p>
        </div>
      )}
    </div>
  )
}
