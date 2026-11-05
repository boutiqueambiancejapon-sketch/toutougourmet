import { RankingJsonLd } from '@/components/scanner/RankingJsonLd'
import { RankingBody, shownRecipes } from '@/components/scanner/rankings/RankingBody'
import { displayBrand, displayName, segmentBySlug, type SegmentSlug } from '@/lib/scanner/rankings'
import { segmentRecipes } from '@/lib/server/rankings'

// @cdc cluster scanner — classement en tête d'article, même rendu que les pages /meilleures-… (RankingBody) :
// garde l'adresse qui a déjà ses positions, une requête n'a qu'une page. Mis à jour à chaque mise en ligne.

const SHOWN = 10
const NOTE = "Le guide ci-dessous compare aussi d'autres marques et d'autres critères : une marque peut y être conseillée pour un profil précis sans figurer dans cette liste."

export async function Classement({ segment: slug }: { segment: SegmentSlug }) {
  const segment = segmentBySlug(slug)
  if (!segment) return null
  const list = await segmentRecipes(segment)
  const top = shownRecipes(list, SHOWN)
  if (top.length < 3) return null
  return (
    <div data-cta="classement-article" className="my-6 flex flex-col gap-6">
      <RankingJsonLd name={segment.listTitle} path={segment.path} items={top.map((r) => ({ slug: r.slug, brand: displayBrand(r.brand), product: displayName(r.name) }))} start={1} total={top.length} />
      <RankingBody segment={segment} list={list} count={SHOWN} note={NOTE} />
    </div>
  )
}
