'use client'

import { useMemo, useState } from 'react'
import type { Article } from '@/lib/mdx'
import { estimateReadTime } from '@/lib/utils'
import { BlogFeaturedCard } from './BlogFeaturedCard'
import { BlogPostCard } from './BlogPostCard'
import { BlogSearchBar } from './BlogSearchBar'
import { BlogCategoryChips } from './BlogCategoryChips'
import { BlogSortButtons, type BlogSort } from './BlogSortButtons'
import { BlogPagination } from './BlogPagination'
import { CATEGORY_ORDER } from './blog-categories'

const PAGE_SIZE = 9

interface BlogExplorerProps {
  articles: Article[]
  featured: Article
}

function normalize(s: string): string {
  return s.toLowerCase().trim()
}

function filterArticles(articles: Article[], query: string, activeCat: string): Article[] {
  let r = articles
  if (activeCat !== 'all') r = r.filter((a) => a.frontmatter.category === activeCat)
  const q = normalize(query)
  if (q) {
    r = r.filter((a) =>
      normalize(a.frontmatter.title).includes(q)
      || normalize(a.frontmatter.description).includes(q)
      || normalize(a.frontmatter.category).includes(q)
    )
  }
  return r
}

function sortArticles(list: Article[], sort: BlogSort): Article[] {
  const a = [...list]
  if (sort === 'long') return a.sort((x, y) => estimateReadTime(y.content) - estimateReadTime(x.content))
  if (sort === 'popular') return a
  return a.sort((x, y) => new Date(y.frontmatter.date).getTime() - new Date(x.frontmatter.date).getTime())
}

function buildCategoryCounts(articles: Article[]): Array<{ label: string; count: number }> {
  const counts = new Map<string, number>()
  for (const a of articles) {
    const cat = a.frontmatter.category
    counts.set(cat, (counts.get(cat) ?? 0) + 1)
  }
  const present = Array.from(counts.entries())
  const ordered = CATEGORY_ORDER.filter((c) => counts.has(c)).map((c) => ({ label: c, count: counts.get(c)! }))
  const extras = present.filter(([c]) => !CATEGORY_ORDER.includes(c)).map(([label, count]) => ({ label, count }))
  return [...ordered, ...extras]
}

export function BlogExplorer({ articles, featured }: BlogExplorerProps) {
  const [query, setQuery] = useState('')
  const [activeCat, setActiveCat] = useState<string>('all')
  const [sort, setSort] = useState<BlogSort>('recent')
  const [page, setPage] = useState(1)

  const categoryChips = useMemo(() => buildCategoryCounts(articles), [articles])

  const filtered = useMemo(
    () => sortArticles(filterArticles(articles, query, activeCat), sort),
    [articles, query, activeCat, sort]
  )

  const showFeatured = activeCat === 'all' && query.trim() === ''
  const list = showFeatured ? filtered.filter((a) => a.slug !== featured.slug) : filtered
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE))
  const paginated = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function onCategoryChange(label: string) {
    setActiveCat(label)
    setPage(1)
  }
  function onQueryChange(v: string) {
    setQuery(v)
    setPage(1)
  }
  function reset() {
    setQuery('')
    setActiveCat('all')
    setPage(1)
  }

  return (
    <>
      <div className="sticky top-[68px] z-20 bg-[var(--bg-primary)]/95 backdrop-blur border-y border-[var(--border)]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <BlogSearchBar value={query} onChange={onQueryChange} />
            <div className="ml-auto">
              <BlogSortButtons value={sort} onChange={setSort} />
            </div>
          </div>
          <BlogCategoryChips
            total={articles.length}
            categories={categoryChips}
            active={activeCat}
            onChange={onCategoryChange}
          />
        </div>
      </div>

      <section className="py-12 px-6 md:px-10 bg-[var(--bg-primary)]">
        <div className="max-w-[1280px] mx-auto">
          {showFeatured && <BlogFeaturedCard article={featured} />}

          {paginated.length === 0 ? (
            <div className="text-center py-16 bg-[var(--bg-surface)] border border-dashed border-[var(--border)] rounded-[var(--radius-xl)]">
              <p className="text-xl font-black text-[var(--text-primary)] m-0 mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
                Rien trouvé.
              </p>
              <p className="text-[var(--text-secondary)] m-0 mb-5">Essaie d&rsquo;autres mots-clés ou réinitialise les filtres.</p>
              <button onClick={reset} className="btn-outline text-sm px-4 py-2">
                Réinitialiser →
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-between mb-6 gap-3 flex-wrap">
                <h2 className="m-0 text-2xl md:text-3xl font-black text-[var(--text-primary)]" style={{ fontFamily: "'Fraunces', serif", letterSpacing: '-0.02em' }}>
                  {activeCat === 'all' ? 'Tous les articles' : activeCat}
                </h2>
                <span className="text-sm text-[var(--text-muted)]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {list.length} résultat{list.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginated.map((a) => (
                  <BlogPostCard key={a.slug} article={a} />
                ))}
              </div>
              <BlogPagination page={page} totalPages={totalPages} onChange={setPage} />
            </>
          )}
        </div>
      </section>
    </>
  )
}
