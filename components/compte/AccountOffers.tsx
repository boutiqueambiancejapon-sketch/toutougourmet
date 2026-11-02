import Link from 'next/link'
import type { Dog } from '@/db/schema'
import { offersFor } from '@/lib/account-offers'
import { ageInMonths } from '@/lib/dog-profile'
import { OfferCard, PARTNER_NOTICE } from './OfferCard'

// @cdc premium — « Les offres pour {chien} » sur /compte : 2 ou 3 offres choisies par
// lib/account-offers.ts selon son profil. Plusieurs chiens : sélecteur par lien (?offres=id),
// rendu serveur, sans script.

export function offerProfile(dog: Dog, gainingWeight = false) {
  return {
    ageMonths: dog.birthDate ? ageInMonths(dog.birthDate) : null,
    weightKg: dog.weightKg,
    sterilized: dog.sterilized,
    activity: dog.activity,
    gainingWeight,
  }
}

export function AccountOffers({ dogs, selectedId }: { dogs: Dog[]; selectedId?: string }) {
  const dog = dogs.find((d) => d.id === selectedId) ?? dogs[0]
  if (!dog) return null
  const offers = offersFor(offerProfile(dog))
  return (
    <section id="offres" aria-labelledby="offres-titre" className="flex scroll-mt-24 flex-col gap-3">
      <h2 id="offres-titre" className="m-0 font-display text-2xl font-black text-ink">{`Les offres pour ${dog.name}`}</h2>
      {dogs.length > 1 ? (
        <nav aria-label="Choisir le chien" className="flex flex-wrap gap-2">
          {dogs.map((d) => (
            <Link
              key={d.id}
              href={`/compte?offres=${d.id}#offres`}
              aria-current={d.id === dog.id ? 'true' : undefined}
              scroll={false}
              className="inline-flex min-h-11 items-center rounded-pill border border-line bg-paper px-4 text-[15px] text-ink no-underline aria-[current=true]:border-ink aria-[current=true]:font-semibold"
            >
              {d.name}
            </Link>
          ))}
        </nav>
      ) : null}
      <p className="m-0 text-[15px] leading-relaxed text-ink-2">Choisies selon son âge, son poids, son activité et la stérilisation. Les remises sont celles en cours chez nos partenaires.</p>
      <ul role="list" className="m-0 flex list-none flex-col gap-3 p-0">
        {offers.map((o) => (
          <li key={o.slug}>
            <OfferCard offer={o} />
          </li>
        ))}
      </ul>
      <p className="m-0 text-sm text-ink-2">{PARTNER_NOTICE}</p>
    </section>
  )
}
