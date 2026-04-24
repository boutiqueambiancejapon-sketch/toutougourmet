import Link from 'next/link'
import type { Article } from '@/lib/mdx'
import { formatDate, estimateReadTime } from '@/lib/utils'
import { Illustration } from '@/components/ui/Illustration'
import { getCategoryVisual } from './blog-categories'

interface BlogFeaturedCardProps {
  article: Article
}

function articleHref(article: Article): string {
  const cs = article.frontmatter.categorySlug
  return cs ? `/chien/${cs}/${article.slug}` : `/blog/${article.slug}`
}

export function BlogFeaturedCard({ article }: BlogFeaturedCardProps) {
  const { frontmatter } = article
  const visual = getCategoryVisual(frontmatter.category)
  const readTime = estimateReadTime(article.content)

  return (
    <Link
      href={articleHref(article)}
      className="group grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-0 rounded-[var(--radius-2xl)] overflow-hidden bg-[var(--bg-surface)] border border-[var(--border)] hover:-translate-y-1 hover:shadow-[var(--shadow-xl)] transition-all duration-300 mb-12"
    >
      <div className="relative min-h-[260px] lg:min-h-[380px]">
        <Illustration slot={visual.slot} alt={frontmatter.title} fill sizes="(max-width: 1024px) 100vw, 55vw" className="!rounded-none" />
        <span className="absolute top-5 left-5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-[var(--bg-dark)] text-[var(--text-on-dark)] whitespace-nowrap">
          À la une
        </span>
      </div>
      <div className="px-6 py-8 md:px-10 md:py-10 flex flex-col justify-center gap-4">
        <span
          className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full text-[var(--text-primary)] self-start"
          style={{ background: visual.pillVar }}
        >
          {frontmatter.category}
        </span>
        <h2
          className="m-0 font-black text-[var(--text-primary)] leading-tight group-hover:text-[var(--accent-1)] transition-colors"
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}
        >
          {frontmatter.title}
        </h2>
        <p className="text-base md:text-lg text-[var(--text-secondary)] leading-relaxed m-0">
          {frontmatter.description}
        </p>
        <div className="flex items-center gap-2 pt-2 text-sm text-[var(--text-muted)] flex-wrap">
          <span
            className="w-8 h-8 rounded-full bg-[var(--pill-rose)] inline-flex items-center justify-center text-sm font-bold text-[var(--text-primary)]"
            aria-hidden="true"
          >
            {frontmatter.author.charAt(0)}
          </span>
          <span className="font-semibold text-[var(--text-primary)]">{frontmatter.author}</span>
          <span>·</span>
          <span>{formatDate(frontmatter.date)}</span>
          <span>·</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{readTime} min</span>
        </div>
        <span className="text-sm font-bold text-[var(--accent-1)] mt-2">
          Lire l&rsquo;article →
        </span>
      </div>
    </Link>
  )
}
