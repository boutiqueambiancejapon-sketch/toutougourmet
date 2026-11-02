import { TLDR } from './TLDR'
import { SummarizeWithAI } from './SummarizeWithAI'
import { AuthorBox } from './AuthorBox'
import { RelatedArticles } from './RelatedArticles'
import { NewsletterBlock } from './NewsletterBlock'
import { getArticleSlot } from './blog-categories'
import { ArticleHeader, type BreadcrumbItem } from '@/components/article/ArticleHeader'
import { ArticleAside } from '@/components/article/ArticleAside'
import { DEFAULT_AUTHOR } from '@/data/authors'
import { getBreedForArticle } from '@/data/breeds'
import { getFoodVerdicts } from '@/lib/food-verdicts'
import { RaceFacts } from '@/components/race/RaceFacts'
import { RaceFoodSection, RACE_FOOD_ID, raceFoodHeading } from '@/components/race/RaceFoodSection'
import { RaceHealth, RaceNear, RACE_HEALTH_ID, RACE_NEAR_ID } from '@/components/race/RaceHealthAndNear'
import { extractToc } from '@/lib/article-toc'
import { getPortionCalc, showsBonusFiche } from '@/lib/article-cro'
import { VerdictHero } from '@/components/article/VerdictHero'
import { FoodPortionCalc } from '@/components/article/FoodPortionCalc'
import { BonusFiche } from '@/components/article/BonusFiche'
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
  const breed = getBreedForArticle(slug)
  const toc = [
    ...(tldrItems.length > 0 ? [{ id: TLDR_ID, text: "L'essentiel" }] : []),
    ...(breed
      ? [
          { id: RACE_FOOD_ID, text: raceFoodHeading(breed) },
          ...(breed.health.length > 0 ? [{ id: RACE_HEALTH_ID, text: 'Points de vigilance' }] : []),
          ...(breed.near.length > 0 ? [{ id: RACE_NEAR_ID, text: 'Races proches' }] : []),
        ]
      : []),
    ...extractToc(article.rawContent).filter((item) => !/^tl;?dr$/i.test(item.text)),
  ]
  const portion = getPortionCalc(article)
  const foods = breed || showsBonusFiche(catSlug) ? getFoodVerdicts() : []

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
        extra={breed ? <RaceFacts breed={breed} /> : undefined}
        lead={frontmatter.verdict ? <VerdictHero verdict={frontmatter.verdict} note={frontmatter.verdictNote} /> : undefined}
      />

      <div className="mx-auto max-w-page px-4 pt-8 md:px-8">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            {tldrItems.length > 0 ? (
              <div id={TLDR_ID} className="scroll-mt-24">
                <TLDR items={tldrItems} />
              </div>
            ) : null}
            {portion ? <FoodPortionCalc {...portion} /> : null}
            <SummarizeWithAI title={frontmatter.title} url={canonicalUrl} domain="toutou-gourmet.com" />
            {breed ? (
              <>
                <RaceFoodSection breed={breed} foods={foods} />
                <RaceHealth breed={breed} />
                <RaceNear breed={breed} />
              </>
            ) : null}
            <div className="mdx-content mt-6">{children}</div>
            {/* Un seul formulaire e-mail par article : le bonus remplace l'inscription générique. */}
            {showsBonusFiche(catSlug) ? (
              <BonusFiche
                slug={slug}
                dangerCount={foods.filter((f) => f.verdict === 'danger').length}
                moderationCount={foods.filter((f) => f.verdict === 'moderation').length}
              />
            ) : null}
            <AuthorBox author={DEFAULT_AUTHOR} />
            <RelatedArticles currentSlug={currentSlug ?? slug} categorySlug={catSlug} allArticles={allArticles} />
            {showsBonusFiche(catSlug) ? null : (
              <div className="mt-12">
                <NewsletterBlock />
              </div>
            )}
          </div>
          <ArticleAside toc={toc} />
        </div>
      </div>
    </article>
  )
}
