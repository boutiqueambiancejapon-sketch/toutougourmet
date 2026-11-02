'use client'

import { useId, useState } from 'react'
import { track } from '@/lib/analytics'
import { ASSUMED_DRY_MOISTURE, carbsCriterion, dryMatterBasis } from '@/lib/scanner/score'
import { BigResult, NumberField, SubmitButton, ToolCard } from '@/components/outils/fields'

// @cdc lot 6 — calculateur de glucides de /scanner, sans compte : même calcul que la note
// (dryMatterBasis et carbsCriterion de lib/scanner/score.ts), mêmes hypothèses (humidité 10 %).

type Key = 'proteines' | 'matieresGrasses' | 'cendres' | 'cellulose' | 'humidite'

const FIELDS: { key: Key; label: string; placeholder: string; hint?: string }[] = [
  { key: 'proteines', label: 'Protéines', placeholder: '26' },
  { key: 'matieresGrasses', label: 'Matières grasses', placeholder: '15' },
  { key: 'cendres', label: 'Cendres brutes', placeholder: '7' },
  { key: 'cellulose', label: 'Cellulose brute', placeholder: '3', hint: 'fibres' },
  { key: 'humidite', label: 'Humidité', placeholder: String(ASSUMED_DRY_MOISTURE), hint: 'facultatif' },
]

const fmt = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 1 })
const num = (v: string): number | null => {
  const n = parseFloat(v.replace(',', '.'))
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : null
}

interface Result {
  asFed: number
  dm: number
  points: number
  reading: string
  assumed: boolean
}

export function CarbsCalculator() {
  const uid = useId()
  const [values, setValues] = useState<Record<Key, string>>({ proteines: '', matieresGrasses: '', cendres: '', cellulose: '', humidite: '' })
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState<string | null>(null)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const basis = dryMatterBasis(
      { proteines: num(values.proteines), matieresGrasses: num(values.matieresGrasses), cendres: num(values.cendres), cellulose: num(values.cellulose), humidite: num(values.humidite) },
      'sec',
    )
    if (basis.carbsAsFed === null || basis.carbsDm === null) {
      setResult(null)
      setError(`Ces quatre valeurs dépassent 80 % à elles seules : on ne peut pas supposer ${ASSUMED_DRY_MOISTURE} % d'humidité. Recopie celle du sac.`)
      return
    }
    const c = carbsCriterion(basis.carbsDm)
    setError(null)
    setResult({ asFed: basis.carbsAsFed, dm: basis.carbsDm, points: c.points, reading: c.explanation, assumed: basis.assumedMoisture })
    track('Tool Result', { tool: 'glucides' })
  }

  return (
    <div className="flex flex-col gap-4">
      <ToolCard label="Calculer le taux de glucides" onSubmit={onSubmit}>
        <p className="m-0 text-sm text-ink-2">Recopie les constituants analytiques du sac, en %.</p>
        <div className="grid grid-cols-2 gap-3">
          {FIELDS.map((f) => (
            <NumberField
              key={f.key}
              id={`${uid}-${f.key}`}
              label={f.label}
              hint={f.hint}
              value={values[f.key]}
              onChange={(v) => {
                setValues((prev) => ({ ...prev, [f.key]: v }))
                setResult(null)
              }}
              placeholder={f.placeholder}
              min={0}
              max={100}
              required={f.key !== 'humidite'}
            />
          ))}
        </div>
        <SubmitButton>Calculer les glucides</SubmitButton>
      </ToolCard>
      <div aria-live="polite">
        {error ? <p className="m-0 rounded-box bg-amber-bg p-3 text-[15px] text-amber-ink">{error}</p> : null}
        {result ? (
          <div className="flex flex-col gap-3 rounded-card border-2 border-ink bg-paper p-4 sm:p-6">
            <BigResult value={fmt(result.dm)} unit="% de glucides sur matière sèche">
              <p>{`Soit ${fmt(result.asFed)} % sur le produit tel quel. Dans la note sur 100 : ${result.points} points sur 15.`}</p>
              <p>{result.reading}</p>
              {result.assumed ? <p>{`Humidité non renseignée : on a retenu ${ASSUMED_DRY_MOISTURE} %, valeur courante des croquettes.`}</p> : null}
            </BigResult>
            <a href="#scan" className="inline-flex min-h-12 items-center justify-center rounded-control bg-ink px-5 font-semibold text-cream no-underline hover:underline sm:self-start">
              Analyser toute l&apos;étiquette
            </a>
          </div>
        ) : null}
      </div>
    </div>
  )
}
