import Link from 'next/link'
import type { Dog } from '@/db/schema'
import { offersFor } from '@/lib/account-offers'
import { ageInMonths } from '@/lib/dog-profile'
import { linkAction } from './espace/ui'
import { Panel } from './espace/Panel'
import { OfferCard, PARTNER_NOTICE } from './OfferCard'

// @cdc premium — « Les offres pour {chien} » (/compte/offres) : 2 ou 3 offres choisies par
// lib/account-offers.ts selon son profil. Plusieurs chiens : sélecteur par lien (?offres=id),
// rendu serveur, sans script. OfferTeaser : la première offre, sur la vue d'ensemble.

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
    <Panel id="offres" title={`Les offres pour ${dog.name}`}>
      {dogs.length > 1 ? (
        <nav aria-label="Choisir le chien" className="flex flex-wrap gap-2">
          {dogs.map((d) => (
            <Link
              key={d.id}
              href={`/compte/offres?offres=${d.id}`}
              aria-current={d.id === dog.id ? 'true' : undefined}
              scroll={false}
              className="inline-flex min-h-11 items-center rounded-pill border border-line bg-paper px-4 text-base text-ink no-underline aria-[current=true]:border-ink aria-[current=true]:bg-ink aria-[current=true]:font-semibold aria-[current=true]:text-cream"
            >
              {d.name}
            </Link>
          ))}
        </nav>
      ) : null}
      <p className="m-0 text-base leading-relaxed text-ink-2">Choisies selon son âge, son poids, son activité et la stérilisation. Les remises sont celles en cours chez nos partenaires.</p>
      <ul role="list" className="m-0 grid list-none grid-cols-1 gap-3 p-0 lg:grid-cols-2">
        {offers.map((o) => (
          <li key={o.slug} className="m-0">
            <OfferCard offer={o} />
          </li>
        ))}
      </ul>
      <p className="m-0 text-sm text-ink-2">{PARTNER_NOTICE}</p>
    </Panel>
  )
}

export function OfferTeaser({ dog }: { dog: Dog }) {
  const [first] = offersFor(offerProfile(dog))
  if (!first) return null
  return (
    <Panel
      id="offre"
      title={`Une offre pour ${dog.name}`}
      action={
        <Link href="/compte/offres" className={linkAction}>
          Toutes ses offres
        </Link>
      }
    >
      <OfferCard offer={first} />
      <p className="m-0 text-sm text-ink-2">{PARTNER_NOTICE}</p>
    </Panel>
  )
}
