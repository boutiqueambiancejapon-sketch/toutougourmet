import { PrixLigne } from '../PrixLigne'
import { moinsCher } from '@/lib/scanner/amazon'
import { euros } from '@/lib/scanner/prix'
import Link from 'next/link'
import { displayBrand, displayName } from '@/lib/scanner/rankings'
import type { RankedRecipe } from '@/lib/server/rankings'
import { ProductPhoto } from '../ProductPhoto'
import { ScoreBadge } from '../ScoreBadge'
import { toGo } from '@/lib/go'

// @cdc cluster scanner — une ligne de classement : rang, photo, note, ce que dit l'étiquette, lien d'achat déclaré.

const pct = (n: number) => `${String(n).replace('.', ',')} %`

export function RankFacts({ recipe }: { recipe: RankedRecipe }) {
  const first = recipe.ingredients[0]
  const parts = [
    first ? `Premier ingrédient : ${first.replace(/\s*\(.*$/, '').toLowerCase()}.` : null,
    recipe.protein !== null ? `${pct(recipe.protein)} de protéines.` : null,
    recipe.fat !== null ? `${pct(recipe.fat)} de matières grasses.` : null,
  ]
  return <p className="m-0 text-[15px] leading-relaxed text-ink-2">{parts.filter(Boolean).join(' ')}</p>
}

/** Même produit chez Amazon sous le bouton Maxi Zoo (propriétaire, 28/11/2026), « Prix le plus bas » pour deux sacs de même poids. */
function RankAmazon({ recipe }: { recipe: RankedRecipe }) {
  const a = recipe.amazon
  if (!a || !recipe.buy) return null
  if (recipe.buy.amazon) return a.prix !== null ? <span className="text-sm text-ink-2">{`${euros(a.prix)}${a.prixKg !== null ? ` · ${euros(a.prixKg)}/kg` : ''} sur Amazon`}</span> : null
  const p = recipe.buy.prix
  const mzKg = p?.prixKg ?? null
  const best = moinsCher(mzKg, a.prixKg, p && mzKg ? p.prix / mzKg : null, a.poidsKg)
  return (
    <span className="flex flex-wrap items-center gap-2 text-sm text-ink-2">
      {best === 'maxizoo' ? <span className="whitespace-nowrap rounded-pill bg-green-bg px-2 py-0.5 text-xs font-bold text-green-ink">Prix le plus bas chez Maxi Zoo</span> : null}
      <a href={toGo(a.href)} rel="sponsored nofollow noopener" target="_blank" data-cta="classement-produit-amazon" className="whitespace-nowrap font-semibold text-ink underline underline-offset-2">
        Voir sur Amazon
      </a>
      {a.prix !== null ? <span>{`${euros(a.prix)}${a.prixKg !== null ? ` · ${euros(a.prixKg)}/kg` : ''}`}</span> : null}
      {best === 'amazon' ? <span className="whitespace-nowrap rounded-pill bg-green-bg px-2 py-0.5 text-xs font-bold text-green-ink">Prix le plus bas</span> : null}
    </span>
  )
}

export function RankRow({ recipe, rank }: { recipe: RankedRecipe; rank: number }) {
  return (
    <li className="flex flex-col gap-2 rounded-card border border-line bg-paper p-4">
      <div className="flex items-center gap-3">
        <span className="w-6 shrink-0 text-right font-display text-xl font-black text-ink">{rank}</span>
        <ProductPhoto src={recipe.image} />
        <Link href={recipe.href} className="min-w-0 grow font-semibold leading-snug !text-ink !no-underline hover:!underline [overflow-wrap:anywhere]">
          {`${displayBrand(recipe.brand)} ${displayName(recipe.name)}`}
        </Link>
        <ScoreBadge score={recipe.score} />
      </div>
      <RankFacts recipe={recipe} />
      {recipe.buy ? (
        <a href={toGo(recipe.buy.href)} rel="sponsored nofollow noopener" target="_blank" data-cta="classement-produit" className="inline-flex min-h-11 items-center justify-center self-start whitespace-nowrap rounded-control bg-ink px-4 font-semibold !text-cream !no-underline hover:!underline">
          {`Voir chez ${recipe.buy.store}`}
        </a>
      ) : null}
      {recipe.buy?.prix ? <PrixLigne prix={recipe.buy.prix} compact /> : null}
      <RankAmazon recipe={recipe} />
    </li>
  )
}
