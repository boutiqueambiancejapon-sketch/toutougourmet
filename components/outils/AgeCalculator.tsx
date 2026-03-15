// @cdc 6.0 — 'use client' isolé : calculateur âge humain chien
'use client'

import { useState, useMemo } from 'react'
import { calculateDogHumanAge, type SizeCategory } from '@/lib/calculators'

const SIZES: { value: SizeCategory; label: string; desc: string }[] = [
  { value: 'petit',      label: 'Petit',      desc: '< 10 kg · Yorkshire, Chihuahua, Carlin' },
  { value: 'moyen',      label: 'Moyen',      desc: '10–25 kg · Beagle, Cocker, Bulldog' },
  { value: 'grand',      label: 'Grand',      desc: '25–45 kg · Labrador, Golden, Husky' },
  { value: 'tres-grand', label: 'Très grand', desc: '> 45 kg · Berger, Dogue, Saint-Bernard' },
]

const PILL_COLORS: Record<string, string> = {
  chiot:       'bg-[var(--pill-rose)] text-[var(--text-primary)]',
  jeune:       'bg-[var(--pill-blue)] text-[var(--text-primary)]',
  adulte:      'bg-[var(--pill-green,#d1f5e0)] text-[var(--text-primary)]',
  senior:      'bg-[var(--bg-surface-2)] text-[var(--text-secondary)]',
  'tres-senior': 'bg-[var(--bg-surface-2)] text-[var(--text-muted)]',
}

export function AgeCalculator() {
  const [years, setYears] = useState('')
  const [months, setMonths] = useState('0')
  const [size, setSize] = useState<SizeCategory>('moyen')

  const result = useMemo(() => {
    const y = parseFloat(years)
    if (!years || isNaN(y) || y < 0) return null
    const totalYears = y + parseInt(months, 10) / 12
    return calculateDogHumanAge(totalYears, size)
  }, [years, months, size])

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 md:p-8">
      <div className="flex flex-col gap-5">

        {/* Âge */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="dog-years" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
              Années
            </label>
            <input
              id="dog-years"
              type="number"
              min="0"
              max="25"
              step="1"
              placeholder="Ex : 3"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface-2)] focus:outline-none focus:border-[var(--accent-1)]"
            />
          </div>
          <div>
            <label htmlFor="dog-months" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
              Mois supplémentaires
            </label>
            <select
              id="dog-months"
              value={months}
              onChange={(e) => setMonths(e.target.value)}
              className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface-2)] focus:outline-none focus:border-[var(--accent-1)]"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>{i} mois</option>
              ))}
            </select>
          </div>
        </div>

        {/* Gabarit */}
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">Gabarit</p>
          <div className="grid grid-cols-2 gap-2">
            {SIZES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSize(s.value)}
                className={`py-3 px-4 rounded-[var(--radius-md)] border-2 text-left transition-all ${
                  size === s.value
                    ? 'border-[var(--accent-1)] bg-[var(--accent-1)] text-white'
                    : 'border-[var(--border)] hover:border-[var(--accent-1)]'
                }`}
              >
                <span className="block text-sm font-semibold">{s.label}</span>
                <span className={`text-xs leading-tight ${size === s.value ? 'text-white/80' : 'text-[var(--text-muted)]'}`}>
                  {s.desc}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Résultat */}
      {result && (
        <div className="mt-6 pt-6 border-t border-[var(--border)]">
          <div className="flex flex-col items-center text-center gap-3">
            <p className="text-sm text-[var(--text-muted)]">Ton chien a l&apos;équivalent de</p>
            <p className="text-7xl font-black text-[var(--accent-1)]" style={{ fontFamily: "'Fraunces', serif" }}>
              {result.humanAge} <span className="text-3xl">ans</span>
            </p>
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${PILL_COLORS[result.stagePill]}`}>
              {result.lifeStage}
            </span>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-[400px]">
              {result.context}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
