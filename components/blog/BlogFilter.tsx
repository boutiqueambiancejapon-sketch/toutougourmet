'use client'

import { useState } from 'react'
import { ArticleCard } from './ArticleCard'
import type { Article } from '@/lib/mdx'

const CATEGORY_COLORS: Record<string, string> = {
  'Alimentation': 'var(--accent-rose)',
  'Comparatif':   'var(--accent-blue)',
  'Guide':        'var(--accent-2)',
  'Santé':        'var(--accent-3)',
}

interface BlogFilterProps {
  articles: Article[]
}

export function BlogFilter({ articles }: BlogFilterProps) {
  const [active, setActive] = useState<string | null>(null)

  const categories = Array.from(new Set(articles.map((a) => a.frontmatter.category))).sort()

  const filtered = active ? articles.filter((a) => a.frontmatter.category === active) : articles

  return (
    <>
      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActive(null)}
          className="px-4 py-1.5 rounded-full text-sm font-semibold border transition-all"
          style={{
            background: active === null ? 'var(--accent-1)' : 'transparent',
            color: active === null ? '#fff' : 'var(--text-secondary)',
            borderColor: active === null ? 'var(--accent-1)' : 'var(--border)',
          }}
        >
          Tous ({articles.length})
        </button>

        {categories.map((cat) => {
          const color = CATEGORY_COLORS[cat] ?? 'var(--text-muted)'
          const isActive = active === cat
          const count = articles.filter((a) => a.frontmatter.category === cat).length
          return (
            <button
              key={cat}
              onClick={() => setActive(isActive ? null : cat)}
              className="px-4 py-1.5 rounded-full text-sm font-semibold border transition-all"
              style={{
                background: isActive ? color : 'transparent',
                color: isActive ? '#fff' : color,
                borderColor: color,
              }}
            >
              {cat} ({count})
            </button>
          )
        })}
      </div>

      {/* Grille */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </>
  )
}
