import { PrixLigne } from '../PrixLigne'
import type { BuyLink } from '@/lib/scanner/buy-link'
import { moinsCher } from '@/lib/scanner/amazon'
import { dateReleve, euros } from '@/lib/scanner/prix'
import type { OffreAmazon } from '@/lib/server/amazon'
import { toGo } from '@/lib/go'

// @cdc lot 6 — comparateur du haut de fiche (propriétaire, 28/11/2026) : Maxi Zoo et Amazon côte à côte, prix et prix au kilo,
// « Prix le plus bas » sur le moins cher au kilo pour deux sacs de même poids. Liens partenaires déclarés, clics mesurés (data-cta).

const BTN = 'inline-flex min-h-12 shrink-0 items-center justify-center whitespace-nowrap rounded-control px-4 font-semibold no-underline hover:underline'

function Badge() {
  return <span className="whitespace-nowrap rounded-pill bg-green-bg px-2 py-0.5 text-xs font-bold text-green-ink">Prix le plus bas</span>
}

export function FicheCompare({ buy, amazon }: { buy: BuyLink; amazon: OffreAmazon }) {
  const mzKg = buy.prix?.prixKg ?? null
  const mzPoids = buy.prix && mzKg ? buy.prix.prix / mzKg : null
  const best = moinsCher(mzKg, amazon.prixKg, mzPoids, amazon.poidsKg)
  return (
    <div className="flex flex-col gap-3" data-compare="maxizoo-amazon">
      <div className="flex flex-col gap-1">
        <a href={toGo(buy.href)} rel="sponsored nofollow noopener" target="_blank" data-cta="fiche-achat-haut" className={`${BTN} bg-orange text-ink`}>
          {`Voir chez ${buy.store}`}
        </a>
        <span className="flex flex-wrap items-center gap-2">
          {buy.prix ? <PrixLigne prix={buy.prix} compact /> : <span className="text-sm text-ink-2">Prix sur le site de Maxi Zoo</span>}
          {best === 'maxizoo' ? <Badge /> : null}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <a href={toGo(amazon.href)} rel="sponsored nofollow noopener" target="_blank" data-cta="fiche-achat-haut-amazon" className={`${BTN} border border-line-2 bg-paper text-ink`}>
          Voir sur Amazon
        </a>
        <span className="flex flex-wrap items-center gap-2 text-sm text-ink-2">
          {amazon.prix !== null ? <span className="font-semibold text-ink">{euros(amazon.prix)}</span> : null}
          {amazon.prixKg !== null ? <span>{`· ${euros(amazon.prixKg)}/kg`}</span> : null}
          {best === 'amazon' ? <Badge /> : null}
        </span>
      </div>
      <p className="m-0 text-xs text-ink-2">
        {`Prix relevés${buy.prix ? ` le ${dateReleve(buy.prix)} chez Maxi Zoo et` : ''} le ${amazon.releve} chez Amazon : ils peuvent avoir changé. Liens partenaires ; en tant que Partenaire Amazon, on réalise un bénéfice sur les achats remplissant les conditions requises.`}
      </p>
    </div>
  )
}
