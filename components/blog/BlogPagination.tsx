'use client'

interface BlogPaginationProps {
  page: number
  totalPages: number
  onChange: (p: number) => void
}

/** Build a compact page list with ellipsis: e.g. [1, '…', 6, 7, 8, '…', 23] */
function buildPageList(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const pages = new Set<number>([1, total, current])
  for (let d = 1; d <= 1; d++) {
    if (current - d >= 1) pages.add(current - d)
    if (current + d <= total) pages.add(current + d)
  }
  const sorted = Array.from(pages).sort((a, b) => a - b)
  const out: Array<number | 'ellipsis'> = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push('ellipsis')
    out.push(sorted[i])
  }
  return out
}

function PageButton({
  n,
  active,
  onClick,
}: {
  n: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      aria-label={`Page ${n}`}
      aria-current={active ? 'page' : undefined}
      className="w-10 h-10 rounded-[var(--radius-md)] text-sm font-semibold border-2 inline-flex items-center justify-center"
      style={{
        borderColor: active ? 'var(--text-primary)' : 'var(--border)',
        background: active ? 'var(--text-primary)' : 'var(--bg-surface)',
        color: active ? 'var(--text-on-dark)' : 'var(--text-secondary)',
      }}
    >
      {n}
    </button>
  )
}

export function BlogPagination({ page, totalPages, onChange }: BlogPaginationProps) {
  if (totalPages <= 1) return null
  const prevDisabled = page === 1
  const nextDisabled = page === totalPages
  const list = buildPageList(page, totalPages)

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1.5 mt-10 flex-wrap"
    >
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={prevDisabled}
        aria-label="Page précédente"
        className="w-10 h-10 rounded-[var(--radius-md)] text-sm font-semibold border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent-1)] hover:text-[var(--accent-1)] disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center justify-center"
      >
        ←
      </button>

      {list.map((item, i) =>
        item === 'ellipsis' ? (
          <span
            key={`ellipsis-${i}`}
            aria-hidden="true"
            className="w-10 h-10 inline-flex items-center justify-center text-sm text-[var(--text-muted)]"
          >
            …
          </span>
        ) : (
          <PageButton
            key={item}
            n={item}
            active={item === page}
            onClick={() => onChange(item)}
          />
        )
      )}

      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={nextDisabled}
        aria-label="Page suivante"
        className="w-10 h-10 rounded-[var(--radius-md)] text-sm font-semibold border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent-1)] hover:text-[var(--accent-1)] disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center justify-center"
      >
        →
      </button>
    </nav>
  )
}
