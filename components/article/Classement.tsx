import Link from 'next/link'
import { RankRow } from '@/components/scanner/rankings/RankRow'
import { capByBrand, segmentBySlug, type SegmentSlug } from '@/lib/scanner/rankings'
import { segmentRecipes } from '@/lib/server/rankings'
import { titleTypo } from '@/lib/title-typo'

// @cdc cluster scanner — classement dans un article (MDX <Classement segment="senior" />) : garde l'adresse
// qui a déjà ses positions, et une requête n'a qu'une page. Se met à jour à chaque mise en ligne.

export async function Classement({ segment: slug }: { segment: SegmentSlug }) {
  const segment = segmentBySlug(slug)
  if (!segment) return null
  const top = capByBrand(await segmentRecipes(segment), 2).slice(0, 5)
  if (top.length < 3) return null
  return (
    <section data-cta="classement-article" className="not-prose my-8 flex flex-col gap-3">
      <h2 className="m-0 font-display text-2xl font-black text-ink">{titleTypo(segment.listTitle)}</h2>
      <ol role="list" className="m-0 flex list-none flex-col gap-3 p-0">
        {top.map((r, i) => <RankRow key={r.key} recipe={r} rank={i + 1} />)}
      </ol>
      <p className="m-0 text-sm text-ink-2">
        {`${segment.byFat ? 'Classement du moins gras au plus gras, selon les étiquettes lues : la perte de poids se décide avec ton vétérinaire.' : 'Note de composition sur 100, calculée sur les étiquettes lues.'} Liens partenaires : on touche une commission si tu commandes, sans surcoût pour toi. `}
        <Link href="/scanner" className="font-semibold text-orange-ink underline underline-offset-2">Scanner ton paquet</Link>
      </p>
    </section>
  )
}
