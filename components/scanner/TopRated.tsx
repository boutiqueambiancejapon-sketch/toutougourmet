import Link from 'next/link'
import { RANKING_MIN_REVIEWED } from '@/lib/scanner/seo'
import { reviewedItemsSafe } from '@/lib/server/scanner-catalog'
import { RankingList } from './RankingList'

// @cdc lot 6 — « Quelles croquettes pour chien sont les mieux notées ? » sur /scanner : les 5
// meilleures fiches PUBLIÉES. Masqué sous 3 fiches ; liens vers les classements (croquettes,
// friandises) seulement quand ils sont indexables.

const SHOWN = 5
const MIN_SHOWN = 3

export async function TopRated() {
  const items = await reviewedItemsSafe('complete')
  if (items.length < MIN_SHOWN) return null
  const treats = (await reviewedItemsSafe('treat')).length
  return (
    <section aria-labelledby="meilleures-notes" className="flex flex-col gap-3">
      <h2 id="meilleures-notes" className="m-0 font-display text-2xl font-black text-ink">
        Quelles croquettes pour chien sont les mieux notées ?
      </h2>
      <p className="m-0 text-base leading-relaxed text-ink-2">
        {`Les ${Math.min(SHOWN, items.length)} meilleures notes parmi les ${items.length} croquettes et pâtées qui ont une fiche publiée, calculées avec le même barème.`}
      </p>
      <RankingList items={items.slice(0, SHOWN)} />
      {items.length >= RANKING_MIN_REVIEWED ? (
        <p className="m-0 text-[15px] leading-relaxed text-ink-2">
          {'La suite est dans le '}
          <Link href="/croquettes" className="font-semibold text-orange-ink underline underline-offset-2">
            classement des meilleures croquettes pour chien
          </Link>
          {treats >= RANKING_MIN_REVIEWED ? (
            <>
              {', et les friandises ont le leur : '}
              <Link href="/croquettes/friandises" className="font-semibold text-orange-ink underline underline-offset-2">
                meilleures friandises pour chien
              </Link>
            </>
          ) : null}
          .
        </p>
      ) : null}
    </section>
  )
}
