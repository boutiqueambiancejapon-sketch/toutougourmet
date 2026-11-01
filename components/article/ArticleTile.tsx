import Link from 'next/link'
import { Illustration } from '@/components/ui/Illustration'
import { getArticleSlot } from '@/components/blog/blog-categories'
import { getCategoryBySlug } from '@/data/categories'
import { getCategoryPill, type OgTone } from '@/lib/og/tokens'
import { estimateReadTime, type Article } from '@/lib/mdx'

// @cdc 04-pages — carte d'article V2 : fond pastel de la rubrique, pastille de rubrique (prototype),
// verdict éventuel, titre, temps de lecture. `featured` = carte « À la une ».
const VERDICT: Record<'oui' | 'moderation' | 'danger', { label: string; cls: string }> = {
  oui: { label: '✓ Oui', cls: 'text-green-ink' },
  moderation: { label: '! Avec modération', cls: 'text-amber-ink' },
  danger: { label: '✕ Danger', cls: 'text-rose-ink' },
}

const TONE: Record<OgTone, { card: string; pill: string }> = {
  rose: { card: 'bg-rose-bg', pill: 'bg-rose text-rose-ink' },
  green: { card: 'bg-green-bg', pill: 'bg-green text-green-ink' },
  amber: { card: 'bg-amber-bg', pill: 'bg-amber text-amber-ink' },
  blue: { card: 'bg-blue-bg', pill: 'bg-blue text-blue-ink' },
}

export function articleHref(a: Article): string {
  return `/chien/${a.frontmatter.categorySlug}/${a.slug}`
}

export function ArticleTile({ article, featured = false }: { article: Article; featured?: boolean }) {
  const { frontmatter: fm } = article
  const verdict = fm.verdict ? VERDICT[fm.verdict] : null
  const pill = getCategoryPill(fm.categorySlug)
  const tone = TONE[pill.tone]
  const emoji = getCategoryBySlug(fm.categorySlug)?.emoji
  return (
    <Link
      href={articleHref(article)}
      className={`v2 group flex h-full gap-4 rounded-card p-3 text-ink no-underline transition-transform duration-200 hover:-translate-y-0.5 ${tone.card} ${featured ? 'flex-col md:flex-row md:items-center md:p-4' : 'flex-col'}`}
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
        <span className="flex flex-wrap items-center gap-1.5">
          {featured ? <span className="rounded-pill bg-ink px-2.5 py-0.5 text-xs font-semibold text-cream">À la une</span> : null}
          <span className={`rounded-pill px-2.5 py-0.5 text-xs font-semibold ${tone.pill}`}>
            {emoji ? <span aria-hidden="true">{emoji} </span> : null}
            {pill.label}
          </span>
          {verdict ? <span className={`rounded-pill bg-paper px-2.5 py-0.5 text-xs font-semibold ${verdict.cls}`}>{verdict.label}</span> : null}
        </span>
        <span className={`font-display font-black leading-tight group-hover:underline ${featured ? 'text-[clamp(1.5rem,2.6vw,2rem)]' : 'text-lg'}`}>
          {fm.title}
        </span>
        {featured ? <span className="text-ink-2">{fm.description}</span> : null}
        <span className="mt-auto text-xs font-medium text-ink-2">{estimateReadTime(article.rawContent)} min de lecture</span>
      </span>
    </Link>
  )
}
