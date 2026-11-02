'use client'

import { POISON_COUNTRIES } from '@/data/poison-centers'
import { usePoisonCountry } from '@/lib/use-poison-country'

// @cdc urgences — ligne d'appel du verdict « danger », numéro du pays du visiteur.
export function VerdictPoisonLine() {
  const [country] = usePoisonCountry()
  const current = POISON_COUNTRIES.find((c) => c.code === country) ?? POISON_COUNTRIES[0]
  const center = current.centers[0]
  return (
    <p className="m-0 text-[15px] leading-snug text-ink">
      S&apos;il en a mangé, appelle le {center.name} ({center.city === 'Canada' ? 'service payant' : center.city}
      {center.hours ? `, ${center.hours}` : ''}) au{' '}
      <a href={`tel:${center.tel}`} className="whitespace-nowrap font-semibold text-ink underline underline-offset-2">
        {center.phone}
      </a>
      {country === 'CA' ? ', ou ton vétérinaire.' : '.'}
    </p>
  )
}
