import { TLDR } from './TLDR'
import { SummarizeWithAI } from './SummarizeWithAI'
import { AuthorBox } from './AuthorBox'
import { RelatedArticles } from './RelatedArticles'
import { getArticleSlot } from './blog-categories'
import { ArticleHeader, ArticleMeta, type BreadcrumbItem } from '@/components/article/ArticleHeader'
import { ArticleAside } from '@/components/article/ArticleAside'
import { DEFAULT_AUTHOR } from '@/data/authors'
import { getBreedForArticle } from '@/data/breeds'
import { getFoodVerdicts } from '@/lib/food-verdicts'
import { RaceFacts } from '@/components/race/RaceFacts'
import { RaceFoodSection, RACE_FOOD_ID, raceFoodHeading } from '@/components/race/RaceFoodSection'
import { RaceHealth, RaceNear, RACE_HEALTH_ID, RACE_NEAR_ID } from '@/components/race/RaceHealthAndNear'
import { RaceAccountInvite } from '@/components/race/RaceAccountInvite'
import { extractToc } from '@/lib/article-toc'
import { isUrgentPage, urgentToc } from '@/lib/remark-urgent-first'
import { getAlternativesLink } from '@/lib/alternatives-link'
import { AlternativesLink } from '@/components/marques/AlternativesLink'
import { articleEndCta, getPortionCalc } from '@/lib/article-cro'
import { VerdictHero } from '@/components/article/VerdictHero'
import { FoodPortionCalc } from '@/components/article/FoodPortionCalc'
import { GuideFicheLink } from '@/components/guide/GuideFicheLink'
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

/** « L'essentiel » : sous les gestes sur une page d'urgence (lib/remark-urgent-first.ts), sinon en tête. */
export function ArticleTldr({ items }: { items: string[] }) {
  if (items.length === 0) return null
  return (
    <div id={TLDR_ID} className="scroll-mt-24">
      <TLDR items={items} />
    </div>
  )
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
  const catSlug = categorySlug ?? frontmatter.categorySlug
  const breed = getBreedForArticle(slug)
  const urgent = isUrgentPage({ slug, categorySlug: catSlug, verdict: frontmatter.verdict })
  const headings = extractToc(article.rawContent).filter((item) => !/^tl;?dr$/i.test(item.text))
  const toc = [
    ...(tldrItems.length > 0 && !urgent ? [{ id: TLDR_ID, text: "L'essentiel" }] : []),
    ...(breed
      ? [
          { id: RACE_FOOD_ID, text: raceFoodHeading(breed) },
          ...(breed.health.length > 0 ? [{ id: RACE_HEALTH_ID, text: 'Points de vigilance' }] : []),
          ...(breed.near.length > 0 ? [{ id: RACE_NEAR_ID, text: 'Races proches' }] : []),
        ]
      : []),
    ...(urgent ? urgentToc(headings, article.rawContent) : headings),
  ]
  const portion = getPortionCalc(article)
  const foods = breed ? getFoodVerdicts() : []
  const endCta = articleEndCta({ slug, categorySlug: catSlug, verdict: frontmatter.verdict })
  // Aliment « danger », urgence, « mon chien a mangé… » : jamais le panneau du guide (lib/guide/use-guide-popup.ts).
  const noPopup = endCta === 'fiche-link' || slug.startsWith('chien-mange-')
  const alternatives = getAlternativesLink(article)

  return (
    <article className="bg-cream pb-20" {...(noPopup ? { 'data-no-popup': '' } : {})}>
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
        extra={breed ? <RaceFacts breed={breed} /> : alternatives ? <AlternativesLink {...alternatives} /> : undefined}
        lead={frontmatter.verdict ? <VerdictHero verdict={frontmatter.verdict} note={frontmatter.verdictNote} call={urgent || frontmatter.verdict === 'danger'} /> : undefined}
        urgent={urgent}
      />

      <div className={`mx-auto max-w-page px-4 md:px-8 ${urgent ? 'pt-2' : 'pt-8'}`}>
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            {urgent ? null : <ArticleTldr items={tldrItems} />}
            {portion && !urgent ? <FoodPortionCalc {...portion} /> : null}
            {breed ? (
              <>
                <RaceFoodSection breed={breed} foods={foods} />
                <RaceHealth breed={breed} />
                <RaceNear breed={breed} />
                <RaceAccountInvite breed={breed} />
              </>
            ) : null}
            <div className="mdx-content mt-6">{children}</div>
            {/* Aliments et recettes : le guide n'apparaît qu'une fois, en haut de l'article (GuideTop) ;
                urgences et « danger » : un lien discret seulement (lib/article-cro.ts). */}
            {endCta === 'fiche-link' ? <GuideFicheLink /> : null}
            {/* @cdc audit mobile 2026-11-04 — après l'article : avant, il invitait à quitter la page au moment de lire. */}
            {urgent ? null : <SummarizeWithAI title={frontmatter.title} url={canonicalUrl} domain="toutou-gourmet.com" />}
            {urgent ? (
              <div className="v2 mt-6">
                <ArticleMeta categorySlug={catSlug} author={DEFAULT_AUTHOR} updatedIso={frontmatter.updatedAt || frontmatter.date} updatedDisplay={dateDisplay} readTime={readTime} />
              </div>
            ) : null}
            <AuthorBox author={DEFAULT_AUTHOR} />
            <RelatedArticles currentSlug={currentSlug ?? slug} categorySlug={catSlug} allArticles={allArticles} />
          </div>
          <ArticleAside toc={toc} seed={slug} urgent={urgent} />
        </div>
      </div>
    </article>
  )
}
