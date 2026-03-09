import Link from 'next/link'
import { formatDate, estimateReadTime } from '@/lib/utils'
import type { Article } from '@/lib/mdx'

// Couleur de bandeau par catégorie
const categoryColors: Record<string, { band: string; pill: string }> = {
  'Alimentation':  { band: 'var(--pill-rose)',  pill: 'var(--accent-rose)' },
  'Comparatif':    { band: 'var(--pill-blue)',  pill: 'var(--accent-blue)' },
  'Guide':         { band: 'var(--pill-amber)', pill: 'var(--accent-2)' },
  'Santé':         { band: 'var(--pill-green)', pill: 'var(--accent-3)' },
}
const defaultColor = { band: 'var(--bg-surface-2)', pill: 'var(--text-muted)' }


interface ArticleCardProps {
  article: Article
  variant?: 'vertical' | 'horizontal'
}

export function ArticleCard({ article, variant = 'vertical' }: ArticleCardProps) {
  const { frontmatter, slug, content } = article
  const colors = categoryColors[frontmatter.category] ?? defaultColor
  const readTime = estimateReadTime(content)

  if (variant === 'horizontal') {
    return (
      <Link
        href={frontmatter.categorySlug ? `/chien/${frontmatter.categorySlug}/${slug}` : `/blog/${slug}`}
        className="group flex gap-4 items-center bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4 hover:border-[var(--accent-1)] hover:-translate-y-1 hover:shadow-[var(--shadow-md)] transition-all"
      >
        {/* Indicateur catégorie */}
        <div
          className="w-1.5 self-stretch rounded-full shrink-0"
          style={{ background: colors.pill }}
        />
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: colors.pill }}>
            {frontmatter.category}
          </span>
          <h2
            className="font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-1)] leading-snug text-sm line-clamp-2 transition-colors"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {frontmatter.title}
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            {formatDate(frontmatter.date)} · {readTime} min
          </p>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={frontmatter.categorySlug ? `/chien/${frontmatter.categorySlug}/${slug}` : `/blog/${slug}`}
      className="group flex flex-col bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] overflow-hidden hover:border-[var(--accent-1)] hover:-translate-y-2 hover:shadow-[var(--shadow-xl)] transition-all duration-300"
    >
      {/* Bandeau coloré catégorie — remplace l'image */}
      <div
        className="px-5 pt-5 pb-4 flex items-start justify-between gap-3"
        style={{ background: colors.band }}
      >
        <span className="text-xs font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-[var(--radius-sm)] bg-white text-[var(--text-primary)]">
          {frontmatter.category}
        </span>
        <span className="text-xs font-semibold text-[var(--text-muted)] whitespace-nowrap">
          {readTime} min de lecture
        </span>
      </div>

      {/* Contenu */}
      <div className="flex flex-col gap-2.5 p-5 flex-1">
        <h2
          className="font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-1)] leading-snug transition-colors"
          style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(1rem, 2vw, 1.2rem)' }}
        >
          {frontmatter.title}
        </h2>
        <p className="text-sm text-[var(--text-secondary)] line-clamp-2 flex-1 leading-relaxed">
          {frontmatter.description}
        </p>
        <div className="flex items-center justify-between mt-1 pt-3 border-t border-[var(--border)]">
          <span className="text-xs text-[var(--text-muted)]">{formatDate(frontmatter.date)}</span>
          <span className="text-sm font-semibold text-[var(--accent-1)]">Lire →</span>
        </div>
      </div>
    </Link>
  )
}
