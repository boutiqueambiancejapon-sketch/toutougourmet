import Link from 'next/link'
import type { Dog } from '@/db/schema'
import { rationHref } from '@/components/outils/ration-params'
import { weightGainOffer } from '@/lib/account-offers'
import { computeRation } from '@/lib/calculators'
import { ageGroupOf, formatKg } from '@/lib/dog-profile'
import type { WeightTrend } from '@/lib/weight-trend'
import { OfferCard, PARTNER_NOTICE } from './OfferCard'

// @cdc premium — alerte de poids sur la fiche du chien (Premium) : plus de 5 % de variation entre
// les deux dernières pesées, à moins de 2 mois d'écart (lib/weight-trend.ts). Prise de poids :
// ration recalculée au poids d'avant et offre Dog Chef (portions recalculées, data/brands.ts).

const pct = (v: number) => `${v > 0 ? '+' : '−'}${String(Math.abs(v)).replace('.', ',')} %`

export function WeightAlert({ dog, trend }: { dog: Dog; trend: WeightTrend }) {
  const facts = `${pct(trend.pct)} en ${trend.days} jours, de ${formatKg(trend.from.weightKg)} à ${formatKg(trend.to.weightKg)}.`
  if (trend.kind === 'loss') {
    return (
      <section aria-labelledby="alerte-poids" className="flex flex-col gap-2 rounded-card border-2 border-ink bg-amber-bg p-4">
        <h2 id="alerte-poids" className="m-0 font-display text-xl font-black text-ink">{`${dog.name} perd du poids`}</h2>
        <p className="m-0 text-[15px] leading-relaxed text-ink-2">
          {facts} Sans régime en cours, montre ces pesées à ton vétérinaire.
        </p>
      </section>
    )
  }
  const ageGroup = ageGroupOf(dog.birthDate) ?? 'adulte'
  const target = trend.from.weightKg
  const ration = computeRation({ animal: 'chien', weightKg: target, ageGroup, activityLevel: dog.activity, sterilized: dog.sterilized })
  const href = rationHref({ weightKg: target, ageGroup, activityLevel: dog.activity, sterilized: dog.sterilized, food: 'croquettes' })
  return (
    <section aria-labelledby="alerte-poids" className="flex flex-col gap-3 rounded-card border-2 border-ink bg-amber-bg p-4">
      <h2 id="alerte-poids" className="m-0 font-display text-xl font-black text-ink">{`${dog.name} prend du poids`}</h2>
      <p className="m-0 text-[15px] leading-relaxed text-ink-2">
        {facts} Pour revenir à {formatKg(target)}, sa ration tombe à environ <strong className="font-semibold text-ink">{ration.gKibble} g de croquettes par jour</strong> (à 360 kcal pour 100 g), friandises comprises.
      </p>
      <Link href={href} className="inline-flex min-h-11 w-full items-center justify-center whitespace-nowrap rounded-control bg-ink px-4 text-[15px] font-semibold text-cream no-underline sm:w-auto sm:self-start">
        Recalculer sa ration
      </Link>
      <OfferCard offer={weightGainOffer()} cta="account-weight-offer" />
      <p className="m-0 text-xs text-ink-2">{PARTNER_NOTICE}</p>
    </section>
  )
}

export function WeightAlertTeaser() {
  return (
    <p className="m-0 text-sm text-ink-2">
      Les alertes de prise ou de perte de poids sont incluses dans Premium, gratuit pendant le lancement.{' '}
      <Link href="/compte#premium" className="font-semibold text-orange-ink underline underline-offset-2">
        Passer Premium
      </Link>
    </p>
  )
}
