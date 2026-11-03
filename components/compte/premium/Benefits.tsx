import { IconCheck } from '@/components/icons'
import { FREE_MONTHLY_SCANS, PREMIUM_MONTHLY_SCANS } from '@/lib/scanner/config'

// @cdc premium — avantages de Premium (cartes de l'espace compte) et format de date commun.

const BENEFITS = [
  `${PREMIUM_MONTHLY_SCANS} analyses par photo par mois au lieu de ${FREE_MONTHLY_SCANS}`,
  'Une alerte quand son poids varie de plus de 5 % en moins de deux mois',
  'Toutes tes analyses gardées, pas seulement les 20 dernières',
]

export function Benefits() {
  return (
    <ul role="list" className="m-0 flex list-none flex-col gap-2 p-0">
      {BENEFITS.map((b) => (
        <li key={b} className="m-0 flex items-start gap-2 text-base leading-snug text-ink">
          <IconCheck className="mt-0.5 size-5 text-green-ink" />
          {b}
        </li>
      ))}
    </ul>
  )
}

export { frDate } from '@/lib/premium/pricing'
