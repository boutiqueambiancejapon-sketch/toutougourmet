import { RankRow } from '@/components/scanner/rankings/RankRow'
import { MarqueFiches } from '@/components/article/MarqueFiches'
import { marquePage } from '@/data/marque-pages'
import { displayBrand } from '@/lib/scanner/rankings'
import { rankedRecipes } from '@/lib/server/rankings'
import { titleTypo } from '@/lib/title-typo'

// @cdc seo — classement des recettes d'une marque sur sa page mère. Lié aux fiches, mêmes notes que les classements.

const SHOWN = 10

export async function MarqueClassement({ marque }: { marque: string }) {
  const page = marquePage(marque)
  const list = (await rankedRecipes().catch(() => []))
    .filter((r) => page && r.noun !== 'friandise' && marquePage(r.brand)?.nom === page.nom)
    .sort((a, b) => b.score - a.score)
  if (list.length < 3) return <MarqueFiches marque={marque} />
  return (
    <>
    <section data-cta="classement-marque" className="v2 not-prose my-8 flex flex-col gap-3">
      <h2 className="m-0 font-display text-2xl font-black text-ink">{titleTypo(`Quelles recettes ${displayBrand(marque)} sont les mieux notées ?`)}</h2>
      <ol role="list" className="m-0 flex list-none flex-col gap-3 p-0">
        {list.slice(0, SHOWN).map((r, i) => <RankRow key={r.key} recipe={r} rank={i + 1} />)}
      </ol>
      <p className="m-0 text-sm text-ink-2">{`Sur ${list.length} recettes lues. La note résume l'étiquette : ce n'est ni un test ni un conseil de vétérinaire.`}</p>
    </section>
    <MarqueFiches marque={marque} dejaListees={list.slice(0, SHOWN).map((r) => r.key)} />
    </>
  )
}
