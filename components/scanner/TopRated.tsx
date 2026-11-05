import Link from 'next/link'
import { capByBrand, segmentBySlug, type RankSegment } from '@/lib/scanner/rankings'
import { segmentRecipes } from '@/lib/server/rankings'
import { MethodDetails } from './MethodDetails'
import { RankRow } from './rankings/RankRow'

// @cdc cluster scanner — « Quelles croquettes pour chien sont les mieux notées ? » sur /scanner : le haut
// du classement, puis les liens vers les classements croquettes et friandises.

const SHOWN = 5
const LINK = 'font-semibold text-orange-ink underline underline-offset-2'

export async function TopRated() {
  const list = await segmentRecipes(segmentBySlug('tous') as RankSegment)
  const top = capByBrand(list, 2).slice(0, SHOWN)
  if (top.length < 3) return null
  return (
    <MethodDetails id="meilleures-notes" title={'Quelles croquettes pour chien sont les mieux notées\u00a0?'}>
      <ol role="list" className="m-0 flex list-none flex-col gap-3 p-0">
        {top.map((r, i) => <RankRow key={r.key} recipe={r} rank={i + 1} />)}
      </ol>
      <p className="m-0 text-[15px] leading-relaxed text-ink-2">
        {'La suite est dans le '}
        <Link href="/meilleures-croquettes" className={LINK}>classement des meilleures croquettes pour chien</Link>
        {', et les friandises ont le leur : '}
        <Link href="/meilleures-friandises" className={LINK}>meilleures friandises pour chien</Link>.
      </p>
    </MethodDetails>
  )
}
