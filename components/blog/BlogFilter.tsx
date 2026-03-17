'use client'

import { useState, useEffect } from 'react'
import { ArticleCard } from './ArticleCard'
import type { Article } from '@/lib/mdx'

const ARTICLES_PER_PAGE = 9

const CATEGORY_COLORS: Record<string, string> = {
  'Alimentation':            'var(--accent-rose)',
  'Comparatif':              'var(--accent-blue)',
  'Guide':                   'var(--accent-2)',
  'Santé':                   'var(--accent-3)',
  'Urgences & Intoxications':'var(--accent-rose)',
}

interface BlogFilterProps {
  articles: Article[]
}

export function BlogFilter({ articles }: BlogFilterProps) {
  const [active, setActive] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [page])

  const categoryList = Array.from(new Set(articles.map((a) => a.frontmatter.category))).sort()

  const filtered = active
    ? articles.filter((a) => a.frontmatter.category === active)
    : articles

  const totalPages = Math.ceil(filtered.length / ARTICLES_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ARTICLES_PER_PAGE, page * ARTICLES_PER_PAGE)

  function selectFilter(cat: string | null) {
    setActive(cat)
    setPage(1)
  }

  return (
    <>
      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => selectFilter(null)}
          className="px-4 py-1.5 rounded-full text-sm font-semibold border transition-all"
          style={{
            background: active === null ? 'var(--accent-1)' : 'transparent',
            color: active === null ? '#fff' : 'var(--text-secondary)',
            borderColor: active === null ? 'var(--accent-1)' : 'var(--border)',
          }}
        >
          Tous ({articles.length})
        </button>

        {categoryList.map((cat) => {
          const color = CATEGORY_COLORS[cat] ?? 'var(--text-muted)'
          const isActive = active === cat
          const count = articles.filter((a) => a.frontmatter.category === cat).length
          return (
            <button
              key={cat}
              onClick={() => selectFilter(isActive ? null : cat)}
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
        {paginated.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-[var(--radius-md)] text-sm font-semibold border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent-1)] hover:text-[var(--accent-1)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Page précédente"
          >
            ←
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((n) => {
              if (totalPages <= 10) return true
              if (n === 1 || n === totalPages) return true
              if (Math.abs(n - page) <= 2) return true
              return false
            })
            .reduce<(number | '…')[]>((acc, n, i, arr) => {
              if (i > 0 && (n as number) - (arr[i - 1] as number) > 1) acc.push('…')
              acc.push(n)
              return acc
            }, [])
            .map((n, i) =>
              n === '…' ? (
                <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-sm text-[var(--text-muted)]">…</span>
              ) : (
                <button
                  key={n}
                  onClick={() => setPage(n as number)}
                  className="w-9 h-9 rounded-[var(--radius-md)] text-sm font-semibold border transition-all"
                  style={{
                    background: page === n ? 'var(--accent-1)' : 'transparent',
                    color: page === n ? '#fff' : 'var(--text-secondary)',
                    borderColor: page === n ? 'var(--accent-1)' : 'var(--border)',
                  }}
                  aria-label={`Page ${n}`}
                  aria-current={page === n ? 'page' : undefined}
                >
                  {n}
                </button>
              )
            )}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-[var(--radius-md)] text-sm font-semibold border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent-1)] hover:text-[var(--accent-1)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Page suivante"
          >
            →
          </button>
        </div>
      )}
    </>
  )
}
