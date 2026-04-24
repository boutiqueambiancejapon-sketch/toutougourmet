import Link from 'next/link'
import type { Article } from '@/lib/mdx'
import { formatDate, estimateReadTime } from '@/lib/utils'
import { getCategoryVisual } from './blog-categories'

interface BlogPostCardProps {
  article: Article
}

function articleHref(article: Article): string {
  const cs = article.frontmatter.categorySlug
  return cs ? `/chien/${cs}/${article.slug}` : `/blog/${article.slug}`
}

/**
 * Typographic card — no illustration, strong color band + category emoji + serif title.
 * Option B: zero image generated per article, scales infinitely.
 */
export function BlogPostCard({ article }: BlogPostCardProps) {
  const { frontmatter } = article
  const visual = getCategoryVisual(frontmatter.category)
  const readTime = estimateReadTime(article.content)

  return (
    <Link
      href={articleHref(article)}
      className="group flex flex-col rounded-[var(--radius-xl)] overflow-hidden bg-[var(--bg-surface)] border border-[var(--border)] hover:-translate-y-1 hover:shadow-[var(--shadow-md)] hover:border-[var(--accent-1)] transition-all duration-300 h-full"
    >
      <div
        className="relative px-5 pt-5 pb-16 flex items-start justify-between gap-3"
        style={{ background: visual.pillVar }}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-[var(--bg-surface)] text-[var(--text-primary)] whitespace-nowrap">
          {frontmatter.category}
        </span>
        <span
          aria-hidden="true"
          className="absolute bottom-3 right-4 text-5xl md:text-6xl leading-none opacity-90"
        >
          {visual.emoji}
        </span>
      </div>
      <div className="px-5 py-5 flex flex-col gap-2.5 flex-1">
        <h3
          className="m-0 font-black text-[var(--text-primary)] leading-tight text-lg line-clamp-3 group-hover:text-[var(--accent-1)] transition-colors"
          style={{ fontFamily: "'Fraunces', serif", letterSpacing: '-0.01em' }}
        >
          {frontmatter.title}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-2 m-0">
          {frontmatter.description}
        </p>
        <div className="flex items-center gap-2 mt-auto pt-2 text-xs text-[var(--text-muted)] flex-wrap">
          <span>{formatDate(frontmatter.date)}</span>
          <span>·</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {readTime} min
          </span>
        </div>
      </div>
    </Link>
  )
}
