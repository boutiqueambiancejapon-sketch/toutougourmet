import Link from 'next/link'
import { Illustration } from '@/components/ui/Illustration'
import { getArticleSlot } from '@/components/blog/blog-categories'
import { getCategoryPill, type OgTone } from '@/lib/og/tokens'
import { estimateReadTime, type Article } from '@/lib/mdx'
import { CategoryIcon, VerdictIcon, type VerdictKind } from '@/components/icons'

// @cdc 04-pages — carte d'article V2 : fond pastel de la rubrique, titre, puis une ligne
// rubrique · verdict · temps de lecture sous le titre (pas de pastille au-dessus).
// `featured` = grande carte en tête de rubrique.
const VERDICT: Record<VerdictKind, { label: string; cls: string }> = {
  oui: { label: 'Oui', cls: 'text-green-ink' },
  moderation: { label: 'Avec modération', cls: 'text-amber-ink' },
  danger: { label: 'Danger', cls: 'text-rose-ink' },
}

const TONE: Record<OgTone, string> = {
  rose: 'bg-rose-bg',
  green: 'bg-green-bg',
  amber: 'bg-amber-bg',
  blue: 'bg-blue-bg',
}

export function articleHref(a: Article): string {
  return `/chien/${a.frontmatter.categorySlug}/${a.slug}`
}

export function ArticleTile({ article, featured = false }: { article: Article; featured?: boolean }) {
  const { frontmatter: fm } = article
  const verdict = fm.verdict ? VERDICT[fm.verdict] : null
  const pill = getCategoryPill(fm.categorySlug)
  return (
    <Link
      href={articleHref(article)}
      className={`v2 group flex h-full gap-4 rounded-card p-3 text-ink no-underline transition-transform duration-200 hover:-translate-y-0.5 ${TONE[pill.tone]} ${featured ? 'flex-col md:flex-row md:items-center md:p-4' : 'flex-col'}`}
    >
      <span className={`relative block aspect-[3/2] shrink-0 overflow-hidden rounded-box bg-cream-2 ${featured ? 'md:w-[55%]' : ''}`}>
        <Illustration
          slot={getArticleSlot(article.slug, fm.category)}
          alt=""
          fill
          sizes={featured ? '(max-width: 768px) 100vw, 620px' : '(max-width: 768px) 100vw, 360px'}
          className="!rounded-none"
        />
      </span>
      <span className="flex grow flex-col gap-2.5 px-1 pb-1">
        <span className={`font-display font-black leading-tight group-hover:underline ${featured ? 'text-[clamp(1.5rem,2.6vw,2rem)]' : 'text-lg'}`}>
          {fm.title}
        </span>
        {featured ? <span className="text-ink-2">{fm.description}</span> : null}
        <span className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-ink-2">
          <span className="inline-flex items-center gap-1">
            <CategoryIcon slug={fm.categorySlug} className="size-4" />
            {pill.label}
          </span>
          {verdict && fm.verdict ? (
            <span className={`inline-flex items-center gap-1 font-semibold ${verdict.cls}`}>
              <VerdictIcon verdict={fm.verdict} className="size-4 text-ink" />
              {verdict.label}
            </span>
          ) : null}
          <span>{estimateReadTime(article.rawContent)} min de lecture</span>
        </span>
      </span>
    </Link>
  )
}
