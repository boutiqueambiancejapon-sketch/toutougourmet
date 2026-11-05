import type { Brand } from '@/data/brands'
import { frTypo } from '@/lib/utils'
import { currentYear } from '@/lib/title-year'

// @cdc 04-pages — en-tête V2 d'une fiche marque, puis fiche d'identité en une bande encre
// (prix, type, fabrication, livraison), comme la fiche race (audit design-cro §3). Rendu serveur.

export function BrandHero({ brand }: { brand: Brand }) {
  const forWho = brand.animal.includes('chat') ? 'chiens et chats' : 'chiens uniquement'
  return (
    <header className="v2 flex max-w-prose flex-col gap-3">
      <h1 className="m-0 font-display text-[clamp(1.9rem,3.6vw,2.6rem)] font-black leading-[1.08] tracking-tight text-ink">
        {`Avis ${brand.name} ${currentYear()}`}
      </h1>
      <p className="m-0 text-lg leading-relaxed text-ink-2">
        {brand.tagline}. Pour {forWho}.
      </p>
      {brand.stockNote ? (
        <p className="m-0 font-semibold text-orange-ink">{brand.stockNote}.</p>
      ) : null}
    </header>
  )
}

export function BrandIdentity({ brand }: { brand: Brand }) {
  const items: [string, string][] = [
    ['Prix indicatif', brand.facts.price],
    ["Type d'aliment", brand.facts.format],
    ['Fabrication', brand.facts.madeIn],
    ['Livraison', brand.facts.delivery],
  ]
  return (
    <section aria-label={`Fiche d'identité ${brand.name}`} className="v2 rounded-card bg-ink px-5 py-6 text-cream md:px-8">
      <dl className="m-0 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(([label, value]) => (
          <div key={label} className="flex flex-col gap-1">
            <dt className="text-sm text-cream/70">{label}</dt>
            <dd className="m-0 font-semibold leading-snug text-cream">{frTypo(value)}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
