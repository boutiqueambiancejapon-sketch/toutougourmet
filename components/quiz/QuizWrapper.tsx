'use client'

import { useState } from 'react'
import { quizSteps } from '@/data/quiz'
import { computeScores, getSortedBrands, type QuizAnswers } from '@/lib/quiz'
import { QuizStep } from './QuizStep'
import { QuizResult } from './QuizResult'
import { cn } from '@/lib/utils'

export function QuizWrapper() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswers>({})
  const [showResult, setShowResult] = useState(false)

  const step = quizSteps[currentStep]
  const totalSteps = quizSteps.length
  const progress = ((currentStep) / totalSteps) * 100

  function handleSelect(value: string) {
    if (step.type === 'multi') {
      const current = (answers[step.id] as string[]) || []
      const isSelected = current.includes(value)
      if (value === 'aucun') {
        setAnswers({ ...answers, [step.id]: ['aucun'] })
        return
      }
      const next = isSelected
        ? current.filter((v) => v !== value)
        : [...current.filter((v) => v !== 'aucun'), value]
      setAnswers({ ...answers, [step.id]: next })
    } else {
      setAnswers({ ...answers, [step.id]: value })
      // Auto-advance for single choice
      setTimeout(() => {
        if (currentStep < totalSteps - 1) {
          setCurrentStep(currentStep + 1)
        } else {
          setShowResult(true)
        }
      }, 300)
    }
  }

  function handleNext() {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setShowResult(true)
    }
  }

  function handleBack() {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  function handleRestart() {
    setCurrentStep(0)
    setAnswers({})
    setShowResult(false)
  }

  const currentAnswer = answers[step?.id]
  const canContinue = step?.type === 'multi'
    ? Array.isArray(currentAnswer) && currentAnswer.length > 0
    : !!currentAnswer

  if (showResult) {
    const scores = computeScores(answers)
    const sorted = getSortedBrands(scores)
    return (
      <div>
        <QuizResult sortedBrands={sorted} />
        <div className="text-center mt-6">
          <button onClick={handleRestart} className="btn-ghost text-sm">
            ↺ Recommencer le quiz
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-[var(--text-muted)] mb-2">
          <span>Question {currentStep + 1} sur {totalSteps}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-[var(--bg-surface-2)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--accent-1)] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step */}
      <QuizStep
        step={step}
        currentAnswer={currentAnswer}
        onSelect={handleSelect}
      />

      {/* Controls */}
      <div className="flex items-center justify-between mt-6 gap-3">
        {currentStep > 0 ? (
          <button onClick={handleBack} className="btn-ghost text-sm">
            ← Retour
          </button>
        ) : <div />}

        {step.type === 'multi' && (
          <button
            onClick={handleNext}
            disabled={!canContinue}
            className={cn('btn-primary', !canContinue && 'opacity-40 cursor-not-allowed')}
          >
            {currentStep === totalSteps - 1 ? 'Voir mes recommandations →' : 'Continuer →'}
          </button>
        )}
      </div>
    </div>
  )
}
