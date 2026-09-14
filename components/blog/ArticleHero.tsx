import Link from 'next/link'
import { Illustration } from '@/components/ui/Illustration'
import { getCategoryVisual } from './blog-categories'
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config'
import { localizeCategoryLabel } from '@/lib/i18n/categories'
import { getDictionary } from '@/lib/i18n/dictionary'

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
  locale?: Locale
}

function Breadcrumb({ items, label }: { items: BreadcrumbItem[]; label: string }) {
  return (
    <nav
      aria-label={label}
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
  locale = DEFAULT_LOCALE,
}: ArticleHeroProps) {
  const visual = getCategoryVisual(category)
  const t = getDictionary(locale)

  return (
    <header className="max-w-[1200px] mx-auto px-6 md:px-10 pt-10 md:pt-14 pb-8">
      <Breadcrumb items={breadcrumb} label={t.breadcrumbLabel} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-8 lg:gap-12 items-center">
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <span
              className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full text-[var(--text-primary)]"
              style={{ background: visual.pillVar }}
            >
              {localizeCategoryLabel(category, locale)}
            </span>
            <span className="text-sm text-[var(--text-muted)]">{dateDisplay}</span>
            <span className="text-sm text-[var(--text-muted)]">·</span>
            <span
              className="text-sm text-[var(--text-muted)]"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {readTime} {t.readTime}
            </span>
          </div>

          <h1
            className="text-[var(--text-primary)] mb-5 m-0"
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 'clamp(1.875rem, 3.5vw, 2.75rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              textWrap: 'balance',
            }}
          >
            {title}
          </h1>

          <p className="text-base md:text-lg text-[var(--text-secondary)] leading-relaxed m-0">
            {description}
          </p>
        </div>

        <div className="relative w-full aspect-[16/9] rounded-[var(--radius-2xl)] overflow-hidden border border-[var(--border)]">
          <Illustration
            slot={coverSlot}
            alt={`${t.coverAltPrefix} — ${title}`}
            fill
            sizes="(max-width: 1024px) 100vw, 600px"
            className="!rounded-none"
          />
        </div>
      </div>
    </header>
  )
}
