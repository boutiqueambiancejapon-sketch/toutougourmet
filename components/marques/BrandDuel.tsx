import Link from 'next/link'
import { brandOfferLabel, type Brand, type BrandFacts } from '@/data/brands'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { frTypo } from '@/lib/utils'
import { BrandProsCons } from './BrandDetails'
import { DualBrandCTA } from './DualBrandCTA'
import { StickyComparatifCTA } from './StickyComparatifCTA'

// @cdc 04-pages — duel automatique « a-vs-b » V2 : tableau de faits côte à côte (pas de note sur 5),
// points forts et limites de chaque marque, choix selon le chien. Rendu serveur.

const ROWS: [keyof BrandFacts, string][] = [
  ['price', 'Prix indicatif'],
  ['format', "Type d'aliment"],
  ['madeIn', 'Fabrication'],
  ['delivery', 'Livraison'],
  ['strength', 'Point fort'],
  ['bestFor', 'Pour quel chien'],
]

const H2 = 'm-0 font-display text-2xl font-black leading-tight text-ink md:text-3xl'

export function BrandDuel({ brandA, brandB }: { brandA: Brand; brandB: Brand }) {
  const pair = [brandA, brandB]
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${brandA.name} vs ${brandB.name}`,
    itemListElement: pair.map((b, i) => ({ '@type': 'ListItem', position: i + 1, name: b.name, url: `https://www.toutou-gourmet.com/chien/marque/${b.slug}` })),
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="v2 mx-auto flex max-w-page flex-col gap-12 px-4 pt-6 pb-24 md:px-8 md:pt-10">
        <div className="flex flex-col gap-6">
          <BreadcrumbNav items={[{ label: 'Accueil', href: '/' }, { label: 'Guides', href: '/chien' }, { label: 'Marques', href: '/chien/marque' }, { label: `${brandA.name} vs ${brandB.name}` }]} />
          <header className="flex max-w-prose flex-col gap-3">
            <h1 className="m-0 font-display text-[clamp(1.9rem,3.6vw,2.6rem)] font-black leading-[1.08] tracking-tight text-ink">
              {brandA.name} vs {brandB.name}&nbsp;: lequel choisir&nbsp;?
            </h1>
            <p className="m-0 text-lg leading-relaxed text-ink-2">
              Prix, type d&apos;aliment, fabrication et livraison côte à côte, puis le chien auquel chaque marque convient.
            </p>
          </header>
        </div>

        <section aria-labelledby="faits" className="flex flex-col gap-4">
          <h2 id="faits" className={H2}>Comment se comparent {brandA.name} et {brandB.name}&nbsp;?</h2>
          <div className="overflow-x-auto rounded-box border border-line bg-paper">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-cream-2">
                  <th scope="col" className="w-24 px-3 py-3 font-semibold text-ink md:w-40 md:px-4">Critère</th>
                  {pair.map((b) => (
                    <th key={b.slug} scope="col" className="px-3 py-3 font-semibold text-ink md:px-4">
                      <Link href={`/chien/marque/${b.slug}`} className="text-ink underline decoration-line-2 underline-offset-4">{b.name}</Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map(([key, label]) => (
                  <tr key={key} className="border-b border-line">
                    <th scope="row" className="px-3 py-3 align-top font-medium text-ink md:px-4">{label}</th>
                    {pair.map((b) => <td key={b.slug} className="px-3 py-3 align-top leading-snug text-ink-2 md:px-4">{frTypo(b.facts[key])}</td>)}
                  </tr>
                ))}
                <tr>
                  <th scope="row" className="px-3 py-3 align-top font-medium text-ink md:px-4">Offre de bienvenue</th>
                  {pair.map((b) => <td key={b.slug} className="px-3 py-3 align-top leading-snug text-ink-2 md:px-4">{frTypo(brandOfferLabel(b))}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {pair.map((b) => <BrandProsCons key={b.slug} brand={b} />)}

        <section aria-labelledby="choisir" className="flex flex-col gap-4">
          <h2 id="choisir" className={H2}>Quel chien pour quelle marque&nbsp;?</h2>
          <ul role="list" className="m-0 flex max-w-prose list-none flex-col gap-3 p-0">
            {pair.map((b) => (
              <li key={b.slug} className="leading-relaxed text-ink-2">
                <strong className="font-semibold text-ink">{b.name}</strong>{frTypo(` : ${b.facts.bestFor.toLowerCase()}. ${b.facts.strength}.`)}
              </li>
            ))}
          </ul>
          <DualBrandCTA brandA={brandA} brandB={brandB} place="duel" />
          <p className="m-0 text-ink-2">
            Encore un doute&nbsp;? <Link href="/chien/marque" className="font-semibold text-orange-ink underline underline-offset-4">Choisis selon le profil de ton chien</Link>.
          </p>
        </section>
      </div>
      <StickyComparatifCTA brands={pair.filter((b) => !b.stockNote)} />
    </>
  )
}
