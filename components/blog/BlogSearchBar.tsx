'use client'

interface BlogSearchBarProps {
  value: string
  onChange: (v: string) => void
}

export function BlogSearchBar({ value, onChange }: BlogSearchBarProps) {
  return (
    <label className="relative flex-1 min-w-[240px] max-w-[420px]">
      <span
        aria-hidden="true"
        className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)]"
      >
        🔍
      </span>
      <span className="sr-only">Rechercher un article</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Chercher un article, un sujet, une race…"
        className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-1)] focus:shadow-[var(--shadow-sm)]"
      />
    </label>
  )
}
