import type { Metadata } from 'next'
import Link from 'next/link'
import { brands, getDuelPairs } from '@/data/brands'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { BrandTable } from '@/components/marques/BrandTable'
import { BrandProfiles } from '@/components/marques/BrandProfiles'
import { BrandTopOffers } from '@/components/marques/BrandTopOffers'
import { BrandGlossary } from '@/components/marques/BrandGlossary'
import { IconChevron } from '@/components/icons'

export const metadata: Metadata = {
  title: 'Avis croquettes premium pour chien',
  description:
    "Dog Chef, Elmut, Franklin, Ultra Premium Direct, Dogfy Diet, Fidelis : avis, comparatifs et offres. Choisis la marque selon le profil de ton chien.",
  alternates: { canonical: 'https://www.toutou-gourmet.com/chien/marque' },
}

// @cdc 04-pages — hub Marques V2 (audit design-cro §3) : offre courte, tableau comparatif sobre, puis
// le choix par profil de chien (un lien partenaire par profil), puis les duels. Rendu serveur.

export default function MarqueHubPage() {
  const duels = getDuelPairs()
  return (
    <div className="v2 mx-auto flex max-w-page flex-col gap-14 px-4 pt-6 pb-16 md:px-8 md:pt-10">
      <div className="flex flex-col gap-6">
        <BreadcrumbNav items={[{ label: 'Accueil', href: '/' }, { label: 'Guides', href: '/chien' }, { label: 'Marques' }]} />
        <header className="flex max-w-prose flex-col gap-3">
          <h1 className="m-0 font-display text-[clamp(1.9rem,3.6vw,2.6rem)] font-black leading-[1.08] tracking-tight text-ink">
            Quelle marque de croquettes ou de repas frais pour ton chien&nbsp;?
          </h1>
          <p className="m-0 text-lg leading-relaxed text-ink-2">
            {brands.length} marques passées au crible&nbsp;: prix, type d&apos;aliment, fabrication, livraison. On touche une commission si tu commandes par nos liens, sans surcoût pour toi.
          </p>
          <BrandTopOffers />
          <p className="m-0 text-ink-2">
            Les remises de nos partenaires, de −20&nbsp;% à −50&nbsp;%, et le code Dog Chef sont réunis sur la page{' '}
            <Link href="/codes-promo" className="font-semibold text-orange-ink underline underline-offset-4">codes promo pour chien</Link>.
          </p>
        </header>
      </div>

      <section aria-labelledby="tableau" className="flex flex-col gap-4">
        <h2 id="tableau" className="m-0 font-display text-2xl font-black text-ink md:text-3xl">
          Comment se comparent les {brands.length} marques&nbsp;?
        </h2>
        <BrandTable caption={`Comparatif des ${brands.length} marques : prix, type d'aliment, point fort, pour quel chien`} />
        <p className="m-0 text-sm text-ink-2">
          Prix relevés sur les fiches et tests de chaque marque. Fabrication, livraison et offres de bienvenue dans le{' '}
          <Link href="/comparateur" className="font-semibold text-orange-ink underline underline-offset-4">comparateur complet</Link>.
        </p>
      </section>

      <BrandProfiles />

      <section aria-labelledby="duels" className="flex flex-col gap-3">
        <h2 id="duels" className="m-0 font-display text-2xl font-black text-ink md:text-3xl">Tu hésites entre deux marques&nbsp;?</h2>
        <ul role="list" className="m-0 grid list-none grid-cols-1 gap-x-8 border-t border-line p-0 md:grid-cols-2">
          {duels.map(([a, b]) => (
            <li key={`${a.slug}-${b.slug}`} className="border-b border-line">
              <Link href={`/chien/marque/${a.slug}-vs-${b.slug}`} className="group flex min-h-14 items-center gap-3 py-2.5 text-ink no-underline">
                <span className="grow font-semibold group-hover:underline">{a.name} vs {b.name}</span>
                <IconChevron className="size-4 text-ink-2" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <BrandGlossary />
    </div>
  )
}
