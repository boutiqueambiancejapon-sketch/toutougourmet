import type { BodyScore } from '@/lib/calculators'

// Échelle à 5 cases de l'évaluateur de poids : la case du résultat est pleine encre.
const STEPS: { score: BodyScore; label: string }[] = [
  { score: 'maigre', label: 'Maigre' },
  { score: 'sous-poids', label: 'Un peu léger' },
  { score: 'ideal', label: 'Forme' },
  { score: 'surpoids', label: 'Surpoids' },
  { score: 'obese', label: 'Fort surpoids' },
]

export function ScoreScale({ score }: { score: BodyScore }) {
  return (
    <ol role="list" aria-label="Échelle de poids" className="m-0 grid list-none grid-cols-5 gap-1 p-0">
      {STEPS.map((s) => {
        const on = s.score === score
        return (
          <li
            key={s.score}
            aria-current={on ? 'step' : undefined}
            className={`flex min-h-11 items-center justify-center rounded-tile px-1 text-center text-xs leading-tight ${
              on ? 'bg-ink font-semibold text-cream' : s.score === 'ideal' ? 'bg-green-bg text-ink-2' : 'bg-cream-2 text-ink-2'
            }`}
          >
            {s.label}
          </li>
        )
      })}
    </ol>
  )
}
