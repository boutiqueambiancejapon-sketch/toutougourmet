'use client'

import { useEffect, useRef, useState } from 'react'
import { track } from '@/lib/analytics'
import { QUIZ_NONE, quizSteps } from '@/data/quiz'
import { computeScores, getSortedBrands, hasClearWinner, type QuizAnswers } from '@/lib/quiz'
import { NumberField } from '@/components/outils/fields'
import { QuizStep } from './QuizStep'
import { QuizResult } from './QuizResult'
import { titleTypo } from '@/lib/title-typo'

// @cdc outils — test « Quelle marque pour ton chien ? » (audit design-cro §3 Outils) : une
// question à la fois, bouton « Continuer » (pas de passage automatique, qui gênerait la
// navigation au clavier dans les boutons radio), focus déplacé sur chaque nouvelle question.
// « Quiz Complete » part une seule fois par test terminé, au clic qui affiche le résultat.

export function QuizWrapper() {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswers>({})
  const [done, setDone] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const moved = useRef(false)

  useEffect(() => {
    if (!moved.current) return
    heading.current?.focus()
  }, [index])

  const total = quizSteps.length
  const step = quizSteps[index]
  const value = answers[step.id]

  function go(to: number) {
    moved.current = true
    setIndex(to)
  }

  function next(nextAnswers: QuizAnswers = answers) {
    if (index < total - 1) {
      go(index + 1)
      return
    }
    const scores = computeScores(nextAnswers)
    const sorted = getSortedBrands(scores)
    track('Quiz Complete', { brand: sorted[0], clear: hasClearWinner(scores, sorted) })
    setDone(true)
  }

  function toggle(v: string) {
    if (step.type !== 'multi') {
      setAnswers({ ...answers, [step.id]: v })
      return
    }
    const list = Array.isArray(value) ? value : []
    const nextList =
      v === QUIZ_NONE ? [QUIZ_NONE] : list.includes(v) ? list.filter((x) => x !== v) : [...list.filter((x) => x !== QUIZ_NONE), v]
    setAnswers({ ...answers, [step.id]: nextList })
  }

  function skipWeight() {
    const rest = { ...answers }
    delete rest.poids
    setAnswers(rest)
    next(rest)
  }

  function restart() {
    setAnswers({})
    setDone(false)
    moved.current = false
    setIndex(0)
  }

  if (done) {
    return (
      <div aria-live="polite">
        <QuizResult answers={answers} onRestart={restart} />
      </div>
    )
  }

  const answered = step.type === 'weight' ? typeof value === 'string' && value !== '' : Array.isArray(value) ? value.length > 0 : !!value
  const last = index === total - 1

  return (
    <form
      aria-label="Test de la marque"
      onSubmit={(e) => {
        e.preventDefault()
        if (answered) next()
      }}
      className="flex flex-col gap-4 rounded-card border border-line bg-paper p-4 sm:p-6"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="quiz-progress" className="text-sm text-ink-2">{`Question ${index + 1} sur ${total}`}</label>
        <progress
          id="quiz-progress"
          max={total}
          value={index}
          className="h-1.5 w-full appearance-none overflow-hidden rounded-pill bg-cream-2 [&::-moz-progress-bar]:bg-ink [&::-webkit-progress-bar]:bg-cream-2 [&::-webkit-progress-value]:bg-ink"
        />
      </div>
      <div className="flex flex-col gap-1">
        <h2 ref={heading} tabIndex={-1} className="m-0 font-display text-xl font-black leading-snug text-ink outline-none md:text-2xl">
          {titleTypo(step.question)}
        </h2>
        {step.help ? <p className="m-0 text-sm leading-relaxed text-ink-2">{step.help}</p> : null}
      </div>

      {step.type === 'weight' ? (
        <div className="flex flex-col gap-2">
          <NumberField
            id="quiz-poids"
            label="Son poids"
            hint="en kg"
            placeholder="ex. 12"
            min={0.5}
            max={100}
            value={typeof value === 'string' ? value : ''}
            onChange={(v) => setAnswers({ ...answers, poids: v })}
          />
          <button type="button" onClick={skipWeight} className="min-h-11 self-start text-[15px] font-semibold text-ink-2 underline underline-offset-2">
            Je ne connais pas son poids
          </button>
        </div>
      ) : (
        <QuizStep step={step} value={value} onToggle={toggle} />
      )}

      <div className="flex min-h-12 items-center justify-between gap-3">
        {index > 0 ? (
          <button type="button" onClick={() => go(index - 1)} className="min-h-11 px-1 text-[15px] font-semibold text-ink-2 hover:underline">
            Question précédente
          </button>
        ) : (
          <span />
        )}
        <button
          type="submit"
          disabled={!answered}
          className="min-h-12 rounded-control bg-ink px-5 text-base font-semibold text-cream hover:underline disabled:opacity-40"
        >
          {last ? 'Voir ma marque' : 'Continuer'}
        </button>
      </div>
    </form>
  )
}
