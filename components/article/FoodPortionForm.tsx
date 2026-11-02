'use client'

import { useId, useRef, useState } from 'react'
import { track } from '@/lib/analytics'

// Besoin du jour : RER = 70 × poids^0,75 (NRC 2006, Nutrient Requirements of Dogs and Cats),
// multiplié par 1,6 pour un adulte non stérilisé et 1,4 pour un adulte stérilisé
// (facteurs repris par les WSAVA Global Nutrition Guidelines). Friandises : 10 % du besoin
// du jour au plus (WSAVA, AAHA 2021), règle déjà appliquée dans les guides du site.
const TREAT_SHARE = 0.1

function maxGrams(weight: number, neutered: boolean, kcal100: number, moderation: boolean): number {
  const rer = 70 * weight ** 0.75
  const budget = rer * (neutered ? 1.4 : 1.6) * TREAT_SHARE * (moderation ? 0.5 : 1)
  return Math.round((budget / kcal100) * 100 / 5) * 5
}

interface FoodPortionFormProps {
  ofFood: string
  kcal100: number
  moderation: boolean
}

export function FoodPortionForm({ ofFood, kcal100, moderation }: FoodPortionFormProps) {
  const id = useId()
  const [weight, setWeight] = useState('')
  const [neutered, setNeutered] = useState(true)
  const tracked = useRef(false)

  const kg = Number(weight.replace(',', '.'))
  const valid = weight !== '' && Number.isFinite(kg) && kg >= 1 && kg <= 90
  const grams = valid ? maxGrams(kg, neutered, kcal100, moderation) : null

  function onWeight(value: string) {
    setWeight(value)
    const n = Number(value.replace(',', '.'))
    if (!tracked.current && n >= 1 && n <= 90) {
      tracked.current = true
      track('Tool Result', { tool: 'mini-calcul-article' })
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label htmlFor={`${id}-kg`} className="flex flex-col gap-1 text-sm font-semibold text-ink">
          Poids de ton chien (kg)
          <input
            id={`${id}-kg`}
            type="number"
            inputMode="decimal"
            min={1}
            max={90}
            step={0.1}
            placeholder="12"
            value={weight}
            onChange={(e) => onWeight(e.target.value)}
            className="min-h-11 rounded-control border border-line bg-paper px-3 text-base font-normal text-ink"
          />
        </label>
        <label htmlFor={`${id}-st`} className="flex flex-col gap-1 text-sm font-semibold text-ink">
          Stérilisation
          <select
            id={`${id}-st`}
            value={neutered ? 'oui' : 'non'}
            onChange={(e) => setNeutered(e.target.value === 'oui')}
            className="min-h-11 rounded-control border border-line bg-paper px-3 text-base font-normal text-ink"
          >
            <option value="oui">Stérilisé</option>
            <option value="non">Non stérilisé</option>
          </select>
        </label>
      </div>
      <output htmlFor={`${id}-kg ${id}-st`} aria-live="polite" className="flex flex-col gap-1">
        {weight !== '' && !valid ? <span className="text-sm text-ink-2">Indique un poids entre 1 et 90 kg.</span> : null}
        {grams !== null ? (
          <>
            <span className={`rounded-box px-4 py-3 text-base font-semibold leading-snug text-ink ${moderation ? 'bg-amber-bg' : 'bg-green-bg'}`}>
              {grams < 5 ? 'Moins de 5 g' : `Au maximum ${grams} g`} {ofFood} par jour, s&apos;il ne mange pas
              d&apos;autre friandise.
            </span>
            {moderation ? (
              <span className="text-sm text-ink-2">Plafond divisé par deux, car cet aliment se donne avec modération.</span>
            ) : null}
            <span className="text-sm text-ink-2">Repère de calcul : 10 % des calories du jour (WSAVA).</span>
          </>
        ) : null}
      </output>
    </div>
  )
}
