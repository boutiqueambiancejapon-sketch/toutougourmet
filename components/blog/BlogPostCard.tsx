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
 * Card "Option C" — fond pâle teinté par catégorie + emoji watermark
 * en bas-droite + chip catégorie en haut-gauche.
 *
 * Couleurs sourcées depuis `blog-categories.ts` (pas de hardcoding).
 */
export function BlogPostCard({ article }: BlogPostCardProps) {
  const { frontmatter } = article
  const visual = getCategoryVisual(frontmatter.category)
  const readTime = estimateReadTime(article.content)

  return (
    <Link
      href={articleHref(article)}
      className="group relative flex flex-col rounded-[var(--radius-xl)] overflow-hidden border border-[var(--border)] hover:-translate-y-1 hover:shadow-[var(--shadow-md)] hover:border-[var(--accent-1)] transition-all duration-300 h-full"
      style={{ background: visual.bgVar }}
    >
      {/* Emoji watermark — caractère visuel sans surcharger le scan */}
      <span
        aria-hidden="true"
        className="absolute pointer-events-none select-none leading-none"
        style={{
          right: '-12px',
          bottom: '-26px',
          fontSize: '130px',
          opacity: 0.16,
          transform: 'rotate(-8deg)',
        }}
      >
        {visual.emoji}
      </span>

      {/* Header : chip catégorie */}
      <div className="relative px-5 pt-5">
        <span
          className="inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full whitespace-nowrap"
          style={{
            background: visual.pillVar,
            color: visual.textOnVar,
          }}
        >
          {frontmatter.category}
        </span>
      </div>

      {/* Body */}
      <div className="relative px-5 py-4 flex flex-col gap-2.5 flex-1">
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
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{readTime} min</span>
        </div>
      </div>
    </Link>
  )
}
