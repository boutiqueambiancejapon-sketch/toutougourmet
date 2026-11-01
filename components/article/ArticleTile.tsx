import Link from 'next/link'
import { Illustration } from '@/components/ui/Illustration'
import { getArticleSlot } from '@/components/blog/blog-categories'
import type { Article } from '@/lib/mdx'

// @cdc 04-pages — carte d'article V2 (prototype) : cover, verdict éventuel, titre. `featured` = carte « À la une ».
const VERDICT: Record<'oui' | 'moderation' | 'danger', { label: string; cls: string }> = {
  oui: { label: '✓ Oui', cls: 'bg-green text-green-ink' },
  moderation: { label: '! Avec modération', cls: 'bg-amber text-amber-ink' },
  danger: { label: '✕ Danger', cls: 'bg-rose text-rose-ink' },
}

export function articleHref(a: Article): string {
  return `/chien/${a.frontmatter.categorySlug}/${a.slug}`
}

export function ArticleTile({ article, featured = false }: { article: Article; featured?: boolean }) {
  const { frontmatter: fm } = article
  const verdict = fm.verdict ? VERDICT[fm.verdict] : null
  return (
    <Link
      href={articleHref(article)}
      className={`v2 group flex gap-4 text-ink no-underline ${featured ? 'flex-col md:flex-row md:items-center' : 'flex-col'}`}
    >
      <span className={`relative block aspect-[3/2] shrink-0 overflow-hidden rounded-card bg-cream-2 ${featured ? 'md:w-[55%]' : ''}`}>
        <Illustration
          slot={getArticleSlot(article.slug, fm.category)}
          alt=""
          fill
          sizes={featured ? '(max-width: 768px) 100vw, 620px' : '(max-width: 768px) 100vw, 360px'}
          className="!rounded-none transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </span>
      <span className="flex flex-col gap-2">
        {featured ? <span className="text-xs font-semibold uppercase tracking-widest text-orange-ink">À la une</span> : null}
        {verdict ? <span className={`self-start rounded-pill px-2.5 py-0.5 text-xs font-semibold ${verdict.cls}`}>{verdict.label}</span> : null}
        <span className={`font-display font-black leading-tight group-hover:underline ${featured ? 'text-[clamp(1.5rem,2.6vw,2rem)]' : 'text-lg'}`}>
          {fm.title}
        </span>
        {featured ? <span className="text-ink-2">{fm.description}</span> : null}
      </span>
    </Link>
  )
}
