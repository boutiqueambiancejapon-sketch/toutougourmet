import Link from 'next/link'
import { CategoryIcon, IconChevron } from '@/components/icons'

// @cdc 04-pages — rubriques en lignes compactes (icône, libellé, compteur, chevron) :
// remplace les grilles de tuiles identiques (audit design 2026-11-02, §2.4).
export interface RubricRow {
  slug: string
  href: string
  label: string
  count: number
}

export function RubricRows({ rows, label, columns = 2 }: { rows: RubricRow[]; label: string; columns?: 1 | 2 | 3 }) {
  const grid = columns === 3 ? 'md:grid-cols-3' : columns === 2 ? 'md:grid-cols-2' : ''
  return (
    <nav aria-label={label} className="v2">
      <ul role="list" className={`m-0 grid list-none grid-cols-1 gap-x-8 border-t border-line p-0 ${grid}`}>
        {rows.map((r) => (
          <li key={r.slug} className="border-b border-line">
            <Link href={r.href} className="group flex min-h-14 items-center gap-3 py-2.5 text-ink no-underline">
              <CategoryIcon slug={r.slug} className="size-7" />
              <span className="grow font-semibold leading-snug group-hover:underline">{r.label}</span>
              <span className="shrink-0 text-sm tabular-nums text-ink-2">{r.count} guide{r.count > 1 ? 's' : ''}</span>
              <IconChevron className="size-4 text-ink-2" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
