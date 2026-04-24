import Link from 'next/link'
import type { Article } from '@/lib/mdx'
import { formatDate, estimateReadTime } from '@/lib/utils'
import { Illustration } from '@/components/ui/Illustration'
import { getCategoryVisual } from './blog-categories'

interface BlogPostCardProps {
  article: Article
}

function articleHref(article: Article): string {
  const cs = article.frontmatter.categorySlug
  return cs ? `/chien/${cs}/${article.slug}` : `/blog/${article.slug}`
}

export function BlogPostCard({ article }: BlogPostCardProps) {
  const { frontmatter } = article
  const visual = getCategoryVisual(frontmatter.category)
  const readTime = estimateReadTime(article.content)

  return (
    <Link
      href={articleHref(article)}
      className="group flex flex-col rounded-[var(--radius-xl)] overflow-hidden bg-[var(--bg-surface)] border border-[var(--border)] hover:-translate-y-1 hover:shadow-[var(--shadow-md)] hover:border-[var(--accent-1)] transition-all duration-300 h-full"
    >
      <div className="relative">
        <Illustration slot={visual.slot} alt={frontmatter.title} className="!rounded-none" />
        <span
          className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full text-[var(--text-primary)] whitespace-nowrap"
          style={{ background: visual.pillVar }}
        >
          {frontmatter.category}
        </span>
      </div>
      <div className="px-5 py-5 flex flex-col gap-2.5 flex-1">
        <h3
          className="m-0 font-black text-[var(--text-primary)] leading-tight text-lg line-clamp-2 group-hover:text-[var(--accent-1)] transition-colors"
          style={{ fontFamily: "'Fraunces', serif", letterSpacing: '-0.01em' }}
        >
          {frontmatter.title}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-2 m-0">
          {frontmatter.description}
        </p>
        <div className="flex items-center gap-2 mt-auto pt-2 text-xs text-[var(--text-muted)] flex-wrap">
          <span className="font-semibold text-[var(--text-primary)]">{frontmatter.author}</span>
          <span>·</span>
          <span>{formatDate(frontmatter.date)}</span>
          <span>·</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{readTime} min</span>
        </div>
      </div>
    </Link>
  )
}
