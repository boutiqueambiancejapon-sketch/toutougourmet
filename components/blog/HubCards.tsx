'use client'

import Link from 'next/link'

interface Hub {
  slug: string
  label: string
  description: string
  emoji: string
  count: number
  colors: { band: string; accent: string }
}

interface HubCardsProps {
  hubs: Hub[]
  columns?: 3 | 4
}

export function HubCards({ hubs, columns = 4 }: HubCardsProps) {
  const gridClass = columns === 3
    ? 'grid grid-cols-1 sm:grid-cols-3 gap-4'
    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'
  return (
    <div className={gridClass}>
      {hubs.map(({ slug, label, description, emoji, count, colors }) => (
        <Link
          key={slug}
          href={`/chien/${slug}`}
          className="group flex flex-col rounded-[var(--radius-xl)] overflow-hidden border border-[var(--border)] hover:-translate-y-2 hover:shadow-[var(--shadow-xl)] hover:border-transparent transition-all duration-300"
        >
          {/* Bande colorée + emoji — même pattern que ArticleCard */}
          <div
            className="px-5 pt-5 pb-4 flex items-start justify-between"
            style={{ background: colors.band }}
          >
            <span className="text-3xl leading-none">{emoji}</span>
            <span
              className="text-xs font-bold uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: colors.accent }}
            >
              Voir →
            </span>
          </div>

          {/* Corps */}
          <div className="flex flex-col flex-1 bg-[var(--bg-surface)] px-5 pt-4 pb-5 gap-2">
            <p
              className="font-bold text-[var(--text-primary)] leading-snug"
              style={{ fontFamily: "'Fraunces', serif", fontSize: '0.9375rem' }}
            >
              {label}
            </p>
            <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed flex-1">
              {description}
            </p>
            <p
              className="text-xs font-semibold mt-1"
              style={{ color: colors.accent }}
            >
              {count} article{count > 1 ? 's' : ''}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}
