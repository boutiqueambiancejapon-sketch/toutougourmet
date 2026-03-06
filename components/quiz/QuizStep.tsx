'use client'

import { cn } from '@/lib/utils'
import type { QuizStep as QuizStepType } from '@/data/quiz'

interface QuizStepProps {
  step: QuizStepType
  currentAnswer: string | string[] | undefined
  onSelect: (value: string) => void
}

export function QuizStep({ step, currentAnswer, onSelect }: QuizStepProps) {
  const isMulti = step.type === 'multi'

  function isSelected(value: string) {
    if (isMulti) return Array.isArray(currentAnswer) && currentAnswer.includes(value)
    return currentAnswer === value
  }

  return (
    <div className="flex flex-col gap-4">
      <h2
        className="text-xl md:text-2xl font-bold text-[var(--text-primary)] text-center"
        style={{ fontFamily: "'Fraunces', serif" }}
      >
        {step.question}
      </h2>
      {isMulti && (
        <p className="text-sm text-center text-[var(--text-muted)]">
          Tu peux sélectionner plusieurs réponses
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
        {step.options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={cn(
              'w-full text-left px-4 py-4 rounded-[var(--radius-lg)] border-2 font-medium transition-all',
              isSelected(option.value)
                ? 'border-[var(--accent-1)] bg-[var(--accent-1)] text-white shadow-[var(--shadow-md)]'
                : 'border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--accent-1)] hover:shadow-[var(--shadow-sm)]'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
