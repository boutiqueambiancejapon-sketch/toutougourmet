import Link from 'next/link'
import { recipeHref } from '@/data/model-reviews'
import { displayBrand, displayName } from '@/lib/scanner/rankings'
import type { RankedRecipe } from '@/lib/server/rankings'
import { ProductPhoto } from '../ProductPhoto'
import { ScoreBadge } from '../ScoreBadge'

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

export function RankRow({ recipe, rank }: { recipe: RankedRecipe; rank: number }) {
  return (
    <li className="flex flex-col gap-2 rounded-card border border-line bg-paper p-4">
      <div className="flex items-center gap-3">
        <span className="w-6 shrink-0 text-right font-display text-xl font-black text-ink">{rank}</span>
        <ProductPhoto src={recipe.image} />
        <Link href={recipeHref(recipe.key, recipe.slug)} className="min-w-0 grow font-semibold leading-snug !text-ink !no-underline hover:!underline [overflow-wrap:anywhere]">
          {`${displayBrand(recipe.brand)} ${displayName(recipe.name)}`}
        </Link>
        <ScoreBadge score={recipe.score} />
      </div>
      <RankFacts recipe={recipe} />
      {recipe.buy ? (
        <a href={recipe.buy.href} rel="sponsored nofollow noopener" target="_blank" data-cta="classement-produit" className="inline-flex min-h-11 items-center justify-center self-start whitespace-nowrap rounded-control bg-ink px-4 font-semibold !text-cream !no-underline hover:!underline">
          {`Voir chez ${recipe.buy.store}`}
        </a>
      ) : null}
    </li>
  )
}
