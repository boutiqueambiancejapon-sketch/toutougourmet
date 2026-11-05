import { MarqueFiches } from '@/components/article/MarqueFiches'
import { RankRow } from '@/components/scanner/rankings/RankRow'
import { RankingSections } from '@/components/scanner/rankings/RankingArticle'
import { BRAND_HUB } from '@/data/brand-hub'
import type { Brand } from '@/data/brands'
import { fold } from '@/lib/scanner/rankings'
import { rankedRecipes } from '@/lib/server/rankings'
import { titleTypo } from '@/lib/title-typo'

// @cdc seo — page mère d'un partenaire (décision du 2026-11-05) : ses recettes notées, puis les questions que les
// gens posent sur la marque. Mêmes données et même barème que les classements.

const SHOWN = 6

export async function BrandHub({ brand }: { brand: Brand }) {
  const hub = BRAND_HUB[brand.slug]
  if (!hub) return null
  const recipes = (await rankedRecipes().catch(() => []))
    .filter((r) => fold(r.brand) === fold(brand.name))
    .sort((a, b) => b.score - a.score)
  const [first, ...rest] = hub.sections
  return (
    <div className="flex max-w-prose flex-col gap-8">
      <RankingSections sections={[first]} />
      {recipes.length > 0 ? (
        <section aria-labelledby="recettes-notees" className="flex flex-col gap-3">
          <h2 id="recettes-notees" className="m-0 font-display text-2xl font-black text-ink">{titleTypo(`Quelles recettes ${brand.name} sont les mieux notées ?`)}</h2>
          <ol role="list" className="m-0 flex list-none flex-col gap-3 p-0">
            {recipes.slice(0, SHOWN).map((r, i) => <RankRow key={r.key} recipe={r} rank={i + 1} />)}
          </ol>
          <p className="m-0 text-sm text-ink-2">{`Sur ${recipes.length} recettes lues sur le site de la marque. Lien partenaire : on touche une commission si tu commandes, sans surcoût pour toi.`}</p>
        </section>
      ) : null}
      <MarqueFiches marque={brand.name} />
      <RankingSections sections={rest} />
    </div>
  )
}
