'use client'

import { IconPhone } from '@/components/icons'
import { POISON_COUNTRIES } from '@/data/poison-centers'
import { usePoisonCountry } from '@/lib/use-poison-country'

// @cdc urgences — appel depuis l'encadré du verdict, numéro du pays du visiteur (CNITV en France et au
// rendu serveur). Bouton de 48 px au moins, sans dépendre du lien du numéro dans la phrase.
export function VerdictPoisonLine() {
  const [country] = usePoisonCountry()
  const current = POISON_COUNTRIES.find((c) => c.code === country) ?? POISON_COUNTRIES[0]
  const center = current.centers[0]
  const article = center.article ?? 'le'
  return (
    <div className="flex flex-col gap-2.5">
      <p className="m-0 text-[15px] leading-snug text-ink">
        S&apos;il en a mangé, appelle {article} {center.name} ({center.city === 'Canada' ? 'service payant' : center.city}
        {center.hours ? `, ${center.hours}` : ''}) au{' '}
        <span className="whitespace-nowrap font-semibold">{center.phone}</span>
        {country === 'CA' ? ', ou ton vétérinaire.' : '.'}
      </p>
      <a
        href={`tel:${center.tel}`}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-control bg-ink px-4 py-2 text-center text-base font-bold leading-tight text-cream no-underline hover:underline"
      >
        <IconPhone className="size-5 shrink-0" />
        Appeler {article} {center.name}
      </a>
    </div>
  )
}
