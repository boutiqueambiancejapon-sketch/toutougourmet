import Link from 'next/link'
import { brands, brandOfferLabel, type BrandFacts } from '@/data/brands'
import { frTypo } from '@/lib/utils'

// @cdc 04-pages — tableau comparatif sobre des marques (audit design-cro §3) : une ligne par marque,
// pas de note sur 5. Rendu serveur. Sur mobile, le tableau défile dans son cadre, colonne marque fixe.

type Column = keyof BrandFacts | 'offer'

const LABELS: Record<Column, string> = {
  price: 'Prix indicatif',
  format: "Type d'aliment",
  strength: 'Point fort',
  bestFor: 'Pour quel chien',
  madeIn: 'Fabrication',
  delivery: 'Livraison',
  offer: 'Offre de bienvenue',
}

const SHORT: Column[] = ['price', 'format', 'strength', 'bestFor']
const FULL: Column[] = ['price', 'format', 'strength', 'bestFor', 'madeIn', 'delivery', 'offer']

export function BrandTable({ detailed = false, caption }: { detailed?: boolean; caption: string }) {
  const columns = detailed ? FULL : SHORT
  return (
    <div className="v2 flex flex-col gap-1.5">
      <p aria-hidden="true" className="m-0 text-xs text-ink-2 md:hidden">Fais glisser le tableau sur le côté pour tout voir&nbsp;→</p>
      <div className="overflow-x-auto rounded-box border border-line bg-paper">
      <table className={`w-full border-collapse text-left text-sm ${detailed ? "min-w-[1080px]" : "min-w-[780px]"}`}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line bg-cream-2">
            <th scope="col" className="sticky left-0 bg-cream-2 px-4 py-3 font-semibold text-ink">
              Marque
            </th>
            {columns.map((c) => (
              <th key={c} scope="col" className="px-4 py-3 font-semibold text-ink">
                {LABELS[c]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {brands.map((b) => (
            <tr key={b.slug} className="border-b border-line last:border-b-0">
              <th scope="row" className="sticky left-0 w-36 bg-paper px-4 py-3 align-top font-semibold">
                <Link href={`/chien/marque/${b.slug}`} className="text-ink underline decoration-line-2 underline-offset-4 hover:decoration-ink">
                  {b.name}
                </Link>
                {b.stockNote && !detailed ? (
                  <span className="mt-1 block text-xs font-normal text-orange-ink">{b.stockNote}</span>
                ) : null}
              </th>
              {columns.map((c) => (
                <td key={c} className={`min-w-36 px-4 py-3 align-top leading-snug ${c === 'offer' && b.stockNote ? 'font-semibold text-orange-ink' : 'text-ink-2'}`}>
                  {frTypo(c === 'offer' ? brandOfferLabel(b) : b.facts[c])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  )
}
