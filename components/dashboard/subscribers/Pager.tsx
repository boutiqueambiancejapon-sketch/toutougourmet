import Link from 'next/link'
import { listHref, type ListKind } from '@/lib/dashboard/subscriber-search'

// @cdc tableau de bord — pages de 50 inscrits : précédente / suivante, numéro de page au milieu.

interface PagerProps {
  list: ListKind
  page: number
  /** Nombre de lignes concernées (toute la liste, ou le résultat de la recherche). */
  count: number
  size: number
}

const link = 'inline-flex min-h-11 items-center whitespace-nowrap rounded-pill border border-line-2 bg-paper px-3 text-sm font-semibold text-ink no-underline'

export function Pager({ list, page, count, size }: PagerProps) {
  const pages = Math.max(1, Math.ceil(count / size))
  if (pages <= 1 && page <= 1) return null
  return (
    <nav aria-label="Pages" className="mt-4 flex items-center justify-between gap-2">
      {page > 1 ? <Link href={listHref(list, page - 1)} className={link}>Précédente</Link> : <span />}
      <span className="text-sm text-ink-2 tabular-nums">
        Page {page} sur {pages}
      </span>
      {page < pages ? <Link href={listHref(list, page + 1)} className={link}>Suivante</Link> : <span />}
    </nav>
  )
}
