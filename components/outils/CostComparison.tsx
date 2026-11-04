'use client'

import { useId, useState } from 'react'
import { track } from '@/lib/analytics'
import { buildCostComparisons, calculateDailyCalories, type ActivityLevel, type AgeGroup, type CostComparison } from '@/lib/calculators'
import { Segmented } from '@/components/tools/Segmented'
import { BigResult, NumberField, SubmitButton, ToolCard } from './fields'
import { ToolResult } from './ToolResult'
import { useResultReveal } from '@/lib/use-result-reveal'

// @cdc outils — coût annuel de quatre façons de nourrir, pour la même ration (computeRation).
// Pas de lien partenaire : le résultat compare des types d'aliment, pas des marques.

const AGES = [['chiot', 'Jeune'], ['adulte', 'Adulte'], ['senior', 'Senior']] as const
const ACTIVITIES = [['sedentaire', 'Calme'], ['normal', 'Normale'], ['actif', 'Sportive'], ['tres-actif', 'Intense']] as const

export function CostComparisonTool() {
  const weightId = useId()
  const [weight, setWeight] = useState('')
  const [age, setAge] = useState<AgeGroup>('adulte')
  const [activity, setActivity] = useState<ActivityLevel>('normal')
  const [rows, setRows] = useState<CostComparison[] | null>(null)
  const [resultRef, reveal] = useResultReveal()

  const change = <T,>(setter: (v: T) => void) => (v: T) => { setter(v); setRows(null) }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const kg = parseFloat(weight.replace(',', '.'))
    if (!(kg >= 0.5 && kg <= 100)) return
    const kcal = calculateDailyCalories({ animal: 'chien', weightKg: kg, ageGroup: age, activityLevel: activity, sterilized: false })
    setRows(buildCostComparisons(kcal))
    track('Tool Result', { tool: 'cout' })
    reveal()
  }

  const sorted = rows ? [...rows].sort((a, b) => a.annualBudget - b.annualBudget) : []
  const low = sorted[0]
  const high = sorted.at(-1)
  return (
    <div className="flex flex-col gap-4">
      <ToolCard label="Comparer les coûts" onSubmit={onSubmit}>
        <NumberField id={weightId} label="Poids (kg)" value={weight} onChange={change(setWeight)} placeholder="ex. 12" min={0.5} max={100} />
        <Segmented name="age" legend="Âge" options={AGES} value={age} onChange={change(setAge)} />
        <Segmented name="activite" legend="Activité" options={ACTIVITIES} value={activity} onChange={change(setActivity)} />
        <SubmitButton>Comparer sur un an</SubmitButton>
      </ToolCard>
      <div ref={resultRef} aria-live="polite">
        {rows && low && high ? (
          <ToolResult
            tool="cout"
            summary={rows.map((r) => `${r.label} ${r.annualBudget} €/an`).join(', ')}
            steps={[
              { href: '/outils/budget', label: 'Le budget au mois, marque par marque', sub: 'Calculé pour son poids' },
              { href: '/quiz', label: 'Quelle marque lui correspond ?', sub: 'Le test en quelques questions' },
            ]}
          >
            <BigResult value={`${high.annualBudget - low.annualBudget} €`} unit="d'écart par an">
              <p>{`Entre ${low.label.toLowerCase()} (${low.annualBudget} € par an) et ${high.label.toLowerCase()} (${high.annualBudget} €), pour la même ration.`}</p>
            </BigResult>
            <ul role="list" className="m-0 flex list-none flex-col gap-4 p-0">
              {rows.map((r) => (
                <li key={r.type} className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0 text-[15px] font-semibold text-ink">{r.label}</span>
                    <span className="shrink-0 text-right text-sm text-ink-2">
                      <strong className="font-display text-lg font-black text-ink">{r.monthlyBudget}&nbsp;€</strong>/mois · {r.annualBudget}&nbsp;€/an
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-pill bg-cream-2">
                    <div className="h-full rounded-pill bg-orange" style={{ width: `${Math.round((r.annualBudget / high.annualBudget) * 100)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </ToolResult>
        ) : null}
      </div>
    </div>
  )
}
