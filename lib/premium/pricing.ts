// @cdc premium — prix de Premium (décision du 2026-11-03, DECISIONS.md) : 5,99 € par mois sans
// engagement ou 29,99 € par an, TTC. Montants en centimes, comme dans Stripe (scripts/stripe-setup.ts
// crée les Prices avec ces valeurs). L'économie de l'annuel est calculée, jamais écrite à la main :
// 12 × 5,99 € = 71,88 €, donc l'annuel fait gagner 41,89 € (58 %), un peu moins de 7 mois.
// « 2 mois offerts » serait faux (l'économie est bien plus grande) : on affiche le chiffre exact.

export const PRICE_CENTS = { month: 599, year: 2999 } as const

export type Interval = keyof typeof PRICE_CENTS

const euros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

/** « 5,99 € » (espace insécable fine avant €, comme le reste du site via Intl). */
export function formatEuros(cents: number): string {
  return euros.format(cents / 100)
}

/** « 3 février 2027 », « 1er février 2027 », heure de Paris. */
export function frDate(d: Date): string {
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' }).replace(/^1 /, '1er ')
}

export interface YearlySaving {
  /** Prix de 12 mois au tarif mensuel */
  twelveMonthsCents: number
  savingCents: number
  /** Économie en pourcentage du prix de 12 mois, arrondie à l'unité inférieure */
  percent: number
  /** Mois entiers offerts : économie divisée par le prix d'un mois, arrondi inférieur */
  freeMonths: number
  /** Prix mensuel équivalent de l'annuel, arrondi au centime */
  perMonthCents: number
}

export function yearlySaving(prices: { month: number; year: number } = PRICE_CENTS): YearlySaving {
  const twelveMonthsCents = prices.month * 12
  const savingCents = twelveMonthsCents - prices.year
  return {
    twelveMonthsCents,
    savingCents,
    percent: Math.floor((savingCents / twelveMonthsCents) * 100),
    freeMonths: Math.floor(savingCents / prices.month),
    perMonthCents: Math.round(prices.year / 12),
  }
}
