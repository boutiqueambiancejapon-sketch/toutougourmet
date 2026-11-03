'use client'

import { TextField } from '@/components/compte/fields'
import { Segmented } from '@/components/tools/Segmented'
import { gramsOf } from '@/lib/garde/draft'
import { DEFAULT_TIMES } from '@/lib/garde/sheet'
import { Fieldset, TwoCols, type PartProps } from './form-parts'

// @cdc fiche de garde — repas : ration calculée (modifiable si le sac dit autre chose), nombre
// de repas, heures, croquettes habituelles.

const MEALS = [['1', '1'], ['2', '2'], ['3', '3'], ['4', '4']] as const

export function MealFields({ id, v, set, err }: PartProps) {
  const grams = gramsOf(v)
  const auto = v.gramsPerDay.trim() === ''
  const perMeal = grams ? Math.round(grams / v.meals) : null

  function setMeals(n: number) {
    set('meals', n)
    set('mealTimes', DEFAULT_TIMES[n])
  }

  return (
    <Fieldset legend="Ses repas">
      <p className="m-0 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 rounded-control bg-green-bg px-4 py-3 text-[15px] text-ink" aria-live="polite">
        <span>
          {grams ? (
            <>
              <strong className="font-semibold">{`${grams} g de croquettes par jour`}</strong>
              {perMeal && v.meals > 1 ? `, soit ${v.meals} × ${perMeal} g` : null}
            </>
          ) : (
            'La ration se calcule dès que le poids est rempli.'
          )}
        </span>
        <span className="rounded-pill bg-green px-2 py-0.5 text-xs font-semibold text-green-ink">{auto ? 'Calculée' : 'Ta valeur'}</span>
      </p>
      <TextField
        id={`${id}-grams`}
        name="gramsPerDay"
        label="Grammes par jour, si le sac dit autre chose (facultatif)"
        type="text"
        inputMode="numeric"
        value={v.gramsPerDay}
        onChange={(x) => set('gramsPerDay', x.replace(/[^0-9]/g, ''))}
        placeholder={grams ? `ex. ${grams}` : 'ex. 160'}
        error={err.gramsPerDay}
      />
      <Segmented name={`${id}-meals`} legend="Repas par jour" options={MEALS} value={String(v.meals) as '1' | '2' | '3' | '4'} onChange={(x) => setMeals(Number(x))} />
      <TwoCols>
        {v.mealTimes.slice(0, v.meals).map((t, i) => (
          <TextField
            key={i}
            id={`${id}-time-${i}`}
            name={`mealTime${i}`}
            label={`Heure du repas ${i + 1}`}
            type="time"
            value={t}
            onChange={(x) => set('mealTimes', v.mealTimes.map((old, j) => (j === i ? x : old)))}
            error={i === 0 ? err.mealTimes : undefined}
          />
        ))}
      </TwoCols>
      <TextField id={`${id}-food`} name="food" label="Ses croquettes (marque, recette)" value={v.food} onChange={(x) => set('food', x)} maxLength={160} placeholder="ex. Franklin adulte poulet" error={err.food} />
    </Fieldset>
  )
}
