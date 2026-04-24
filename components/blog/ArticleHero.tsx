import Link from 'next/link'
import { Illustration } from '@/components/ui/Illustration'
import { getCategoryVisual } from './blog-categories'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface ArticleHeroProps {
  breadcrumb: BreadcrumbItem[]
  category: string
  /** Slot Illustration utilisé pour la cover (résolu via getArticleSlot) */
  coverSlot: string
  dateDisplay: string
  readTime: number
  title: string
  description: string
}

function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="Fil d'Ariane"
      className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--text-muted)] mb-5"
    >
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="inline-flex items-center gap-1.5">
          {i > 0 && (
            <span aria-hidden="true" className="opacity-50">
              ›
            </span>
          )}
          {item.href ? (
            <Link href={item.href} className="hover:text-[var(--text-primary)]">
              {item.label}
            </Link>
          ) : (
            <span className="text-[var(--text-secondary)]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

export function ArticleHero({
  breadcrumb,
  category,
  coverSlot,
  dateDisplay,
  readTime,
  title,
  description,
}: ArticleHeroProps) {
  const visual = getCategoryVisual(category)

  return (
    <header className="max-w-[1200px] mx-auto px-6 md:px-10 pt-12 pb-8">
      <Breadcrumb items={breadcrumb} />

      <div className="flex items-center gap-3 flex-wrap mb-5">
        <span
          className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full text-[var(--text-primary)]"
          style={{ background: visual.pillVar }}
        >
          {category}
        </span>
        <span className="text-sm text-[var(--text-muted)]">{dateDisplay}</span>
        <span className="text-sm text-[var(--text-muted)]">·</span>
        <span
          className="text-sm text-[var(--text-muted)]"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {readTime} min de lecture
        </span>
      </div>

      <h1
        className="text-[var(--text-primary)] mb-5 max-w-[900px]"
        style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          textWrap: 'balance',
        }}
      >
        {title}
      </h1>

      <p className="text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed max-w-[760px] m-0 mb-8">
        {description}
      </p>

      <div className="rounded-[var(--radius-2xl)] overflow-hidden border border-[var(--border)]">
        <div className="relative w-full aspect-[3/2] max-h-[70vh]">
          <Illustration
            slot={coverSlot}
            alt={`Illustration de couverture — ${title}`}
            fill
            sizes="(max-width: 1024px) 100vw, 1200px"
            className="!rounded-none"
          />
        </div>
      </div>
    </header>
  )
}
