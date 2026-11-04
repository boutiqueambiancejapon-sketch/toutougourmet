'use client'

import Link from 'next/link'
import { useEffect, useId, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { track } from '@/lib/analytics'
import { computeRation, type ActivityLevel, type AgeGroup, type RationValues } from '@/lib/calculators'
import { Segmented } from '@/components/tools/Segmented'
import { CheckField, NumberField, SubmitButton, ToolCard } from './fields'
import { RationResult } from './RationResult'
import { FOOD_OPTIONS, parseRationParams, type RationFood, type RationPrefill } from './ration-params'
import { useAccountPrefill } from './useAccountPrefill'
import { useResultReveal } from '@/lib/use-result-reveal'

// @cdc outils — calculateur complet de /outils/ration. Même fonction que le mini-outil de
// l'accueil (computeRation, lib/calculators.ts) : mêmes réglages, même résultat.

type YesNo = 'oui' | 'non'

interface FormState {
  /** Site 100 % chien : toujours 'chien' (la formule de lib/calculators.ts garde le cas du chat) */
  animal: 'chien'
  weightKg: string
  ageGroup: AgeGroup
  activityLevel: ActivityLevel
  sterilized: boolean
  isHighEnergy: boolean
  food: RationFood
}

const DEFAULT_FORM: FormState = {
  animal: 'chien',
  weightKg: '',
  ageGroup: 'adulte',
  activityLevel: 'normal',
  sterilized: false,
  isHighEnergy: false,
  food: 'croquettes',
}

const AGES = [['chiot', 'Chiot'], ['adulte', 'Adulte'], ['senior', 'Senior']] as const
const ACTIVITIES = [['sedentaire', 'Calme'], ['normal', 'Normale'], ['actif', 'Sportive'], ['tres-actif', 'Intense']] as const
const STERILIZED = [['non', 'Non'], ['oui', 'Oui']] as const

function compute(form: FormState): RationValues | null {
  const weight = parseFloat(form.weightKg.replace(',', '.'))
  if (!Number.isFinite(weight) || weight < 0.5 || weight > 100) return null
  return computeRation({
    animal: form.animal,
    weightKg: weight,
    ageGroup: form.ageGroup,
    activityLevel: form.activityLevel,
    sterilized: form.sterilized,
    isRaceHighEnergy: form.isHighEnergy,
  })
}

/**
 * Lit les paramètres d'URL (?poids=…) pour pré-remplir le formulaire. useSearchParams impose
 * une limite <Suspense> dans la page : la page reste statique, son repli est <RationCalculator />.
 * Sans paramètre et avec un compte connecté, le premier chien du compte pré-remplit l'outil (lot 4).
 */
export function RationCalculatorFromUrl() {
  const params = useSearchParams()
  const query = params.toString()
  const dog = useAccountPrefill(query === '')
  if (dog) {
    return (
      <div className="flex flex-col gap-2">
        <p className="m-0 text-[15px] text-ink-2">
          {`Pré-rempli avec le profil de ${dog.name}. `}
          <Link href={`/compte/chien/${dog.id}/modifier`} className="font-semibold text-orange-ink underline underline-offset-2">
            Modifier son profil
          </Link>
        </p>
        <RationCalculator key={`compte-${dog.id}`} prefill={dog.prefill} source="compte" dogName={dog.name} />
      </div>
    )
  }
  return <RationCalculator key={query} prefill={parseRationParams(params)} />
}

export function RationCalculator({
  prefill = {},
  source = 'lien',
  dogName,
}: {
  prefill?: RationPrefill
  source?: 'lien' | 'compte'
  dogName?: string
}) {
  const weightId = useId()
  // Les clés absentes de l'URL valent undefined : elles ne doivent pas écraser les valeurs par défaut.
  const initial: FormState = { ...DEFAULT_FORM, ...Object.fromEntries(Object.entries(prefill).filter(([, v]) => v !== undefined)) }
  const [form, setForm] = useState<FormState>(initial)
  // Poids reçu (URL ou profil du compte) : le résultat s'affiche tout de suite.
  const [result, setResult] = useState<RationValues | null>(() => (prefill.weightKg ? compute(initial) : null))
  const fromUrl = Boolean(prefill.weightKg)
  const [resultRef, reveal] = useResultReveal()

  useEffect(() => {
    if (fromUrl) track('Tool Result', { tool: 'ration', source })
  }, [fromUrl, source])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setResult(null)
  }


  return (
    <div className="flex flex-col gap-4">
      <ToolCard
        label="Calculer la ration"
        onSubmit={(e) => {
          e.preventDefault()
          const values = compute(form)
          if (!values) return
          setResult(values)
          track('Tool Result', { tool: 'ration' })
          reveal()
        }}
      >
        <NumberField id={weightId} label="Poids (kg)" value={form.weightKg} onChange={(v) => set('weightKg', v)} placeholder="ex. 12" min={0.5} max={100} />
        <Segmented name="age" legend="Âge" hint="avant 1 an, après 7 ans" options={AGES} value={form.ageGroup} onChange={(v) => set('ageGroup', v)} />
        <Segmented name="activite" legend="Activité" options={ACTIVITIES} value={form.activityLevel} onChange={(v) => set('activityLevel', v)} />
        <Segmented<YesNo> name="sterilise" legend="Stérilisé" options={STERILIZED} value={form.sterilized ? 'oui' : 'non'} onChange={(v) => set('sterilized', v === 'oui')} />
        <Segmented name="aliment" legend="Il mange" options={FOOD_OPTIONS} value={form.food} onChange={(v) => set('food', v)} />
        <CheckField checked={form.isHighEnergy} onChange={(v) => set('isHighEnergy', v)}>
          Race très énergique <span className="text-ink-2">(Border Collie, Husky, Malinois…)</span>
        </CheckField>
        <SubmitButton>Calculer sa ration</SubmitButton>
      </ToolCard>
      <div ref={resultRef} aria-live="polite">
        {result ? (
          <RationResult
            result={result}
            form={{ ...form, highEnergy: form.isHighEnergy, weightKg: parseFloat(form.weightKg.replace(',', '.')) }}
            dogName={dogName}
          />
        ) : null}
      </div>
    </div>
  )
}
