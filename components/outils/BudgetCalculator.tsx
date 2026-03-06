'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  calculateDailyCalories,
  calculateMonthlyBudget,
  brandPricings,
  type Animal,
  type AgeGroup,
  type ActivityLevel,
} from '@/lib/calculators'

export function BudgetCalculator() {
  const [animal, setAnimal] = useState<Animal>('chien')
  const [weight, setWeight] = useState('')
  const [age, setAge] = useState<AgeGroup>('adulte')
  const [activity, setActivity] = useState<ActivityLevel>('normal')
  const [sterilized, setSterilized] = useState(false)
  const [results, setResults] = useState<{ name: string; slug: string; monthly: number; affiliateUrl: string; offer: string; type: string }[] | null>(null)

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault()
    const w = parseFloat(weight)
    if (!w) return
    const kcal = calculateDailyCalories({ animal, weightKg: w, ageGroup: age, activityLevel: activity, sterilized })

    const filteredBrands = brandPricings.filter((b) => {
      if (animal === 'chat' && b.slug === 'dog-chef') return false
      return true
    })

    const res = filteredBrands.map((b) => ({
      name: b.name,
      slug: b.slug,
      monthly: calculateMonthlyBudget(kcal, b),
      affiliateUrl: b.affiliateUrl,
      offer: b.offer,
      type: b.type,
    })).sort((a, b) => a.monthly - b.monthly)

    setResults(res)
  }

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 md:p-8">
      <form onSubmit={handleCalculate} className="flex flex-col gap-4">
        {/* Animal */}
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

        <div className="grid grid-cols-2 gap-3">
          {/* Poids */}
          <div>
            <label htmlFor="bw" className="block text-sm font-semibold text-[var(--text-primary)] mb-1">
              Poids (kg)
            </label>
            <input
              id="bw"
              type="number"
              min="0.5"
              max="100"
              step="0.1"
              required
              placeholder="Ex : 12"
              value={weight}
              onChange={(e) => { setWeight(e.target.value); setResults(null) }}
              className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface-2)] focus:outline-none focus:border-[var(--accent-1)] text-sm"
            />
          </div>

          {/* Âge */}
          <div>
            <label htmlFor="bage" className="block text-sm font-semibold text-[var(--text-primary)] mb-1">
              Âge
            </label>
            <select
              id="bage"
              value={age}
              onChange={(e) => { setAge(e.target.value as AgeGroup); setResults(null) }}
              className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface-2)] focus:outline-none focus:border-[var(--accent-1)] text-sm"
            >
              <option value="chiot">Chiot / Chaton</option>
              <option value="adulte">Adulte</option>
              <option value="senior">Senior</option>
            </select>
          </div>
        </div>

        {/* Activité + Stérilisé */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="bact" className="block text-sm font-semibold text-[var(--text-primary)] mb-1">
              Activité
            </label>
            <select
              id="bact"
              value={activity}
              onChange={(e) => { setActivity(e.target.value as ActivityLevel); setResults(null) }}
              className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface-2)] focus:outline-none focus:border-[var(--accent-1)] text-sm"
            >
              <option value="sedentaire">Sédentaire</option>
              <option value="normal">Normal</option>
              <option value="actif">Actif</option>
              <option value="tres-actif">Très actif</option>
            </select>
          </div>
          <div className="flex items-end pb-2.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sterilized}
                onChange={(e) => { setSterilized(e.target.checked); setResults(null) }}
                className="w-4 h-4 accent-[var(--accent-1)]"
              />
              <span className="text-sm text-[var(--text-secondary)]">Stérilisé(e)</span>
            </label>
          </div>
        </div>

        <button type="submit" className="btn-primary py-3">
          Comparer les budgets →
        </button>
      </form>

      {/* Résultats */}
      {results && (
        <div className="mt-6 pt-6 border-t border-[var(--border)]">
          <h3 className="font-bold text-[var(--text-primary)] mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
            Budget mensuel estimé par marque
          </h3>
          <div className="flex flex-col gap-3">
            {results.map((r, i) => (
              <div
                key={r.slug}
                className={`flex items-center gap-3 p-4 rounded-[var(--radius-lg)] border-2 ${
                  i === 0 ? 'border-[var(--accent-1)] bg-[var(--accent-1)]/5' : 'border-[var(--border)]'
                }`}
              >
                {i === 0 && (
                  <span className="text-xs font-semibold text-[var(--accent-1)] bg-[var(--accent-1)]/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                    Moins cher
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[var(--text-primary)] text-sm">{r.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {r.type === 'croquettes' ? '🥣 Croquettes' : '🍖 Repas frais'} • {r.offer}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className="text-xl font-black text-[var(--text-primary)]"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    ~{r.monthly}€
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">/ mois</p>
                </div>
                <a
                  href={r.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="btn-primary text-xs py-1.5 px-3 shrink-0"
                >
                  Essayer →
                </a>
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-3 italic">
            Estimations basées sur les prix moyens des gammes standards. Les tarifs réels varient
            selon les gammes choisies. Liens affiliés — on perçoit une commission sans surcoût pour
            toi.{' '}
            <Link href="/a-propos#affiliation" className="underline">
              En savoir plus
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}
