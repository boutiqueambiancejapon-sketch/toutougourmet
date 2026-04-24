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

/** Deterministic 32-bit hash (FNV-1a) used to seed per-card visual variants */
function hash(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0
  }
  return h
}

const ACCENT_VARS: Record<string, string> = {
  'var(--pill-rose)': 'var(--accent-rose)',
  'var(--pill-blue)': 'var(--accent-blue)',
  'var(--pill-amber)': 'var(--accent-2)',
  'var(--pill-green)': 'var(--accent-3)',
  'var(--bg-surface-2)': 'var(--text-muted)',
}

function BandDecorations({ seed, accent }: { seed: number; accent: string }) {
  // 4 pseudo-random positions + shapes deterministically picked from the seed
  const pick = (n: number, mod: number) => (seed >> (n * 3)) % mod
  const dots = [
    { left: `${8 + pick(0, 20)}%`, top: `${12 + pick(1, 30)}%`, size: 8, shape: 'circle' },
    { left: `${35 + pick(2, 25)}%`, top: `${8 + pick(3, 20)}%`, size: 10, shape: 'tri' },
    { left: `${55 + pick(4, 20)}%`, top: `${55 + pick(5, 25)}%`, size: 6, shape: 'circle' },
    { left: `${18 + pick(6, 30)}%`, top: `${62 + pick(7, 20)}%`, size: 12, shape: 'bar' },
  ]
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {dots.map((d, i) => {
        const common = { position: 'absolute' as const, left: d.left, top: d.top, width: d.size, height: d.size }
        if (d.shape === 'circle') {
          return <span key={i} style={{ ...common, borderRadius: '50%', background: accent, opacity: 0.55 }} />
        }
        if (d.shape === 'bar') {
          return (
            <span
              key={i}
              style={{
                ...common,
                height: d.size / 3,
                borderRadius: d.size,
                background: accent,
                opacity: 0.5,
                transform: `rotate(${(seed >> (i * 2)) % 60 - 30}deg)`,
              }}
            />
          )
        }
        return (
          <svg key={i} viewBox="0 0 10 10" style={common}>
            <polygon points="5,1 9,9 1,9" fill={accent} opacity="0.55" />
          </svg>
        )
      })}
    </div>
  )
}

export function BlogPostCard({ article }: BlogPostCardProps) {
  const { frontmatter } = article
  const visual = getCategoryVisual(frontmatter.category)
  const readTime = estimateReadTime(article.content)
  const seed = hash(article.slug)
  const rotate = ((seed >> 1) % 16) - 8 // -8° to +7°
  const accent = ACCENT_VARS[visual.pillVar] ?? 'var(--text-muted)'

  return (
    <Link
      href={articleHref(article)}
      className="group flex flex-col rounded-[var(--radius-xl)] overflow-hidden bg-[var(--bg-surface)] border border-[var(--border)] hover:-translate-y-1 hover:shadow-[var(--shadow-md)] hover:border-[var(--accent-1)] transition-all duration-300 h-full"
    >
      <div
        className="relative px-5 pt-5 pb-16 flex items-start justify-between gap-3 overflow-hidden"
        style={{ background: visual.pillVar }}
      >
        <BandDecorations seed={seed} accent={accent} />
        <span className="relative text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-[var(--bg-surface)] text-[var(--text-primary)] whitespace-nowrap shadow-[var(--shadow-sm)]">
          {frontmatter.category}
        </span>
        <span
          aria-hidden="true"
          className="absolute bottom-2 right-4 text-6xl leading-none"
          style={{
            transform: `rotate(${rotate}deg)`,
            filter: 'drop-shadow(0 2px 4px rgba(26,17,9,0.15))',
          }}
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
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{readTime} min</span>
        </div>
      </div>
    </Link>
  )
}
