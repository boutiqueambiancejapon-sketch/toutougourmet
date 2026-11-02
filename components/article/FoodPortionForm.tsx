'use client'

import { useId, useRef, useState } from 'react'
import { track } from '@/lib/analytics'
import { bandFor, type SizeBand } from '@/lib/size-bands'
import { useAccountPrefill } from '@/components/outils/useAccountPrefill'

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
  bands: SizeBand[]
}

/** Compte connecté : poids et stérilisation du premier chien (même mécanisme que /outils/ration). */
export function FoodPortionForm(props: FoodPortionFormProps) {
  const dog = useAccountPrefill()
  if (!dog?.weightKg) return <FoodPortionFields {...props} />
  return (
    <>
      <p className="m-0 text-sm text-ink-2">{`Rempli avec le poids de ${dog.name}.`}</p>
      <FoodPortionFields key={dog.id} {...props} initialWeight={String(dog.weightKg)} initialNeutered={dog.prefill.sterilized ?? true} />
    </>
  )
}

function FoodPortionFields({ ofFood, kcal100, moderation, bands, initialWeight = '', initialNeutered = true }: FoodPortionFormProps & { initialWeight?: string; initialNeutered?: boolean }) {
  const id = useId()
  const [weight, setWeight] = useState(initialWeight)
  const [neutered, setNeutered] = useState(initialNeutered)
  const tracked = useRef(false)

  const kg = Number(weight.replace(',', '.'))
  const valid = weight !== '' && Number.isFinite(kg) && kg >= 1 && kg <= 90
  const grams = valid ? maxGrams(kg, neutered, kcal100, moderation) : null
  const band = valid && bands.length > 0 ? bandFor(bands, kg) : undefined
  const ceiling = valid ? maxGrams(kg, neutered, kcal100, false) : null

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
        {band && ceiling !== null ? (
          <>
            <span className={`rounded-box px-4 py-3 text-base font-semibold leading-snug text-ink ${moderation ? 'bg-amber-bg' : 'bg-green-bg'}`}>
              {band.gMin === band.gMax ? `${band.gMin} g` : `${band.gMin} à ${band.gMax} g`} {ofFood}
              {band.frequency ? `, ${band.frequency}` : ' par prise'}.
            </span>
            <span className="text-sm text-ink-2">
              Portion conseillée dans ce guide pour un chien de {kg} kg. Plafond de toutes ses friandises du jour :{' '}
              {ceiling} g de cet aliment au plus (10 % des calories, WSAVA).
            </span>
          </>
        ) : grams !== null ? (
          <>
            <span className="rounded-box bg-cream-2 px-4 py-3 text-base font-semibold leading-snug text-ink">
              Plafond : {grams < 5 ? 'moins de 5 g' : `${grams} g`} {ofFood} par jour au grand maximum, si c&apos;est sa seule friandise.
            </span>
            <span className="text-sm text-ink-2">
              C&apos;est une limite, pas une portion : 10 % de ses calories du jour (WSAVA){moderation ? ', divisés par deux pour un aliment à donner avec modération' : ''}. Pour la quantité courante, suis les portions par gabarit de ce guide.
            </span>
          </>
        ) : null}
      </output>
    </div>
  )
}
