'use client'

import { useId, useState } from 'react'
import { track } from '@/lib/analytics'
import { calculateDogHumanAge, type DogAgeResult, type SizeCategory } from '@/lib/calculators'
import { Segmented } from '@/components/tools/Segmented'
import { BigResult, NumberField, SubmitButton, ToolCard } from './fields'
import type { NextStep } from './NextSteps'
import { ToolResult } from './ToolResult'
import type { AccountDog } from './useAccountPrefill'

// @cdc outils — âge humain selon le gabarit (tableau AVMA, lib/calculators.ts). Pas de lien
// partenaire : l'âge seul ne justifie aucune marque.

const SIZES = [['petit', 'Petit'], ['moyen', 'Moyen'], ['grand', 'Grand'], ['tres-grand', 'Très grand']] as const
const SIZE_HINT: Record<SizeCategory, string> = {
  petit: 'moins de 10 kg : Yorkshire, Chihuahua, Carlin',
  moyen: '10 à 25 kg : Beagle, Cocker, Bulldog',
  grand: '25 à 45 kg : Labrador, Golden, Husky',
  'tres-grand': 'plus de 45 kg : Dogue allemand, Saint-Bernard',
}

/** Suite logique selon l'étape de vie : ration pré-réglée et guide de l'âge quand il existe. */
function nextSteps(stage: DogAgeResult['stagePill'], size: SizeCategory): NextStep[] {
  if (stage === 'chiot') {
    const big = size === 'grand' || size === 'tres-grand'
    return [
      { href: '/outils/ration?age=chiot', label: 'Calculer sa ration de chiot' },
      big
        ? { href: '/chien/alimentation-quotidienne/croquettes-chiot-grande-race', label: 'Croquettes pour chiot de grande race' }
        : { href: '/fiche-aliments-dangereux', label: 'Les aliments à ne jamais lui donner' },
    ]
  }
  if (stage === 'senior' || stage === 'tres-senior') {
    return [
      { href: '/chien/alimentation-quotidienne/alimentation-chien-senior-guide', label: 'Adapter sa ration après 7 ans', sub: 'Le guide du chien senior' },
      { href: '/outils/ration?age=senior', label: 'Calculer sa ration de senior' },
    ]
  }
  return [
    { href: '/outils/ration?age=adulte', label: 'Calculer sa ration' },
    { href: '/outils/poids', label: 'Vérifier son poids de forme' },
  ]
}

/** Gabarit d'après le poids, mêmes bornes que SIZE_HINT. */
function sizeOf(kg: number | null): SizeCategory {
  if (!kg) return 'moyen'
  if (kg < 10) return 'petit'
  if (kg <= 25) return 'moyen'
  return kg <= 45 ? 'grand' : 'tres-grand'
}

/** `dog` : profil du compte (components/outils/PrefilledTools.tsx), sinon formulaire vide. */
export function AgeCalculator({ dog }: { dog?: AccountDog | null }) {
  const yearsId = useId()
  const monthsId = useId()
  const known = dog?.ageMonths ?? null
  const [years, setYears] = useState(known !== null ? String(Math.floor(known / 12)) : '')
  const [months, setMonths] = useState(known !== null ? String(known % 12) : '0')
  const [size, setSize] = useState<SizeCategory>(dog?.weightKg ? sizeOf(dog.weightKg) : 'moyen')
  const [result, setResult] = useState<{ age: DogAgeResult; label: string; years: number; months: number; size: SizeCategory } | null>(null)

  function reset<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v)
      setResult(null)
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const y = parseInt(years, 10)
    const m = parseInt(months, 10) || 0
    if (!Number.isFinite(y) || y < 0 || y > 25 || y + m === 0) return
    const label = m > 0 ? `${y} an${y > 1 ? 's' : ''} et ${m} mois` : `${y} an${y > 1 ? 's' : ''}`
    setResult({ age: calculateDogHumanAge(y + m / 12, size), label, years: y, months: m, size })
    track('Tool Result', { tool: 'age' })
  }

  const age = result?.age
  return (
    <div className="flex flex-col gap-4">
      <ToolCard label="Convertir son âge" onSubmit={onSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <NumberField id={yearsId} label="Années" value={years} onChange={reset(setYears)} placeholder="ex. 3" min={0} max={25} step={1} />
          <div className="flex min-w-0 flex-col gap-1.5">
            <label htmlFor={monthsId} className="text-sm font-semibold text-ink">Et des mois</label>
            <select
              id={monthsId}
              value={months}
              onChange={(e) => reset(setMonths)(e.target.value)}
              className="min-h-12 w-full min-w-0 rounded-control border-2 border-ink bg-paper px-3 text-lg text-ink outline-none focus-visible:ring-4 focus-visible:ring-amber"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>{i} mois</option>
              ))}
            </select>
          </div>
        </div>
        <Segmented name="gabarit" legend="Gabarit" options={SIZES} value={size} onChange={reset(setSize)} />
        <p className="-mt-2 m-0 text-sm text-ink-2">{SIZE_HINT[size]}</p>
        <SubmitButton>Convertir son âge</SubmitButton>
      </ToolCard>
      <div aria-live="polite">
        {result && age ? (
          <ToolResult tool="age" summary={`${result.label}, gabarit ${size} : ${age.humanAge} ans humains (${age.lifeStage})`} steps={nextSteps(age.stagePill, size)}
            emailInput={{ tool: 'age', years: result.years, months: result.months, size: result.size }}
          >
            <BigResult value={`${age.humanAge} ans`} unit="en âge humain">
              <p>
                <strong className="font-semibold text-ink">{age.lifeStage}.</strong> {age.context}
              </p>
            </BigResult>
          </ToolResult>
        ) : null}
      </div>
    </div>
  )
}
