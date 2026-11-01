import Link from 'next/link'
import { Illustration } from '@/components/ui/Illustration'
import { getCategoryBySlug } from '@/data/categories'
import { getCategoryPill, type OgTone } from '@/lib/og/tokens'

// @cdc 04-pages — en-tête d'article V2 (prototype) : fil d'Ariane, pastille de rubrique,
// H1, chapô, auteur + date de mise à jour en <time>, cover à droite.

export interface BreadcrumbItem {
  label: string
  href?: string
}

const TONE_CLASS: Record<OgTone, string> = {
  rose: 'bg-rose text-rose-ink',
  green: 'bg-green text-green-ink',
  amber: 'bg-amber text-amber-ink',
  blue: 'bg-blue text-blue-ink',
}

interface ArticleHeaderProps {
  breadcrumb: BreadcrumbItem[]
  categorySlug: string
  coverSlot: string
  title: string
  description: string
  author: { name: string; url: string }
  /** Date ISO (AAAA-MM-JJ) de la dernière mise à jour */
  updatedIso: string
  updatedDisplay: string
  readTime: number
}

function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="text-sm text-ink-2">
      <ol role="list" className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="inline-flex items-center gap-1.5">
            {i > 0 ? <span aria-hidden="true" className="opacity-50">›</span> : null}
            {item.href ? (
              <Link href={item.href} className="text-ink-2 no-underline hover:text-ink">{item.label}</Link>
            ) : (
              <span aria-current="page" className="text-ink">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function ArticleHeader(props: ArticleHeaderProps) {
  const { breadcrumb, categorySlug, coverSlot, title, description, author, updatedIso, updatedDisplay, readTime } = props
  const pill = getCategoryPill(categorySlug)
  const emoji = getCategoryBySlug(categorySlug)?.emoji
  return (
    <header className="v2 mx-auto flex max-w-page flex-col gap-6 px-4 pt-6 md:px-8 md:pt-10">
      <Breadcrumb items={breadcrumb} />
      <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12">
        <div className="flex min-w-0 flex-col gap-4">
          <Link
            href={`/chien/${categorySlug}`}
            className={`inline-flex items-center gap-1.5 self-start rounded-pill px-3.5 py-1.5 text-sm font-semibold no-underline ${TONE_CLASS[pill.tone]}`}
          >
            {emoji ? <span aria-hidden="true">{emoji}</span> : null}
            {pill.label}
          </Link>
          <h1 className="m-0 font-display text-[clamp(1.9rem,3.6vw,2.6rem)] font-black leading-[1.08] tracking-tight text-ink [text-wrap:balance]">
            {title}
          </h1>
          <p className="m-0 text-base leading-relaxed text-ink-2 md:text-lg">{description}</p>
          <p className="m-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-2">
            <Link href={author.url} className="font-semibold text-ink no-underline hover:text-orange-ink">{author.name}</Link>
            <span aria-hidden="true">·</span>
            <span>
              Mis à jour le <time dateTime={updatedIso}>{updatedDisplay}</time>
            </span>
            <span aria-hidden="true">·</span>
            <span>{readTime} min de lecture</span>
          </p>
        </div>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-hero">
          <Illustration
            slot={coverSlot}
            alt={`Illustration : ${title}`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 520px"
            className="!rounded-none"
          />
        </div>
      </div>
    </header>
  )
}
