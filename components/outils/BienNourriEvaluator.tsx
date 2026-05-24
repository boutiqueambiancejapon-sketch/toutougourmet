'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  BILAN_QUESTIONS,
  computeBilan,
  getVerdict,
  recommend,
  getActiveTips,
  type BilanAnswers,
} from '@/data/bien-nourri'
import { cn } from '@/lib/utils'

export function BienNourriEvaluator() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<BilanAnswers>({})
  const [showResult, setShowResult] = useState(false)

  const totalSteps = BILAN_QUESTIONS.length
  const step = BILAN_QUESTIONS[currentStep]
  const progress = (currentStep / totalSteps) * 100

  function handleSelect(value: string) {
    if (step.type === 'multi') {
      const current = (answers[step.id] as string[]) || []
      const isSelected = current.includes(value)
      // « Aucun »/positifs sont mutuellement exclusifs avec les négatifs dans le même multi
      const exclusiveValues = ['aucun', 'transit_ok']
      if (exclusiveValues.includes(value)) {
        setAnswers({ ...answers, [step.id]: [value] })
        return
      }
      const next = isSelected
        ? current.filter((v) => v !== value)
        : [...current.filter((v) => !exclusiveValues.includes(v)), value]
      setAnswers({ ...answers, [step.id]: next })
    } else {
      setAnswers({ ...answers, [step.id]: value })
      // Auto-advance single choice
      setTimeout(() => {
        if (currentStep < totalSteps - 1) {
          setCurrentStep(currentStep + 1)
        } else {
          setShowResult(true)
        }
      }, 250)
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
  const canContinue =
    step?.type === 'multi'
      ? Array.isArray(currentAnswer) && currentAnswer.length > 0
      : !!currentAnswer

  // ────────────────────────────────────────────────────────────
  // Vue Résultat
  // ────────────────────────────────────────────────────────────
  if (showResult) {
    const scores = computeBilan(answers)
    const verdict = getVerdict(scores.normalized)
    const reco = recommend(scores)
    const tips = getActiveTips(answers, scores)

    const isExternal = reco.url.startsWith('http')

    return (
      <div className="flex flex-col gap-6">
        {/* Verdict principal */}
        <div
          className="rounded-[var(--radius-xl)] p-6 md:p-8 border-2"
          style={{
            borderColor: verdict.colorVar,
            background: `color-mix(in srgb, ${verdict.colorVar} 15%, var(--bg-surface))`,
          }}
        >
          <div className="flex items-start gap-4 mb-4">
            <span className="text-4xl shrink-0">{verdict.emoji}</span>
            <div className="min-w-0">
              <p
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: 'var(--text-muted)' }}
              >
                Ton bilan
              </p>
              <h2
                className="text-2xl font-black leading-tight"
                style={{ fontFamily: "'Fraunces', serif", color: 'var(--text-primary)' }}
              >
                {verdict.label}
              </h2>
            </div>
          </div>

          {/* Score */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
              <span>Score d&apos;alimentation</span>
              <span className="font-mono font-bold">{scores.normalized}/100</span>
            </div>
            <div className="h-3 bg-[var(--bg-surface-2)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${scores.normalized}%`,
                  background: verdict.colorVar,
                }}
              />
            </div>
          </div>

          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
            {verdict.summary}
          </p>
        </div>

        {/* Conseils actionnables */}
        {tips.length > 0 && (
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6">
            <h3
              className="text-lg font-black mb-4"
              style={{ fontFamily: "'Fraunces', serif", color: 'var(--text-primary)' }}
            >
              💡 {tips.length} action{tips.length > 1 ? 's' : ''} concrète{tips.length > 1 ? 's' : ''} pour toi
            </h3>
            <ul className="flex flex-col gap-3">
              {tips.map((tip) => (
                <li
                  key={tip.title}
                  className="flex gap-3 pb-3 border-b border-[var(--border)] last:border-0 last:pb-0"
                >
                  <span
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: 'var(--pill-amber)', color: 'var(--text-primary)' }}
                  >
                    ✓
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-[var(--text-primary)] mb-0.5">
                      {tip.title}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {tip.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommandation marque */}
        <div
          className="rounded-[var(--radius-xl)] p-6 md:p-7 border-2 border-[var(--accent-1)]"
          style={{ background: 'var(--bg-surface)' }}
        >
          <p
            className="text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: 'var(--accent-3)' }}
          >
            ✅ Notre recommandation
          </p>
          <p className="text-sm leading-relaxed text-[var(--text-secondary)] mb-5">
            {reco.rationale}
          </p>

          <Link
            href={reco.url}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer sponsored' : undefined}
            className="btn-primary block text-center py-3"
          >
            {reco.badge && (
              <span
                className="inline-block mr-2 text-xs font-black px-2 py-0.5 rounded-[var(--radius-sm)]"
                style={{ background: 'var(--pill-rose)', color: 'var(--text-primary)' }}
              >
                {reco.badge}
              </span>
            )}
            {reco.buttonLabel}
          </Link>

          {isExternal && (
            <p className="text-xs text-[var(--text-muted)] mt-3 text-center italic">
              Lien affilié — on perçoit une commission si tu passes commande, sans surcoût pour toi.
            </p>
          )}
        </div>

        {/* Restart */}
        <div className="text-center">
          <button onClick={handleRestart} className="btn-ghost text-sm">
            ↺ Refaire le bilan
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-[var(--text-muted)] text-center italic">
          Ce bilan est indicatif et ne remplace pas l&apos;avis d&apos;un vétérinaire. Pour toute pathologie ou doute clinique, consulte un professionnel.
        </p>
      </div>
    )
  }

  // ────────────────────────────────────────────────────────────
  // Vue Question
  // ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-[var(--text-muted)] mb-2">
          <span>
            Question {currentStep + 1} sur {totalSteps}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-[var(--bg-surface-2)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--accent-1)] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-5">
        <h2
          className="text-xl md:text-2xl font-black leading-snug mb-1"
          style={{ fontFamily: "'Fraunces', serif", color: 'var(--text-primary)' }}
        >
          {step.prompt}
        </h2>
        {step.helpText && (
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">{step.helpText}</p>
        )}
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {step.options.map((opt) => {
          const isSelected = step.type === 'multi'
            ? Array.isArray(currentAnswer) && currentAnswer.includes(opt.value)
            : currentAnswer === opt.value

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className={cn(
                'text-left px-4 py-3 rounded-[var(--radius-lg)] border-2 text-sm transition-all',
                isSelected
                  ? 'border-[var(--accent-1)] bg-[var(--accent-1)]/10 font-semibold'
                  : 'border-[var(--border)] hover:border-[var(--accent-1)]',
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'shrink-0 w-5 h-5 flex items-center justify-center text-xs font-bold border-2',
                    step.type === 'multi' ? 'rounded-[var(--radius-sm)]' : 'rounded-full',
                    isSelected ? 'border-[var(--accent-1)] bg-[var(--accent-1)] text-white' : 'border-[var(--border)]',
                  )}
                >
                  {isSelected && (step.type === 'multi' ? '✓' : '●')}
                </span>
                <span className="text-[var(--text-primary)]">{opt.label}</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-6 gap-3">
        {currentStep > 0 ? (
          <button onClick={handleBack} className="btn-ghost text-sm">
            ← Retour
          </button>
        ) : (
          <div />
        )}

        {step.type === 'multi' && (
          <button
            onClick={handleNext}
            disabled={!canContinue}
            className={cn('btn-primary', !canContinue && 'opacity-40 cursor-not-allowed')}
          >
            {currentStep === totalSteps - 1 ? 'Voir mon bilan →' : 'Continuer →'}
          </button>
        )}
      </div>
    </div>
  )
}
