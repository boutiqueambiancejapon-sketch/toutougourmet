import Link from 'next/link'
import { RANKING_MIN_REVIEWED } from '@/lib/scanner/seo'
import { reviewedItemsSafe } from '@/lib/server/scanner-catalog'
import { RankingList } from './RankingList'

// @cdc lot 6 — « Quelles croquettes ont la meilleure note ? » sur /scanner : les 5 meilleures
// fiches RELUES. Masqué sous 3 fiches relues ; lien vers le classement quand il est indexable.

const SHOWN = 5
const MIN_SHOWN = 3

export async function TopRated() {
  const items = await reviewedItemsSafe('complete')
  if (items.length < MIN_SHOWN) return null
  return (
    <section aria-labelledby="meilleures-notes" className="flex flex-col gap-3">
      <h2 id="meilleures-notes" className="m-0 font-display text-2xl font-black text-ink">
        Quelles croquettes ont la meilleure note ?
      </h2>
      <p className="m-0 text-base leading-relaxed text-ink-2">
        {`Les ${Math.min(SHOWN, items.length)} meilleures notes parmi les ${items.length} fiches relues par la rédaction, calculées avec le même barème.`}
      </p>
      <RankingList items={items.slice(0, SHOWN)} />
      {items.length >= RANKING_MIN_REVIEWED ? (
        <p className="m-0 text-[15px]">
          <Link href="/croquettes" className="font-semibold text-orange-ink underline underline-offset-2">
            Voir toutes les croquettes notées sur 100
          </Link>
        </p>
      ) : null}
    </section>
  )
}
