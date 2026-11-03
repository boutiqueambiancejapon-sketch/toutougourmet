'use client'

import { useId, useState } from 'react'
import Link from 'next/link'
import { track } from '@/lib/analytics'
import { brandPricings, calculateDailyCalories, calculateMonthlyBudget, type ActivityLevel, type AgeGroup, type Animal } from '@/lib/calculators'
import { Segmented } from '@/components/tools/Segmented'
import { BigResult, NumberField, SubmitButton, ToolCard } from './fields'
import { PARTNERS, type Partner } from './partners'
import { rationHref } from './ration-params'
import { ToolResult } from './ToolResult'
import type { AccountDog } from './useAccountPrefill'

// @cdc outils — budget mensuel par marque pour la ration calculée (computeRation). Un seul lien
// partenaire : la marque la moins chère pour ce profil ; les autres renvoient à leur fiche.

const ANIMALS = [['chien', 'Chien'], ['chat', 'Chat']] as const
const AGES = [['chiot', 'Jeune'], ['adulte', 'Adulte'], ['senior', 'Senior']] as const
const ACTIVITIES = [['sedentaire', 'Calme'], ['normal', 'Normale'], ['actif', 'Sportive'], ['tres-actif', 'Intense']] as const
const STERILIZED = [['non', 'Non'], ['oui', 'Oui']] as const

const PARTNER_BY_SLUG: Record<string, (typeof PARTNERS)[keyof typeof PARTNERS]> = {
  franklin: PARTNERS.franklin,
  elmut: PARTNERS.elmut,
  'dog-chef': PARTNERS.dogChef,
}

interface Row {
  name: string
  slug: string
  monthly: number
  type: 'croquettes' | 'repas-frais'
}

/** `dog` : profil du compte (poids, âge, activité, stérilisation), sinon formulaire vide. */
export function BudgetCalculator({ dog }: { dog?: AccountDog | null }) {
  const weightId = useId()
  const p = dog?.prefill
  const [animal, setAnimal] = useState<Animal>('chien')
  const [weight, setWeight] = useState(p?.weightKg ?? '')
  const [age, setAge] = useState<AgeGroup>(p?.ageGroup ?? 'adulte')
  const [activity, setActivity] = useState<ActivityLevel>(p?.activityLevel ?? 'normal')
  const [sterilized, setSterilized] = useState<'oui' | 'non'>(p?.sterilized ? 'oui' : 'non')
  const [rows, setRows] = useState<Row[] | null>(null)

  const change = <T,>(setter: (v: T) => void) => (v: T) => { setter(v); setRows(null) }
  const kg = parseFloat(weight.replace(',', '.'))

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!(kg >= 0.5 && kg <= 100)) return
    const kcal = calculateDailyCalories({ animal, weightKg: kg, ageGroup: age, activityLevel: activity, sterilized: sterilized === 'oui' })
    const res = brandPricings
      .filter((b) => animal === 'chien' || b.slug !== 'dog-chef')
      .map((b) => ({ name: b.name, slug: b.slug, monthly: calculateMonthlyBudget(kcal, b), type: b.type }))
      .sort((a, b) => a.monthly - b.monthly)
    setRows(res)
    track('Tool Result', { tool: 'budget' })
  }

  const best = rows?.[0]
  const partner: Partner | null = best && PARTNER_BY_SLUG[best.slug]
    ? { ...PARTNER_BY_SLUG[best.slug], why: `${best.name} est la moins chère des trois pour ce profil, à environ ${best.monthly} € par mois.`, label: `Voir l'offre ${best.name}` }
    : null

  return (
    <div className="flex flex-col gap-4">
      <ToolCard label="Estimer le budget" onSubmit={onSubmit}>
        <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-end gap-3">
          <Segmented name="animal" legend="Animal" options={ANIMALS} value={animal} onChange={change(setAnimal)} />
          <NumberField id={weightId} label="Poids (kg)" value={weight} onChange={change(setWeight)} placeholder="ex. 12" min={0.5} max={100} />
        </div>
        <Segmented name="age" legend="Âge" options={AGES} value={age} onChange={change(setAge)} />
        <Segmented name="activite" legend="Activité" options={ACTIVITIES} value={activity} onChange={change(setActivity)} />
        <Segmented name="sterilise" legend="Stérilisé" options={STERILIZED} value={sterilized} onChange={change(setSterilized)} />
        <SubmitButton>Comparer les budgets</SubmitButton>
      </ToolCard>
      <div aria-live="polite">
        {rows && best ? (
          <ToolResult
            tool="budget"
            summary={rows.map((r) => `${r.name} ${r.monthly} €/mois`).join(', ')}
            partner={partner}
            steps={[
              {
                href: animal === 'chien' ? rationHref({ weightKg: kg, ageGroup: age, activityLevel: activity, sterilized: sterilized === 'oui', food: 'croquettes' }) : '/outils/ration',
                label: 'Combien de grammes par jour ?',
                sub: 'La ration détaillée, avec les mêmes réglages',
              },
              { href: '/chien/marque', label: 'Comparer les compositions', sub: 'Avant de choisir sur le prix' },
            ]}
          >
            <BigResult value={`${best.monthly} €`} unit={`par mois avec ${best.name}`}>
              <p>Estimation pour sa ration calculée, au prix moyen de la gamme standard de chaque marque.</p>
            </BigResult>
            <ul role="list" className="m-0 flex list-none flex-col divide-y divide-line border-y border-line p-0">
              {rows.map((r) => (
                <li key={r.slug}>
                  <Link href={`/chien/marque/${r.slug}`} className="group flex min-h-14 items-center gap-3 py-2 text-ink no-underline">
                    <span className="flex min-w-0 grow flex-col">
                      <span className="font-semibold group-hover:underline">{r.name}</span>
                      <span className="text-sm text-ink-2">{r.type === 'croquettes' ? 'Croquettes, voir la fiche' : 'Repas frais, voir la fiche'}</span>
                    </span>
                    <span className="shrink-0 font-display text-xl font-black">{r.monthly}&nbsp;€</span>
                  </Link>
                </li>
              ))}
            </ul>
          </ToolResult>
        ) : null}
      </div>
    </div>
  )
}
