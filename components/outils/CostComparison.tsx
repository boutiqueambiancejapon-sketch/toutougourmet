'use client'

import { useState } from 'react'
import {
  calculateDailyCalories,
  buildCostComparisons,
  type Animal,
  type AgeGroup,
  type ActivityLevel,
  type CostComparison,
} from '@/lib/calculators'
import Link from 'next/link'

const typeColors: Record<string, string> = {
  'croquettes-standard': '#A08C7A',
  'croquettes-premium': '#E8622A',
  'repas-frais': '#4CAF7D',
  'mixte': '#F2B85A',
}

export function CostComparisonTool() {
  const [animal, setAnimal] = useState<Animal>('chien')
  const [weight, setWeight] = useState('')
  const [age, setAge] = useState<AgeGroup>('adulte')
  const [activity, setActivity] = useState<ActivityLevel>('normal')
  const [results, setResults] = useState<CostComparison[] | null>(null)

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault()
    const w = parseFloat(weight)
    if (!w) return
    const kcal = calculateDailyCalories({ animal, weightKg: w, ageGroup: age, activityLevel: activity, sterilized: false })
    setResults(buildCostComparisons(kcal))
  }

  const maxMonthly = results ? Math.max(...results.map((r) => r.monthlyBudget)) : 1

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 md:p-8">
      <form onSubmit={handleCalculate} className="flex flex-col gap-4">
        <div className="flex gap-3">
          {(['chien', 'chat'] as Animal[]).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => { setAnimal(a); setResults(null) }}
              className={`flex-1 py-3 rounded-[var(--radius-lg)] border-2 font-medium text-sm transition-all ${
                animal === a
                  ? 'border-[var(--accent-1)] bg-[var(--accent-1)] text-white'
                  : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent-1)]'
              }`}
            >
              {a === 'chien' ? '🐶 Chien' : '🐱 Chat'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="cw" className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
              Poids (kg)
            </label>
            <input
              id="cw"
              type="number"
              min="0.5"
              max="100"
              step="0.1"
              required
              placeholder="12"
              value={weight}
              onChange={(e) => { setWeight(e.target.value); setResults(null) }}
              className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface-2)] focus:outline-none focus:border-[var(--accent-1)] text-sm"
            />
          </div>
          <div>
            <label htmlFor="cage" className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
              Âge
            </label>
            <select
              id="cage"
              value={age}
              onChange={(e) => { setAge(e.target.value as AgeGroup); setResults(null) }}
              className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface-2)] focus:outline-none focus:border-[var(--accent-1)] text-sm"
            >
              <option value="chiot">Chiot</option>
              <option value="adulte">Adulte</option>
              <option value="senior">Senior</option>
            </select>
          </div>
          <div>
            <label htmlFor="cact" className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
              Activité
            </label>
            <select
              id="cact"
              value={activity}
              onChange={(e) => { setActivity(e.target.value as ActivityLevel); setResults(null) }}
              className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface-2)] focus:outline-none focus:border-[var(--accent-1)] text-sm"
            >
              <option value="sedentaire">Sédentaire</option>
              <option value="normal">Normal</option>
              <option value="actif">Actif</option>
              <option value="tres-actif">Très actif</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn-primary py-3">
          Comparer les coûts annuels →
        </button>
      </form>

      {/* Résultats */}
      {results && (
        <div className="mt-6 pt-6 border-t border-[var(--border)]">
          <h3 className="font-bold text-[var(--text-primary)] mb-5" style={{ fontFamily: "'Fraunces', serif" }}>
            Comparaison des coûts selon le type d&apos;alimentation
          </h3>

          <div className="flex flex-col gap-4">
            {results.map((r) => (
              <div key={r.type} className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-[var(--text-primary)]">{r.label}</span>
                  <div className="flex flex-col items-end shrink-0">
                    <div className="flex items-baseline gap-1">
                      <span
                        className="text-xl font-black"
                        style={{ fontFamily: "'JetBrains Mono', monospace", color: typeColors[r.type] }}
                      >
                        {r.monthlyBudget}€
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">/mois</span>
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">{r.annualBudget}€/an</span>
                  </div>
                </div>
                {/* Barre */}
                <div className="h-3 bg-[var(--bg-surface-2)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(r.monthlyBudget / maxMonthly) * 100}%`,
                      backgroundColor: typeColors[r.type],
                    }}
                  />
                </div>
                {/* Pros/Cons */}
                <div className="flex gap-4 text-xs">
                  <div className="flex flex-wrap gap-1">
                    {r.pros.map((p) => (
                      <span key={p} className="text-[var(--accent-3)]">✓ {p}</span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {r.cons.map((c) => (
                      <span key={c} className="text-[var(--text-muted)]">✗ {c}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-[var(--border)] flex flex-wrap gap-3">
            <Link href="/comparateur" className="btn-outline text-sm py-2">
              Voir nos marques recommandées →
            </Link>
            <Link href="/quiz" className="btn-ghost text-sm py-2">
              Quiz personnalisé →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
