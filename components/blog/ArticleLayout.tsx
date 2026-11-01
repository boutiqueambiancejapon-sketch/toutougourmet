import { TLDR } from './TLDR'
import { SummarizeWithAI } from './SummarizeWithAI'
import { AuthorBox } from './AuthorBox'
import { RelatedArticles } from './RelatedArticles'
import { NewsletterBlock } from './NewsletterBlock'
import { getArticleSlot } from './blog-categories'
import { ArticleHeader, type BreadcrumbItem } from '@/components/article/ArticleHeader'
import { ArticleAside } from '@/components/article/ArticleAside'
import { DEFAULT_AUTHOR } from '@/data/authors'
import { extractToc } from '@/lib/article-toc'
import type { Article } from '@/lib/mdx'

// @cdc 04-pages — gabarit d'article V2 (prototype docs/v2/prototype) : en-tête, puis
// colonne de lecture + colonne de droite (sommaire, encart ration, marques).

export interface ArticleLayoutProps {
  article: Article
  breadcrumb: BreadcrumbItem[]
  canonicalUrl: string
  dateDisplay: string
  readTime: number
  tldrItems: string[]
  allArticles: Article[]
  /** Slug used to filter RelatedArticles — falls back to article.slug */
  currentSlug?: string
  /** Category slug for RelatedArticles filter (optional) */
  categorySlug?: string
  /** MDX rendered content goes here */
  children: React.ReactNode
}

const TLDR_ID = 'l-essentiel'

export function ArticleLayout({
  article,
  breadcrumb,
  canonicalUrl,
  dateDisplay,
  readTime,
  tldrItems,
  allArticles,
  currentSlug,
  categorySlug,
  children,
}: ArticleLayoutProps) {
  const { frontmatter, slug } = article
  const catSlug = categorySlug ?? frontmatter.categorySlug
  const toc = [
    ...(tldrItems.length > 0 ? [{ id: TLDR_ID, text: "L'essentiel" }] : []),
    ...extractToc(article.rawContent).filter((item) => !/^tl;?dr$/i.test(item.text)),
  ]

  return (
    <article className="bg-cream pb-20">
      <ArticleHeader
        breadcrumb={breadcrumb}
        categorySlug={catSlug}
        coverSlot={getArticleSlot(slug, frontmatter.category)}
        title={frontmatter.title}
        description={frontmatter.description}
        author={{ name: DEFAULT_AUTHOR.name, url: DEFAULT_AUTHOR.url }}
        updatedIso={frontmatter.updatedAt || frontmatter.date}
        updatedDisplay={dateDisplay}
        readTime={readTime}
      />

      <div className="mx-auto max-w-page px-4 pt-8 md:px-8">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            {tldrItems.length > 0 ? (
              <div id={TLDR_ID} className="scroll-mt-24">
                <TLDR items={tldrItems} />
              </div>
            ) : null}
            <div className="mdx-content mt-6">{children}</div>
            <SummarizeWithAI title={frontmatter.title} url={canonicalUrl} domain="toutou-gourmet.com" />
            <AuthorBox author={DEFAULT_AUTHOR} />
            <RelatedArticles currentSlug={currentSlug ?? slug} categorySlug={catSlug} allArticles={allArticles} />
            <div className="mt-12">
              <NewsletterBlock />
            </div>
          </div>
          <ArticleAside toc={toc} />
        </div>
      </div>
    </article>
  )
}
