import Link from 'next/link'

// @cdc lot 6 — pagination simple (précédente / suivante) qui garde les filtres de l'URL.

function href(base: string, params: Record<string, string>, page: number): string {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== ''))
  if (page > 1) q.set('page', String(page))
  const s = q.toString()
  return s ? `${base}?${s}` : base
}

const link = 'inline-flex min-h-11 items-center rounded-control border-2 border-ink px-4 font-semibold text-ink no-underline hover:underline'

export function Pagination({ page, pages, params, base }: { page: number; pages: number; params: Record<string, string>; base: string }) {
  if (pages <= 1) return null
  return (
    <nav aria-label="Pages du classement" className="flex items-center justify-between gap-3">
      {page > 1 ? (
        <Link href={href(base, params, page - 1)} rel="prev" className={link}>
          Page précédente
        </Link>
      ) : (
        <span />
      )}
      <span className="text-sm text-ink-2">{`Page ${page} sur ${pages}`}</span>
      {page < pages ? (
        <Link href={href(base, params, page + 1)} rel="next" className={link}>
          Page suivante
        </Link>
      ) : (
        <span />
      )}
    </nav>
  )
}
