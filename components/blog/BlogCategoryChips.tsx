'use client'

import { getCategoryVisual } from './blog-categories'

interface CategoryChip {
  label: string
  count: number
}

interface BlogCategoryChipsProps {
  total: number
  categories: CategoryChip[]
  active: string
  onChange: (label: string) => void
}

function Chip({
  label,
  count,
  active,
  pillVar,
  emoji,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  pillVar: string
  emoji: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border-2 text-sm font-semibold whitespace-nowrap shrink-0"
      style={{
        borderColor: active ? 'var(--text-primary)' : 'var(--border)',
        background: active ? 'var(--text-primary)' : 'var(--bg-surface)',
        color: active ? 'var(--text-on-dark)' : 'var(--text-secondary)',
      }}
    >
      <span aria-hidden="true">{emoji}</span>
      {label}
      <span
        className="text-[11px] font-bold px-2 py-0.5 rounded-full"
        style={{
          background: active ? 'rgba(245,238,230,0.15)' : pillVar,
          color: active ? 'var(--text-on-dark)' : 'var(--text-primary)',
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {count}
      </span>
    </button>
  )
}

export function BlogCategoryChips({ total, categories, active, onChange }: BlogCategoryChipsProps) {
  return (
    <div className="flex gap-2 flex-nowrap md:flex-wrap pb-1 md:pb-0">
      <Chip
        label="Tout"
        count={total}
        active={active === 'all'}
        pillVar="var(--bg-surface-2)"
        emoji="📚"
        onClick={() => onChange('all')}
      />
      {categories.map((c) => {
        const v = getCategoryVisual(c.label)
        return (
          <Chip
            key={c.label}
            label={c.label}
            count={c.count}
            active={active === c.label}
            pillVar={v.pillVar}
            emoji={v.emoji}
            onClick={() => onChange(c.label)}
          />
        )
      })}
    </div>
  )
}
