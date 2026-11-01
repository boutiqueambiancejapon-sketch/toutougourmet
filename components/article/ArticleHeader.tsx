import Link from 'next/link'
import { Illustration } from '@/components/ui/Illustration'
import { getCategoryPill } from '@/lib/og/tokens'
import { CategoryIcon } from '@/components/icons'
import { BreadcrumbNav, type BreadcrumbItem } from '@/components/ui/BreadcrumbNav'

// @cdc 04-pages — en-tête d'article V2 (prototype) : fil d'Ariane, H1, chapô,
// ligne rubrique · auteur · date de mise à jour en <time>, cover à droite.
// Pas de pastille au-dessus du titre (audit design 2026-11-02, §2.3).

export type { BreadcrumbItem }

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
  /** Bloc affiché sous l'auteur (fiche chiffrée des pages race) */
  extra?: React.ReactNode
}

export function ArticleHeader(props: ArticleHeaderProps) {
  const { breadcrumb, categorySlug, coverSlot, title, description, author, updatedIso, updatedDisplay, readTime, extra } = props
  const pill = getCategoryPill(categorySlug)
  return (
    <header className="v2 mx-auto flex max-w-page flex-col gap-6 px-4 pt-6 md:px-8 md:pt-10">
      <BreadcrumbNav items={breadcrumb} />
      <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12">
        <div className="flex min-w-0 flex-col gap-4">
          <h1 className="m-0 font-display text-[clamp(1.9rem,3.6vw,2.6rem)] font-black leading-[1.08] tracking-tight text-ink [text-wrap:balance]">
            {title}
          </h1>
          <p className="m-0 text-base leading-relaxed text-ink-2 md:text-lg">{description}</p>
          <p className="m-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-2">
            <Link href={`/chien/${categorySlug}`} className="inline-flex items-center gap-1.5 text-ink-2 no-underline hover:text-ink">
              <CategoryIcon slug={categorySlug} className="size-[18px]" />
              {pill.label}
            </Link>
            <span aria-hidden="true">·</span>
            <Link href={author.url} className="font-semibold text-ink no-underline hover:text-orange-ink">{author.name}</Link>
            <span aria-hidden="true">·</span>
            <span>
              Mis à jour le <time dateTime={updatedIso}>{updatedDisplay}</time>
            </span>
            <span aria-hidden="true">·</span>
            <span>{readTime} min de lecture</span>
          </p>
          {extra}
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
