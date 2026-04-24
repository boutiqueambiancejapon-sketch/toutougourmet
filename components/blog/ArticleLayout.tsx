import Link from 'next/link'
import { ArticleHero, type BreadcrumbItem } from './ArticleHero'
import { TLDR } from './TLDR'
import { SummarizeWithAI } from './SummarizeWithAI'
import { RelatedBrands } from './RelatedBrands'
import { AuthorBox } from './AuthorBox'
import { RelatedArticles } from './RelatedArticles'
import { NewsletterBlock } from './NewsletterBlock'
import { getArticleSlot } from './blog-categories'
import { Badge } from '@/components/ui/Badge'
import { DEFAULT_AUTHOR } from '@/data/authors'
import type { Article } from '@/lib/mdx'

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
  const coverSlot = getArticleSlot(slug, frontmatter.category)

  return (
    <article className="bg-[var(--bg-primary)] pb-20">
      <ArticleHero
        breadcrumb={breadcrumb}
        category={frontmatter.category}
        coverSlot={coverSlot}
        dateDisplay={dateDisplay}
        readTime={readTime}
        title={frontmatter.title}
        description={frontmatter.description}
      />

      <div className="max-w-[1200px] mx-auto px-6 md:px-10 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-12 items-start">
          <div className="min-w-0">
            {tldrItems.length > 0 && <TLDR items={tldrItems} />}
            <SummarizeWithAI
              title={frontmatter.title}
              url={canonicalUrl}
              domain="toutou-gourmet.com"
            />
            <div className="mdx-content mt-6">{children}</div>

            {frontmatter.tags && frontmatter.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-[var(--border)]">
                {frontmatter.tags.map((tag) => (
                  <Badge key={tag} variant="default">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-4 mt-6 text-sm font-medium">
              <Link href="/quiz" className="text-[var(--accent-1)] hover:underline">
                → Faire le quiz personnalisé
              </Link>
              <Link href="/comparateur" className="text-[var(--accent-1)] hover:underline">
                → Voir le comparateur complet
              </Link>
            </div>

            <AuthorBox author={DEFAULT_AUTHOR} />

            <RelatedArticles
              currentSlug={currentSlug ?? slug}
              categorySlug={categorySlug ?? frontmatter.categorySlug}
              allArticles={allArticles}
            />

            <div className="mt-12">
              <NewsletterBlock />
            </div>
          </div>

          <RelatedBrands />
        </div>
      </div>
    </article>
  )
}
