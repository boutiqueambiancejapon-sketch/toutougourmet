import Link from 'next/link'
import { getAllArticles, type Article } from '@/lib/mdx'
import { formatDate, estimateReadTime } from '@/lib/utils'
import { Illustration } from '@/components/ui/Illustration'

const CATEGORY_TO_TONE_SLOT: Record<string, string> = {
  Nutrition: 'cat-nutrition',
  Santé: 'cat-sante',
  Alimentation: 'cat-alimentation',
  Comportement: 'cat-comportement',
  Enquêtes: 'cat-enquetes',
  Urgences: 'cat-urgences',
  'Avis & Comparatif': 'cat-avis-marques',
  'Par race': 'cat-par-race',
  Guide: 'cat-par-race',
  Comparatif: 'cat-avis-marques',
}

const CATEGORY_PILL: Record<string, string> = {
  Nutrition: 'var(--pill-amber)',
  Santé: 'var(--pill-green)',
  Alimentation: 'var(--pill-rose)',
  Comportement: 'var(--pill-blue)',
  Enquêtes: 'var(--pill-amber)',
  Urgences: 'var(--pill-rose)',
}

function resolveSlot(article: Article): string {
  return CATEGORY_TO_TONE_SLOT[article.frontmatter.category] ?? 'cat-nutrition'
}

function pillFor(article: Article): string {
  return CATEGORY_PILL[article.frontmatter.category] ?? 'var(--pill-amber)'
}

function articleHref(article: Article): string {
  const cs = article.frontmatter.categorySlug
  return cs ? `/chien/${cs}/${article.slug}` : `/blog/${article.slug}`
}

function FeaturedCard({ article }: { article: Article }) {
  const { frontmatter } = article
  return (
    <Link
      href={articleHref(article)}
      className="group flex flex-col rounded-[var(--radius-2xl)] overflow-hidden bg-[var(--bg-surface)] border border-[var(--border)] hover:-translate-y-1.5 hover:shadow-[var(--shadow-xl)] transition-all duration-300"
    >
      <div className="relative">
        <Illustration slot={resolveSlot(article)} alt={frontmatter.title} className="!rounded-none" />
        <span
          className="absolute top-4 left-4 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full text-[var(--text-primary)]"
          style={{ background: pillFor(article) }}
        >
          {frontmatter.category}
        </span>
        <span className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-[var(--bg-dark)] text-[var(--text-on-dark)]">
          À la une
        </span>
      </div>
      <div className="p-7 flex flex-col gap-3.5 flex-1">
        <h3
          className="m-0 text-2xl md:text-3xl font-black text-[var(--text-primary)] leading-tight group-hover:text-[var(--accent-1)] transition-colors"
          style={{ fontFamily: "'Fraunces', serif", letterSpacing: '-0.02em' }}
        >
          {frontmatter.title}
        </h3>
        <p className="text-base text-[var(--text-secondary)] leading-relaxed m-0">{frontmatter.description}</p>
        <div className="flex items-center gap-3 mt-auto pt-3 text-sm text-[var(--text-muted)]">
          <span className="font-semibold text-[var(--text-primary)]">{frontmatter.author}</span>
          <span>·</span>
          <span>{formatDate(frontmatter.date)}</span>
          <span>·</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{estimateReadTime(article.content)} min</span>
        </div>
      </div>
    </Link>
  )
}

function SmallCard({ article }: { article: Article }) {
  const { frontmatter } = article
  return (
    <Link
      href={articleHref(article)}
      className="group grid grid-cols-[140px_1fr] gap-0 rounded-[var(--radius-lg)] overflow-hidden bg-[var(--bg-surface)] border border-[var(--border)] hover:-translate-y-1 hover:shadow-[var(--shadow-md)] transition-all duration-300 min-h-[140px]"
    >
      <div className="relative w-[140px] h-full shrink-0">
        <Illustration
          slot={resolveSlot(article)}
          alt={frontmatter.title}
          fill
          sizes="140px"
          className="!rounded-none"
        />
      </div>
      <div className="p-4 flex flex-col gap-1.5 min-w-0">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
          {frontmatter.category}
        </span>
        <h3
          className="m-0 font-black text-[var(--text-primary)] leading-tight text-base line-clamp-2 group-hover:text-[var(--accent-1)] transition-colors"
          style={{ fontFamily: "'Fraunces', serif", letterSpacing: '-0.01em' }}
        >
          {frontmatter.title}
        </h3>
        <div className="flex items-center gap-2 mt-auto pt-1.5 text-xs text-[var(--text-muted)]">
          <span>{formatDate(frontmatter.date)}</span>
          <span>·</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{estimateReadTime(article.content)} min</span>
        </div>
      </div>
    </Link>
  )
}

export function ArticlesGrid() {
  const articles = getAllArticles().slice(0, 4)
  if (articles.length === 0) return null
  const [featured, ...rest] = articles

  return (
    <section id="blog" className="py-24 px-6 md:px-10 bg-[var(--bg-blue)]">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex items-end justify-between mb-12 gap-6 flex-wrap">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent-blue)] mb-2.5">
              Le blog
            </p>
            <h2 className="section-title m-0">
              On écrit,<br />tu apprends.
            </h2>
          </div>
          <Link
            href="/blog"
            className="text-sm font-bold text-[var(--accent-blue)] whitespace-nowrap hover:underline"
          >
            Tous les articles →
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-5 items-stretch">
          <FeaturedCard article={featured} />
          <div className="flex flex-col gap-5">
            {rest.slice(0, 3).map((a) => (
              <SmallCard key={a.slug} article={a} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
