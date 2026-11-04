import Link from 'next/link'
import type { ComponentProps } from 'react'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import type { Brand } from '@/data/brands'
import type { Comparatif } from '@/lib/mdx'
import { articleMdxComponents } from '@/components/mdx/article-components'
import { Heading2 } from '@/components/mdx/Heading2'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { formatDate } from '@/lib/utils'
import { remarkFormula } from '@/lib/remark-formula'
import { DualBrandCTA } from './DualBrandCTA'
import { StickyComparatifCTA } from './StickyComparatifCTA'
import { titleTypo } from '@/lib/title-typo'

// @cdc 04-pages — duel éditorial (content/comparatifs/*.mdx) dans la mise en page V2 des articles :
// en-tête sans pastille, offres des deux marques en liens discrets, corps MDX avec les composants
// d'article (FAQ en accordéon, H2 ancrés). « TL;DR » s'affiche « En bref ».

const components = {
  ...articleMdxComponents,
  h2: ({ children, ...props }: ComponentProps<'h2'>) => (
    <Heading2 {...props}>{children === 'TL;DR' ? 'En bref' : children}</Heading2>
  ),
}

interface Props {
  comparatif: Comparatif
  brandA?: Brand
  brandB?: Brand
}

export function ComparatifEditorial({ comparatif, brandA, brandB }: Props) {
  const { frontmatter, content } = comparatif
  const date = frontmatter.updatedAt || frontmatter.date
  return (
    <>
      {/* @cdc 04-pages — pas de classe v2 autour du corps MDX : les styles .mdx-content (globals.css) ne
          s'appliquent que hors .v2, comme dans ArticleLayout. L'en-tête et le bas gardent la leur. */}
      <article className="bg-cream pb-24">
        <div className="mx-auto flex max-w-[760px] flex-col gap-6 px-4 pt-6 md:px-8 md:pt-10">
          <BreadcrumbNav items={[{ label: 'Accueil', href: '/' }, { label: 'Guides', href: '/chien' }, { label: 'Marques', href: '/chien/marque' }, { label: `${brandA?.name ?? ''} vs ${brandB?.name ?? ''}` }]} />
          <header className="v2 flex flex-col gap-3">
            <h1 className="m-0 font-display text-[clamp(1.9rem,3.6vw,2.6rem)] font-black leading-[1.08] tracking-tight text-ink">{titleTypo(frontmatter.title)}</h1>
            <p className="m-0 text-lg leading-relaxed text-ink-2">{frontmatter.description}</p>
            {date ? <p className="m-0 text-sm text-ink-2">Comparatif mis à jour le {formatDate(date)}</p> : null}
          </header>
          {brandA && brandB ? <DualBrandCTA brandA={brandA} brandB={brandB} place="duel-haut" /> : null}
          <div className="mdx-content">
            <MDXRemote source={content} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm, remarkFormula] } }} />
          </div>
          <nav aria-label="Pour aller plus loin" className="v2 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-6">
            <Link href="/chien/marque" className="font-semibold text-orange-ink underline underline-offset-4">Choisir selon le profil de ton chien</Link>
            <Link href="/chien/marque/comparatif" className="font-semibold text-orange-ink underline underline-offset-4">Tous les comparatifs</Link>
          </nav>
        </div>
      </article>
      {brandA && brandB ? <StickyComparatifCTA brands={[brandA, brandB].filter((b) => !b.stockNote)} /> : null}
    </>
  )
}
