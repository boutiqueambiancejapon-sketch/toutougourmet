'use client'

export type BlogSort = 'recent' | 'popular' | 'long'

interface BlogSortButtonsProps {
  value: BlogSort
  onChange: (v: BlogSort) => void
}

const OPTIONS: Array<[BlogSort, string]> = [
  ['recent', 'Récent'],
  ['popular', 'Populaire'],
  ['long', 'Plus longs'],
]

export function BlogSortButtons({ value, onChange }: BlogSortButtonsProps) {
  return (
    <div className="flex items-center gap-2 flex-nowrap md:flex-wrap pb-1 md:pb-0">
      <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider shrink-0">
        Trier
      </span>
      {OPTIONS.map(([k, l]) => {
        const active = value === k
        return (
          <button
            key={k}
            onClick={() => onChange(k)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border-2 shrink-0"
            style={{
              borderColor: active ? 'var(--text-primary)' : 'var(--border)',
              background: active ? 'var(--text-primary)' : 'var(--bg-surface)',
              color: active ? 'var(--text-on-dark)' : 'var(--text-secondary)',
            }}
          >
            {l}
          </button>
        )
      })}
    </div>
  )
}
