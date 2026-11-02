import Link from 'next/link'
import type { ReviewedItem } from '@/lib/server/scanner-catalog'
import { ScoreBadge } from './ScoreBadge'

// @cdc lot 6 — liste de fiches relues (classement, page marque, meilleures notes de /scanner).

export function RankingList({ items, start = 1, showBrand = true }: { items: ReviewedItem[]; start?: number; showBrand?: boolean }) {
  return (
    <ol role="list" className="m-0 flex list-none flex-col divide-y divide-line border-y border-line p-0">
      {items.map((it, i) => (
        <li key={it.slug}>
          <Link href={`/croquettes/${it.slug}`} className="group flex min-h-16 items-center gap-3 py-3 text-ink no-underline">
            <span className="w-7 shrink-0 text-right text-sm font-semibold text-ink-2">{start + i}</span>
            <ScoreBadge score={it.score} />
            <span className="flex min-w-0 grow flex-col">
              <span className="truncate font-semibold group-hover:underline">{showBrand ? (it.brand ?? 'Marque inconnue') : (it.product ?? 'Produit sans nom')}</span>
              {showBrand ? <span className="truncate text-[15px] text-ink-2">{it.product ?? 'Produit sans nom'}</span> : null}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  )
}
