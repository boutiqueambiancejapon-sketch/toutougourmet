import type { ActivityLevel, AgeGroup, RationValues } from '@/lib/calculators'
import { BigResult } from './fields'
import type { NextStep } from './NextSteps'
import { rationOffer } from '@/lib/ration-offer'
import type { Partner } from './partners'
import type { RationFood } from './ration-params'
import { ToolResult } from './ToolResult'

// Résultat de /outils/ration : les grammes pour l'aliment choisi, les kcal, l'équivalent dans
// l'autre aliment et la répartition en repas. Offre partenaire calculée sur ces grammes
// (lib/ration-offer.ts) : Franklin pour les croquettes, Dog Chef pour le repas frais, sous la
// carte compte (carte des conversions : compte d'abord, partenaire ensuite).

interface RationForm {
  animal: 'chien'
  weightKg: number
  ageGroup: AgeGroup
  activityLevel: ActivityLevel
  sterilized: boolean
  highEnergy: boolean
  food: RationFood
}

const AGE_LABEL: Record<AgeGroup, string> = { chiot: 'jeune', adulte: 'adulte', senior: 'senior' }

function steps(form: RationForm): NextStep[] {
  const brands: NextStep =
    form.ageGroup === 'chiot' && form.weightKg >= 20
      ? { href: '/chien/alimentation-quotidienne/croquettes-chiot-grande-race', label: 'Quelles croquettes pour un chiot de grande race ?' }
      : { href: '/chien/marque', label: 'Quelles marques pour lui ?', sub: 'Compositions et prix comparés' }
  return [
    { href: '/fiche-aliments-dangereux', label: 'Les aliments à ne jamais lui donner', sub: 'La liste complète, en fiche à imprimer' },
    brands,
  ]
}

function partner(grams: number, form: RationForm, dogName?: string | null): Partner | null {
  const offer = rationOffer({ grams, fresh: form.food === 'frais', dogName })
  if (!offer) return null
  return { ...offer, label: `Voir l'offre ${offer.brand}` }
}

export function RationResult({ result, form, dogName }: { result: RationValues; form: RationForm; dogName?: string | null }) {
  const fresh = form.food === 'frais'
  const grams = fresh ? result.gFresh : result.gKibble
  const other = fresh ? `${result.gKibble} g de croquettes` : `${result.gFresh} g de repas frais`
  const meals = form.ageGroup === 'chiot' ? 3 : 2
  const what = fresh ? 'de repas frais par jour' : 'de croquettes par jour'
  const summary = `${grams} g ${what} (${result.kcal} kcal) pour un chien ${AGE_LABEL[form.ageGroup]} de ${form.weightKg} kg`

  return (
    <ToolResult
      tool="ration"
      summary={summary}
      steps={steps(form)}
      partner={partner(grams, form, dogName)}
      dogName={dogName}
      emailInput={{ tool: 'ration', weightKg: form.weightKg, ageGroup: form.ageGroup, activityLevel: form.activityLevel, sterilized: form.sterilized, highEnergy: form.highEnergy, food: form.food }}
    >
      <BigResult value={`${grams} g`} unit={what}>
        <p>
          {`Soit ${result.kcal} kcal. En ${meals} repas : environ ${Math.round(grams / meals)} g chacun. Pour la même énergie, il faudrait ${other}.`}
        </p>
        <p>Pèse la ration avec une balance de cuisine et compte les friandises dedans. Ajuste de 10 % si son poids bouge sur 4 semaines.</p>
      </BigResult>
    </ToolResult>
  )
}
