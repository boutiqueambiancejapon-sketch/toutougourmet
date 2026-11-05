import Link from 'next/link'
import { RankingJsonLd } from '@/components/scanner/RankingJsonLd'
import { RankRow } from '@/components/scanner/rankings/RankRow'
import { RankingLead } from '@/components/scanner/rankings/RankingLead'
import { capByBrand, displayBrand, displayName, segmentBySlug, type SegmentSlug } from '@/lib/scanner/rankings'
import { segmentRecipes } from '@/lib/server/rankings'
import { titleTypo } from '@/lib/title-typo'

// @cdc cluster scanner — classement en tête d'article (MDX <Classement segment="senior" />, demande du propriétaire
// du 2026-11-05) : garde l'adresse qui a déjà ses positions, une requête n'a qu'une page. Mis à jour à chaque mise en ligne.

const SHOWN = 10
const LINK = 'font-semibold text-orange-ink underline underline-offset-2'

export async function Classement({ segment: slug }: { segment: SegmentSlug }) {
  const segment = segmentBySlug(slug)
  if (!segment) return null
  const list = await segmentRecipes(segment)
  const top = capByBrand(list, 3).slice(0, SHOWN)
  if (top.length < 3) return null
  return (
    <section data-cta="classement-article" className="not-prose mb-8 flex flex-col gap-3">
      <RankingJsonLd name={segment.listTitle} path={segment.path} items={top.map((r) => ({ slug: r.slug, brand: displayBrand(r.brand), product: displayName(r.name) }))} start={1} total={top.length} />
      <h2 className="m-0 font-display text-2xl font-black text-ink">{titleTypo(segment.listTitle)}</h2>
      <RankingLead segment={segment} list={list} />
      <ol role="list" className="m-0 flex list-none flex-col gap-3 p-0">
        {top.map((r, i) => <RankRow key={r.key} recipe={r} rank={i + 1} />)}
      </ol>
      <p className="m-0 text-sm leading-relaxed text-ink-2">
        {"Ce classement note la composition des étiquettes qu'on a lues, avec au plus 3 recettes par marque. Le guide ci-dessous compare aussi d'autres marques et d'autres critères : une marque peut y être conseillée pour un profil précis sans figurer dans cette liste. Liens partenaires : on touche une commission si tu commandes, sans surcoût pour toi. "}
        <Link href="/scanner" className={LINK}>Scanner ton paquet</Link>
        {' ou voir '}
        <Link href="/meilleures-croquettes" className={LINK}>tous les classements</Link>.
      </p>
    </section>
  )
}
