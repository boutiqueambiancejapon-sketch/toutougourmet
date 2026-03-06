'use client'

import { useState } from 'react'
import { evaluateBodyScore, dogSizeRanges, type Animal, type BodyScoreResult } from '@/lib/calculators'

const catIdealWeights = [
  { label: 'Petit gabarit (Siamois, Devon...)', idealKg: 3.5 },
  { label: 'Gabarit moyen (European, Bengal...)', idealKg: 4.5 },
  { label: 'Grand gabarit (Maine Coon, Ragdoll...)', idealKg: 6.5 },
]

const scoreEmojis: Record<string, string> = {
  maigre: '😟',
  'sous-poids': '😕',
  ideal: '😊',
  surpoids: '😐',
  obese: '😟',
}

export function BodyScoreEvaluator() {
  const [animal, setAnimal] = useState<Animal>('chien')
  const [currentWeight, setCurrentWeight] = useState('')
  const [idealWeight, setIdealWeight] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [result, setResult] = useState<BodyScoreResult | null>(null)

  function handleSizeSelect(midKg: number) {
    setSelectedSize(String(midKg))
    setIdealWeight(String(midKg))
    setResult(null)
  }

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault()
    const current = parseFloat(currentWeight)
    const ideal = parseFloat(idealWeight)
    if (!current || !ideal) return
    setResult(evaluateBodyScore(current, ideal))
  }

  const scoreBarWidth = result
    ? {
        maigre: '20%',
        'sous-poids': '35%',
        ideal: '55%',
        surpoids: '75%',
        obese: '95%',
      }[result.score]
    : '0%'

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 md:p-8">
      <form onSubmit={handleCalculate} className="flex flex-col gap-5">
        {/* Animal */}
        <div className="flex gap-3">
          {(['chien', 'chat'] as Animal[]).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => { setAnimal(a); setResult(null); setSelectedSize(''); setIdealWeight('') }}
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

        {/* Gabarit */}
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">
            Gabarit (pour connaître le poids idéal type)
          </p>
          <div className="flex flex-col gap-2">
            {animal === 'chien'
              ? Object.entries(dogSizeRanges).map(([key, val]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSizeSelect(val.midKg)}
                    className={`text-left px-4 py-2.5 rounded-[var(--radius-md)] border text-sm transition-all ${
                      selectedSize === String(val.midKg)
                        ? 'border-[var(--accent-1)] bg-[var(--accent-1)]/10 font-medium'
                        : 'border-[var(--border)] hover:border-[var(--accent-1)]'
                    }`}
                  >
                    <span className="text-[var(--text-primary)]">{val.label}</span>
                    <span className="text-[var(--text-muted)] ml-2 text-xs">
                      ({val.minKg}–{val.maxKg} kg)
                    </span>
                  </button>
                ))
              : catIdealWeights.map((cat) => (
                  <button
                    key={cat.idealKg}
                    type="button"
                    onClick={() => handleSizeSelect(cat.idealKg)}
                    className={`text-left px-4 py-2.5 rounded-[var(--radius-md)] border text-sm transition-all ${
                      selectedSize === String(cat.idealKg)
                        ? 'border-[var(--accent-1)] bg-[var(--accent-1)]/10 font-medium'
                        : 'border-[var(--border)] hover:border-[var(--accent-1)]'
                    }`}
                  >
                    {cat.label}
                    <span className="text-[var(--text-muted)] ml-2 text-xs">(~{cat.idealKg} kg)</span>
                  </button>
                ))}
          </div>
        </div>

        {/* Poids */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="current-w" className="block text-sm font-semibold text-[var(--text-primary)] mb-1">
              Poids actuel (kg)
            </label>
            <input
              id="current-w"
              type="number"
              min="0.5"
              max="120"
              step="0.1"
              required
              placeholder="Ex : 18"
              value={currentWeight}
              onChange={(e) => { setCurrentWeight(e.target.value); setResult(null) }}
              className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface-2)] focus:outline-none focus:border-[var(--accent-1)] text-sm"
            />
          </div>
          <div>
            <label htmlFor="ideal-w" className="block text-sm font-semibold text-[var(--text-primary)] mb-1">
              Poids de forme (kg)
            </label>
            <input
              id="ideal-w"
              type="number"
              min="0.5"
              max="120"
              step="0.1"
              required
              placeholder="Ex : 15"
              value={idealWeight}
              onChange={(e) => { setIdealWeight(e.target.value); setResult(null) }}
              className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface-2)] focus:outline-none focus:border-[var(--accent-1)] text-sm"
            />
          </div>
        </div>

        <button type="submit" className="btn-primary py-3">
          Évaluer le score corporel →
        </button>
      </form>

      {/* Résultat */}
      {result && (
        <div className="mt-6 pt-6 border-t border-[var(--border)]">
          {/* Barre de score */}
          <div className="mb-5">
            <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
              <span>Trop maigre</span>
              <span>Idéal</span>
              <span>Obèse</span>
            </div>
            <div className="relative h-4 bg-gradient-to-r from-[#5B9BD5] via-[#4CAF7D] to-[#E8622A] rounded-full overflow-hidden">
              <div
                className="absolute top-0 h-full w-1 bg-white/80 shadow-lg transition-all duration-700"
                style={{ left: scoreBarWidth }}
              />
            </div>
          </div>

          <div
            className="rounded-[var(--radius-lg)] p-5 border-2"
            style={{ borderColor: result.color, backgroundColor: `${result.color}10` }}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{scoreEmojis[result.score]}</span>
              <h3 className="font-bold text-xl" style={{ fontFamily: "'Fraunces', serif", color: result.color }}>
                {result.label}
              </h3>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-3">{result.description}</p>
            <div className="bg-[var(--bg-surface)] rounded-[var(--radius-md)] p-3">
              <p className="text-xs font-semibold text-[var(--text-primary)] mb-1">💡 Notre conseil</p>
              <p className="text-sm text-[var(--text-secondary)]">{result.advice}</p>
            </div>
          </div>

          <p className="text-xs text-[var(--text-muted)] mt-3 italic">
            Estimation indicative. Pour un bilan précis, consulte ton vétérinaire.
          </p>
        </div>
      )}
    </div>
  )
}
