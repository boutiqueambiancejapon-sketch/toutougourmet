import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import type { Article } from '@/lib/mdx'

interface ArticleCardProps {
  article: Article
  variant?: 'vertical' | 'horizontal'
}

export function ArticleCard({ article, variant = 'vertical' }: ArticleCardProps) {
  const { frontmatter, slug } = article

  if (variant === 'horizontal') {
    return (
      <Link href={`/blog/${slug}`} className="card flex gap-4 p-4 group">
        <div className="relative w-24 h-24 shrink-0 rounded-[var(--radius-md)] overflow-hidden bg-[var(--bg-surface-2)]">
          {frontmatter.image ? (
            <Image src={frontmatter.image} alt={frontmatter.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">🐾</div>
          )}
        </div>
        <div className="flex flex-col justify-center gap-1">
          <Badge>{frontmatter.category}</Badge>
          <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-1)] leading-snug text-sm"
            style={{ fontFamily: "'Fraunces', serif" }}>
            {frontmatter.title}
          </h3>
          <p className="text-xs text-[var(--text-muted)]">{formatDate(frontmatter.date)}</p>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/blog/${slug}`} className="card group flex flex-col overflow-hidden">
      <div className="relative aspect-[3/2] bg-[var(--bg-surface-2)]">
        {frontmatter.image ? (
          <Image src={frontmatter.image} alt={frontmatter.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🐾</div>
        )}
      </div>
      <div className="flex flex-col gap-2 p-5 flex-1">
        <div className="flex items-center gap-2">
          <Badge>{frontmatter.category}</Badge>
          <span className="text-xs text-[var(--text-muted)]">{formatDate(frontmatter.date)}</span>
        </div>
        <h3
          className="font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-1)] leading-snug"
          style={{ fontFamily: "'Fraunces', serif", fontSize: '1.1rem' }}
        >
          {frontmatter.title}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] line-clamp-2 flex-1">
          {frontmatter.description}
        </p>
        <span className="text-sm font-semibold text-[var(--accent-1)] mt-1">
          Lire l&apos;article →
        </span>
      </div>
    </Link>
  )
}
