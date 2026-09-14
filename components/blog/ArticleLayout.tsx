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
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionary'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'

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
  /** Locale de rendu — défaut `fr` */
  locale?: Locale
  /** Construit le href des articles liés — défaut : routes FR */
  relatedHrefBuilder?: (article: Article) => string
  /**
   * Miroir exact de cet article dans l'autre langue. Absent quand la traduction
   * n'existe pas — on ne propose jamais un lien vers une page qui n'existe pas,
   * c'est d'ailleurs la même condition que l'émission des hreflang.
   */
  translationHref?: string
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
  locale = DEFAULT_LOCALE,
  relatedHrefBuilder,
  translationHref,
  children,
}: ArticleLayoutProps) {
  const { frontmatter, slug } = article
  const t = getDictionary(locale)
  // La cover est indexée sur le slug FR : pour une traduction, on résout depuis
  // `translationOf`, jamais depuis le slug traduit.
  const coverSlot = getArticleSlot(frontmatter.translationOf ?? slug, frontmatter.category)

  return (
    <article className="bg-[var(--bg-primary)] pb-20">
      {translationHref && (
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 pt-6">
          <LanguageSwitcher locale={locale} href={translationHref} variant="banner" />
        </div>
      )}

      <ArticleHero
        breadcrumb={breadcrumb}
        category={frontmatter.category}
        coverSlot={coverSlot}
        dateDisplay={dateDisplay}
        readTime={readTime}
        title={frontmatter.title}
        description={frontmatter.description}
        locale={locale}
      />

      <div className="max-w-[1200px] mx-auto px-6 md:px-10 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-12 items-start">
          <div className="min-w-0">
            {tldrItems.length > 0 && <TLDR items={tldrItems} locale={locale} />}
            <SummarizeWithAI
              title={frontmatter.title}
              url={canonicalUrl}
              domain="toutou-gourmet.com"
              locale={locale}
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

            {t.articleCtas.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-6 text-sm font-medium">
                {t.articleCtas.map((cta) => (
                  <Link
                    key={cta.href}
                    href={cta.href}
                    className="text-[var(--accent-1)] hover:underline"
                  >
                    {cta.label}
                  </Link>
                ))}
              </div>
            )}

            <AuthorBox author={DEFAULT_AUTHOR} locale={locale} />

            <RelatedArticles
              currentSlug={currentSlug ?? slug}
              categorySlug={categorySlug ?? frontmatter.categorySlug}
              allArticles={allArticles}
              locale={locale}
              hrefBuilder={relatedHrefBuilder}
            />

            <div className="mt-12">
              <NewsletterBlock title={t.newsletterTitle} description={t.newsletterDescription} />
            </div>
          </div>

          {t.showBrandsSidebar && <RelatedBrands locale={locale} />}
        </div>
      </div>
    </article>
  )
}
