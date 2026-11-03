import { CheckoutForm } from '@/components/compte/premium/CheckoutForm'
import { ManageForm } from '@/components/compte/premium/ManageForm'
import { PricingGate } from '@/components/compte/premium/PricingGate'
import { formatEuros, PRICE_CENTS, yearlySaving } from '@/lib/premium/pricing'
import type { PremiumMode } from '@/lib/server/membership'

// @cdc premium — section #tarifs de /premium : mensuel ou annuel, prix TTC. L'économie de l'annuel
// est calculée (lib/premium/pricing.ts), jamais arrondie à notre avantage. Paiement en service :
// formulaire (PricingGate) ; sinon, prix affichés et mention de l'offre en cours.

const saving = yearlySaving()

const OFFERS = [
  {
    id: 'annuel',
    name: 'Annuel',
    price: formatEuros(PRICE_CENTS.year),
    unit: 'par an',
    pill: `${saving.percent} % moins cher`,
    text: `Soit ${formatEuros(saving.perMonthCents)} par mois : ${formatEuros(saving.savingCents)} de moins que 12 mois au tarif mensuel (${formatEuros(saving.twelveMonthsCents)}).`,
  },
  {
    id: 'mensuel',
    name: 'Mensuel',
    price: formatEuros(PRICE_CENTS.month),
    unit: 'par mois',
    pill: null,
    text: 'Sans engagement : tu résilies quand tu veux.',
  },
] as const

const MODE_NOTE: Record<Exclude<PremiumMode, 'paid'>, string> = {
  launch: "Pendant le lancement, Premium est gratuit et sans carte bancaire. Ces prix s'appliqueront ensuite : on te prévient par e-mail avant, rien n'est prélevé sans ton accord.",
  soon: 'Paiement en ligne bientôt disponible.',
}

export function PremiumPricing({ mode }: { mode: PremiumMode }) {
  return (
    <section id="tarifs" aria-labelledby="tarifs-titre" className="flex scroll-mt-24 flex-col gap-4">
      <div className="flex max-w-prose flex-col gap-2">
        <h2 id="tarifs-titre" className="m-0 font-display text-2xl font-black text-ink md:text-3xl">
          Combien coûte Premium ?
        </h2>
        <p className="m-0 text-base leading-relaxed text-ink-2">
          Prix TTC. Résiliation depuis ton compte à tout moment : Premium reste actif jusqu&apos;à la fin de la période payée, sans autre prélèvement.
        </p>
      </div>
      <ul role="list" className="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2">
        {OFFERS.map((o) => (
          <li key={o.id} className={`m-0 flex flex-col gap-2 rounded-card p-5 ${o.pill ? 'border-2 border-orange bg-amber-bg' : 'border border-line bg-paper'}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="m-0 font-display text-2xl font-black text-ink">{o.name}</h3>
              {o.pill ? <span className="rounded-pill bg-orange px-3 py-1 text-sm font-semibold text-ink">{o.pill}</span> : null}
            </div>
            <p className="m-0 flex items-baseline gap-2">
              <span className="font-display text-4xl font-black text-ink">{o.price}</span>
              <span className="text-base text-ink-2">{o.unit}</span>
            </p>
            <p className="m-0 text-base leading-snug text-ink-2">{o.text}</p>
          </li>
        ))}
      </ul>
      <div className="rounded-card border border-line bg-paper p-5 md:p-6">
        {mode === 'paid' ? (
          <PricingGate checkout={<CheckoutForm />} manage={<ManageForm />} />
        ) : (
          <p className={`m-0 text-base leading-relaxed ${mode === 'soon' ? 'font-semibold text-ink' : 'text-ink-2'}`}>{MODE_NOTE[mode]}</p>
        )}
      </div>
    </section>
  )
}
