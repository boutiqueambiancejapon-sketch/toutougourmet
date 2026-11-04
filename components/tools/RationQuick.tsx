'use client'

import { useId, useState } from 'react'
import Link from 'next/link'
import { track } from '@/lib/analytics'
import { computeRation, BARF_KCAL_100G, FRESH_KCAL_100G, KIBBLE_KCAL_100G, type ActivityLevel, type AgeGroup } from '@/lib/calculators'
import { IconChevron } from '@/components/icons'
import { Segmented } from './Segmented'
import { FOOD_OPTIONS, gramsFor, rationHref, type RationFood } from '@/components/outils/ration-params'
import { useResultReveal } from '@/lib/use-result-reveal'

// @cdc 04-pages — calculateur de ration compact du hero (audit design-CRO, §3 Accueil).
// Même fonction que l'outil complet /outils/ration (computeRation, lib/calculators.ts) : mêmes
// réglages, même résultat. Bouton encre et non orange : l'en-tête
// et la barre d'onglets portent déjà l'aplat orange du test.
type Food = RationFood
type YesNo = 'oui' | 'non'

const AGES = [['chiot', 'Chiot'], ['adulte', 'Adulte'], ['senior', 'Senior']] as const
const ACTIVITIES = [['sedentaire', 'Calme'], ['normal', 'Normale'], ['actif', 'Sportive']] as const
const STERILIZED = [['non', 'Non'], ['oui', 'Oui']] as const

const FOOD_TEXT: Record<Food, { what: string; density: string }> = {
  croquettes: { what: 'de croquettes par jour', density: `des croquettes à ${KIBBLE_KCAL_100G} kcal les 100 g` },
  frais: { what: 'de repas frais cuits par jour', density: `un repas frais cuit à ${FRESH_KCAL_100G} kcal les 100 g` },
  barf: { what: 'de BARF (cru) par jour', density: `un BARF à ${BARF_KCAL_100G} kcal les 100 g` },
}

export function RationQuick({ headingId }: { headingId: string }) {
  const weightId = useId()
  const [weight, setWeight] = useState('')
  const [age, setAge] = useState<AgeGroup>('adulte')
  const [activity, setActivity] = useState<ActivityLevel>('normal')
  const [sterilized, setSterilized] = useState<YesNo>('non')
  const [food, setFood] = useState<Food>('croquettes')
  const [shown, setShown] = useState(false)
  const [resultRef, reveal] = useResultReveal()

  const kg = parseFloat(weight.replace(',', '.'))
  const valid = Number.isFinite(kg) && kg >= 0.5 && kg <= 100
  const ration = valid
    ? computeRation({ animal: 'chien', weightKg: kg, ageGroup: age, activityLevel: activity, sterilized: sterilized === 'oui' })
    : { kcal: 0, gKibble: 0, gFresh: 0, gBarf: 0 }
  const { kcal } = ration
  const grams = gramsFor(ration, food)

  return (
    <form
      aria-labelledby={headingId}
      className="flex flex-col gap-3 rounded-card border border-line bg-paper p-4 sm:gap-4 sm:p-6"
      onSubmit={(e) => {
        e.preventDefault()
        if (!valid) return
        setShown(true)
        track('Tool Result', { tool: 'ration-accueil' })
        reveal()
      }}
    >
      <h2 id={headingId} className="m-0 font-display text-[1.6rem] font-black leading-tight text-ink">
        Combien de grammes pour ton chien ?
      </h2>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={weightId} className="text-sm font-semibold text-ink">
          Son poids (kg)
        </label>
        <input
          id={weightId}
          type="number"
          inputMode="decimal"
          min="0.5"
          max="100"
          step="0.1"
          required
          placeholder="ex. 12"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="min-h-12 w-full rounded-control border-2 border-ink bg-paper px-4 text-lg text-ink outline-none placeholder:text-ink-3 focus-visible:ring-4 focus-visible:ring-amber"
        />
      </div>
      <Segmented name="age" legend="Son âge" hint="chiot avant 1 an, senior après 7 ans" options={AGES} value={age} onChange={setAge} />
      <Segmented name="activite" legend="Son activité" options={ACTIVITIES} value={activity} onChange={setActivity} />
      <Segmented name="sterilise" legend="Stérilisé" options={STERILIZED} value={sterilized} onChange={setSterilized} />
      <Segmented name="aliment" legend="Il mange" options={FOOD_OPTIONS} value={food} onChange={setFood} />
      <button type="submit" className="min-h-12 rounded-control bg-ink px-5 text-base font-semibold text-cream hover:underline">
        Calculer sa ration
      </button>
      <div ref={resultRef} aria-live="polite">
        {shown && valid ? (
          <div data-tool-result tabIndex={-1} className="flex scroll-mt-20 flex-col gap-3 border-t border-line pt-4">
            <p className="m-0 flex flex-wrap items-baseline gap-x-2 text-ink">
              <span className="font-display text-4xl font-black">{grams} g</span>
              <span className="text-base">{FOOD_TEXT[food].what}</span>
            </p>
            <p className="m-0 text-sm text-ink-2">
              {`Soit ${kcal} kcal, calculés avec la formule NRC 2006 pour ${FOOD_TEXT[food].density}. Ajuste selon son poids sur 4 semaines.`}
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link
                href={rationHref({ weightKg: kg, ageGroup: age, activityLevel: activity, sterilized: sterilized === 'oui', food })}
                className="inline-flex min-h-11 items-center rounded-control border-[1.5px] border-ink px-4 text-[15px] font-semibold text-ink no-underline"
              >
                Voir le calcul détaillé
              </Link>
              <Link href="/chien/urgences" className="inline-flex min-h-11 items-center gap-1 text-[15px] font-semibold text-orange-ink no-underline hover:underline">
                Aliments à éviter pour lui
                <IconChevron className="size-4" />
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </form>
  )
}
