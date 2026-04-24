'use client'

interface BlogPaginationProps {
  page: number
  totalPages: number
  onChange: (p: number) => void
}

export function BlogPagination({ page, totalPages, onChange }: BlogPaginationProps) {
  if (totalPages <= 1) return null
  const prevDisabled = page === 1
  const nextDisabled = page === totalPages

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2 mt-10">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={prevDisabled}
        aria-label="Page précédente"
        className="px-3 py-1.5 rounded-[var(--radius-md)] text-sm font-semibold border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent-1)] hover:text-[var(--accent-1)] disabled:opacity-30 disabled:cursor-not-allowed"
      >
        ←
      </button>
      <span
        className="text-sm text-[var(--text-muted)] px-3"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
        aria-live="polite"
      >
        {page} / {totalPages}
      </span>
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={nextDisabled}
        aria-label="Page suivante"
        className="px-3 py-1.5 rounded-[var(--radius-md)] text-sm font-semibold border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent-1)] hover:text-[var(--accent-1)] disabled:opacity-30 disabled:cursor-not-allowed"
      >
        →
      </button>
    </nav>
  )
}
