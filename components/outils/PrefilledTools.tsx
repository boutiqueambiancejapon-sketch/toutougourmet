'use client'

import Link from 'next/link'
import { AgeCalculator } from './AgeCalculator'
import { BodyScoreEvaluator } from './BodyScoreEvaluator'
import { BudgetCalculator } from './BudgetCalculator'
import { useAccountPrefill, type AccountDog } from './useAccountPrefill'

// @cdc premium — outils pré-remplis avec le premier chien du compte (même mécanisme que la ration :
// témoin tg_compte puis GET /api/compte/profil). Sans compte, l'outil s'affiche vide, la page
// reste statique. Le formulaire est remonté (key) quand le profil arrive.

export function AccountPrefillNote({ dog }: { dog: AccountDog }) {
  return (
    <p className="m-0 text-[15px] text-ink-2">
      {`Pré-rempli avec le profil de ${dog.name}. `}
      <Link href={`/compte/chien/${dog.id}/modifier`} className="font-semibold text-orange-ink underline underline-offset-2">
        Modifier son profil
      </Link>
    </p>
  )
}

function Prefilled({ dog, children }: { dog: AccountDog | null; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      {dog ? <AccountPrefillNote dog={dog} /> : null}
      {children}
    </div>
  )
}

export function PrefilledAgeCalculator() {
  const dog = useAccountPrefill()
  return (
    <Prefilled dog={dog?.ageMonths !== null ? dog : null}>
      <AgeCalculator key={dog?.id ?? 'vide'} dog={dog} />
    </Prefilled>
  )
}

export function PrefilledBodyScoreEvaluator() {
  const dog = useAccountPrefill()
  return (
    <Prefilled dog={dog?.weightKg ? dog : null}>
      <BodyScoreEvaluator key={dog?.id ?? 'vide'} dog={dog} />
    </Prefilled>
  )
}

export function PrefilledBudgetCalculator() {
  const dog = useAccountPrefill()
  return (
    <Prefilled dog={dog?.weightKg ? dog : null}>
      <BudgetCalculator key={dog?.id ?? 'vide'} dog={dog} />
    </Prefilled>
  )
}
