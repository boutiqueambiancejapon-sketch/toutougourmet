'use client'

import { useEffect, useRef, useState } from 'react'
import { track } from '@/lib/analytics'
import { BILAN_QUESTIONS, computeBilan, getVerdict, recommend, type BilanAnswers } from '@/data/bien-nourri'
import { BienNourriResult } from './BienNourriResult'

// @cdc outils — bilan « bien nourri » en 6 questions (data/bien-nourri.ts). Une question à la
// fois ; les choix uniques passent à la suivante tout seuls.

const EXCLUSIVE = ['aucun', 'transit_ok']

export function BienNourriEvaluator() {
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<BilanAnswers>({})
  const [done, setDone] = useState(false)

  // « Tool Result » (tool = bien-nourri) alimente le compteur public du sticky CTA
  // (/api/bien-nourri-count) et le tableau de bord. Une fois par bilan.
  const fired = useRef(false)
  useEffect(() => {
    if (!done || fired.current) return
    const scores = computeBilan(answers)
    track('Tool Result', {
      tool: 'bien-nourri',
      score_band: getVerdict(scores.normalized).band,
      reco: recommend(scores).primary,
      score: scores.normalized,
    })
    fired.current = true
  }, [done, answers])

  const total = BILAN_QUESTIONS.length
  const step = BILAN_QUESTIONS[stepIndex]
  const current = answers[step.id]

  function next() {
    if (stepIndex < total - 1) setStepIndex(stepIndex + 1)
    else setDone(true)
  }

  function select(value: string) {
    if (step.type === 'single') {
      setAnswers({ ...answers, [step.id]: value })
      setTimeout(next, 250)
      return
    }
    const list = Array.isArray(current) ? current : []
    if (EXCLUSIVE.includes(value)) {
      setAnswers({ ...answers, [step.id]: [value] })
      return
    }
    const nextList = list.includes(value) ? list.filter((v) => v !== value) : [...list.filter((v) => !EXCLUSIVE.includes(v)), value]
    setAnswers({ ...answers, [step.id]: nextList })
  }

  if (done) {
    return (
      <div aria-live="polite">
        <BienNourriResult
          answers={answers}
          onRestart={() => {
            setStepIndex(0)
            setAnswers({})
            setDone(false)
            fired.current = false
          }}
        />
      </div>
    )
  }

  const canContinue = Array.isArray(current) && current.length > 0
  return (
    <section aria-label="Bilan" className="flex flex-col gap-4 rounded-card border border-line bg-paper p-4 sm:p-6">
      <div className="flex flex-col gap-1.5">
        <p className="m-0 text-sm text-ink-2">{`Question ${stepIndex + 1} sur ${total}`}</p>
        <div className="h-1.5 overflow-hidden rounded-pill bg-cream-2">
          <div className="h-full bg-ink" style={{ width: `${(stepIndex / total) * 100}%` }} />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="m-0 font-display text-xl font-black leading-snug text-ink md:text-2xl">{step.prompt}</h2>
        {step.helpText ? <p className="m-0 text-sm leading-relaxed text-ink-2">{step.helpText}</p> : null}
      </div>
      <ul role="list" className="m-0 flex list-none flex-col gap-2 p-0">
        {step.options.map((opt) => {
          const selected = Array.isArray(current) ? current.includes(opt.value) : current === opt.value
          return (
            <li key={opt.value}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => select(opt.value)}
                className="flex min-h-12 w-full items-center gap-3 rounded-control border border-line bg-paper px-4 py-2.5 text-left text-[15px] text-ink aria-pressed:border-2 aria-pressed:border-ink aria-pressed:font-semibold"
              >
                <span
                  aria-hidden="true"
                  className={`size-5 shrink-0 border-2 border-ink ${step.type === 'multi' ? 'rounded-sm' : 'rounded-full'} ${selected ? 'bg-ink' : 'bg-paper'}`}
                />
                {opt.label}
              </button>
            </li>
          )
        })}
      </ul>
      <div className="flex min-h-12 items-center justify-between gap-3">
        {stepIndex > 0 ? (
          <button type="button" onClick={() => setStepIndex(stepIndex - 1)} className="min-h-11 px-1 text-[15px] font-semibold text-ink-2 hover:underline">
            Question précédente
          </button>
        ) : (
          <span />
        )}
        {step.type === 'multi' ? (
          <button
            type="button"
            onClick={next}
            disabled={!canContinue}
            className="min-h-12 rounded-control bg-ink px-5 text-base font-semibold text-cream hover:underline disabled:opacity-40"
          >
            {stepIndex === total - 1 ? 'Voir mon bilan' : 'Continuer'}
          </button>
        ) : null}
      </div>
    </section>
  )
}
