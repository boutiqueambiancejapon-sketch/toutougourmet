import Link from 'next/link'
import { formatDate, estimateReadTime } from '@/lib/utils'
import type { Article } from '@/lib/mdx'
import { getCategoryVisual } from './blog-categories'

interface ArticleCardProps {
  article: Article
  variant?: 'vertical' | 'horizontal'
}

/**
 * Card d'article — pattern "Option C".
 *
 * - `vertical` : fond pâle teinté par catégorie + emoji watermark + chip
 *   (cf. BlogPostCard, même look pour cohérence sur tout le blog)
 * - `horizontal` : version compacte avec accent latéral coloré, sans watermark
 *   (utilisée pour les sidebars / listes en colonne étroite)
 *
 * Couleurs sourcées depuis `blog-categories.ts` — ne pas hardcoder.
 */
export function ArticleCard({ article, variant = 'vertical' }: ArticleCardProps) {
  const { frontmatter, slug, content } = article
  const visual = getCategoryVisual(frontmatter.category)
  const readTime = estimateReadTime(content)
  const href = frontmatter.categorySlug
    ? `/chien/${frontmatter.categorySlug}/${slug}`
    : `/blog/${slug}`

  if (variant === 'horizontal') {
    return (
      <Link
        href={href}
        className="group flex gap-4 items-stretch bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4 hover:border-[var(--accent-1)] hover:-translate-y-1 hover:shadow-[var(--shadow-md)] transition-all"
      >
        {/* Indicateur catégorie — barre verticale colorée */}
        <div
          className="w-1.5 self-stretch rounded-full shrink-0"
          style={{ background: visual.pillVar }}
        />
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <span
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: visual.textOnVar }}
          >
            {frontmatter.category}
          </span>
          <h2
            className="font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-1)] leading-snug text-sm line-clamp-2 transition-colors m-0"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {frontmatter.title}
          </h2>
          <p className="text-xs text-[var(--text-muted)] m-0">
            {formatDate(frontmatter.date)} · {readTime} min
          </p>
        </div>
      </Link>
    )
  }

  // Variant `vertical` — pattern Option C : fond pastel + emoji watermark + chip
  return (
    <Link
      href={href}
      className="group relative flex flex-col rounded-[var(--radius-xl)] overflow-hidden border border-[var(--border)] hover:-translate-y-1 hover:shadow-[var(--shadow-md)] hover:border-[var(--accent-1)] transition-all duration-300 h-full"
      style={{ background: visual.bgVar }}
    >
      {/* Emoji watermark */}
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
        <h2
          className="m-0 font-black text-[var(--text-primary)] leading-tight text-lg line-clamp-3 group-hover:text-[var(--accent-1)] transition-colors"
          style={{ fontFamily: "'Fraunces', serif", letterSpacing: '-0.01em' }}
        >
          {frontmatter.title}
        </h2>
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
