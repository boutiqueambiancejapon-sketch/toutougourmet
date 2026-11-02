'use client'

import type { QuizChoiceStep } from '@/data/quiz'

// @cdc outils — une question du test, au dessin de components/tools/Segmented.tsx mais en
// colonne (libellés longs sur 390 px) : vrais <input type="radio"> ou "checkbox" pour le
// clavier et les lecteurs d'écran, cibles de 48 px, choix coché sur fond papier.

interface QuizStepProps {
  step: QuizChoiceStep
  value: string | string[] | undefined
  onToggle: (value: string) => void
}

export function QuizStep({ step, value, onToggle }: QuizStepProps) {
  const multi = step.type === 'multi'
  const isChecked = (v: string) => (Array.isArray(value) ? value.includes(v) : value === v)

  return (
    <fieldset className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
      <legend className="sr-only">{step.question}</legend>
      <div className="flex flex-col gap-1 rounded-control bg-cream-2 p-1">
        {step.options.map((opt) => (
          <label key={opt.value} className="relative flex min-h-12 cursor-pointer">
            <input
              type={multi ? 'checkbox' : 'radio'}
              name={step.id}
              value={opt.value}
              checked={isChecked(opt.value)}
              onChange={() => onToggle(opt.value)}
              className="peer absolute inset-0 m-0 cursor-pointer opacity-0"
            />
            <span className="flex w-full items-center gap-3 rounded-tile px-3 py-2 text-left text-[15px] leading-snug text-ink-2 peer-checked:bg-paper peer-checked:text-ink peer-checked:shadow-sm peer-checked:[&>.tick]:bg-ink peer-focus-visible:ring-2 peer-focus-visible:ring-ink">
              <span
                aria-hidden="true"
                className={`tick size-4 shrink-0 border-2 border-ink bg-paper ${multi ? 'rounded-sm' : 'rounded-full'}`}
              />
              <span className="flex min-w-0 flex-col">
                <span className="font-semibold text-ink">{opt.label}</span>
                {opt.hint ? <span className="text-sm text-ink-2">{opt.hint}</span> : null}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
