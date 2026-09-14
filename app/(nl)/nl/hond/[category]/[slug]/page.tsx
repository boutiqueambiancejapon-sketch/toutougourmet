import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import {
  getAllArticles,
  getArticleBySlug,
  extractTldr,
  stripTldr,
  estimateReadTime,
  extractFaqs,
  type Article,
} from '@/lib/mdx'
import { formatDate } from '@/lib/utils'
import { StickyCta } from '@/components/blog/StickyCta'
import { ArticleLayout } from '@/components/blog/ArticleLayout'
import { getNlCategoryByFrSlug, getNlCategoryBySlug } from '@/lib/i18n/categories'
import { alternatesForNlArticle } from '@/lib/i18n/alternates'
import { LOCALE_CONFIG, SITE_URL } from '@/lib/i18n/config'
import { getArticleSlot } from '@/components/blog/blog-categories'
import { getSlotById } from '@/data/images-manifest'
import { getSlotPath } from '@/data/image-utils'
import { DEFAULT_AUTHOR } from '@/data/authors'
import {
  InfoBox, Callout, FeatureGrid, Feature,
  StatRow, Stat, CompareTable, CompareThead, CompareTh,
  CompareTr, CompareTd, Verdict, ProsConsList, ProsBlock, ConsBlock, ProItem, ConItem, SectionDivider, FaqList, FaqItem,
  BodyImage,
} from '@/components/mdx/MdxComponents'
import { BrandCTA } from '@/components/marques/BrandCTA'
import remarkGfm from 'remark-gfm'

interface Props {
  params: Promise<{ category: string; slug: string }>
}

const LOCALE = 'nl' as const
const INTL_LOCALE = LOCALE_CONFIG.nl.htmlLang

const mdxComponents = {
  InfoBox, Callout, FeatureGrid, Feature,
  StatRow, Stat, CompareTable, CompareThead, CompareTh,
  CompareTr, CompareTd, Verdict, ProsConsList, ProsBlock, ConsBlock, ProItem, ConItem, SectionDivider, FaqList, FaqItem,
  BrandCTA,
  BodyImage,
  table: (props: React.ComponentProps<'table'>) => (
    <div className="table-scroll">
      <table {...props} />
    </div>
  ),
}

/**
 * Cover d'un article traduit — résolue depuis le slug FR (`translationOf`),
 * puisque le mapping slug → slot d'illustration est indexé sur le FR.
 * @cdc images — jamais de chemin d'image en dur dans le frontmatter.
 */
function getArticleImageUrl(article: Article): string {
  const sourceSlug = article.frontmatter.translationOf ?? article.slug
  const slotId = getArticleSlot(sourceSlug, article.frontmatter.category)
  const slot = getSlotById(slotId)
  const path = slot
    ? getSlotPath(slot)
    : `/images/${slotId.startsWith('breed-') ? 'breeds' : 'articles'}/${slotId}.webp`
  return `${SITE_URL}${path}`
}

/** URL NL d'un article, depuis le slug de catégorie canonique FR */
function nlHref(article: Article): string {
  const category = getNlCategoryByFrSlug(article.frontmatter.categorySlug)
  return category ? `/nl/hond/${category.slug}/${article.slug}` : '/nl'
}

export async function generateStaticParams() {
  return getAllArticles(LOCALE)
    .map((a) => {
      const category = getNlCategoryByFrSlug(a.frontmatter.categorySlug)
      return category ? { category: category.slug, slug: a.slug } : null
    })
    .filter((p): p is { category: string; slug: string } => p !== null)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params
  const article = getArticleBySlug(slug, LOCALE)
  if (!article) return {}
  const { frontmatter } = article
  const canonical = `${SITE_URL}/nl/hond/${category}/${slug}`
  const ogImage = getArticleImageUrl(article)
  return {
    title: frontmatter.title,
    description: frontmatter.description,
    alternates: {
      canonical,
      languages: alternatesForNlArticle(article),
    },
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.description,
      url: canonical,
      type: 'article',
      locale: LOCALE_CONFIG.nl.ogLocale,
      images: [{ url: ogImage, width: 1500, height: 1000, alt: frontmatter.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: frontmatter.title,
      description: frontmatter.description,
      images: [ogImage],
    },
  }
}

export default async function NlArticlePage({ params }: Props) {
  const { category, slug } = await params
  const article = getArticleBySlug(slug, LOCALE)
  const nlCategory = getNlCategoryBySlug(category)
  if (!article || !nlCategory || article.frontmatter.categorySlug !== nlCategory.frSlug) notFound()

  const allArticles = getAllArticles(LOCALE)
  const { frontmatter, content, rawContent } = article
  const canonicalUrl = `${SITE_URL}/nl/hond/${category}/${slug}`
  const articleImageUrl = getArticleImageUrl(article)
  const tldrItems = extractTldr(rawContent)
  const readTime = estimateReadTime(rawContent)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: frontmatter.title,
    description: frontmatter.description,
    inLanguage: INTL_LOCALE,
    image: [articleImageUrl],
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    author: {
      '@type': 'Person',
      name: DEFAULT_AUTHOR.name,
      url: `${SITE_URL}${DEFAULT_AUTHOR.url}`,
    },
    datePublished: frontmatter.date,
    dateModified: frontmatter.updatedAt || frontmatter.date,
    publisher: {
      '@type': 'Organization',
      name: 'Toutou Gourmet',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/images/brand/logo.webp` },
    },
  }

  const faqs = extractFaqs(rawContent)
  const faqSchema = faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: INTL_LOCALE,
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  } : null

  // Phase 1 NL : seul le sticky affilié explicite du frontmatter est servi —
  // le routing intent-based (`getStickyCtaForArticle`) a des libellés FR.
  const affiliate = frontmatter.affiliateA

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      <ArticleLayout
        article={article}
        locale={LOCALE}
        breadcrumb={[
          { label: 'Home', href: '/nl' },
          { label: 'Hond', href: '/nl/hond' },
          { label: nlCategory.label, href: `/nl/hond/${category}` },
          { label: frontmatter.title },
        ]}
        canonicalUrl={canonicalUrl}
        dateDisplay={formatDate(frontmatter.updatedAt || frontmatter.date, INTL_LOCALE)}
        readTime={readTime}
        tldrItems={tldrItems}
        allArticles={allArticles}
        currentSlug={slug}
        categorySlug={frontmatter.categorySlug}
        relatedHrefBuilder={nlHref}
      >
        <MDXRemote
          source={stripTldr(content)}
          components={mdxComponents}
          options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
        />
      </ArticleLayout>

      {affiliate && (
        <StickyCta config={{
          brandName: affiliate.name,
          url: affiliate.url,
          label: affiliate.label ?? affiliate.badge ?? '',
          badge: affiliate.badge,
          badgeColor: affiliate.badgeColor,
          code: affiliate.code,
          socialProof: affiliate.socialProof,
          subButton: affiliate.subButton,
          buttonLabel: affiliate.buttonLabel,
        }} />
      )}
    </>
  )
}
