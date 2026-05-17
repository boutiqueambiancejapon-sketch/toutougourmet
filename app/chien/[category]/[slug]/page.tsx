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
} from '@/lib/mdx'
import { formatDate } from '@/lib/utils'
import { StickyCta } from '@/components/blog/StickyCta'
import { StickyCtaDouble } from '@/components/blog/StickyCtaDouble'
import { DOG_CHEF_CTA } from '@/lib/sticky-cta-config'
import { ArticleLayout } from '@/components/blog/ArticleLayout'
import { getCategoryBySlug } from '@/data/categories'
import { getArticleSlot } from '@/components/blog/blog-categories'
import { getSlotById, getSlotPath } from '@/data/images-manifest'
import { DEFAULT_AUTHOR } from '@/data/authors'
import {
  InfoBox, Callout, FeatureGrid, Feature,
  StatRow, Stat, CompareTable, CompareThead, CompareTh,
  CompareTr, CompareTd, Verdict, ProsConsList, ProsBlock, ConsBlock, ProItem, ConItem, SectionDivider, FaqList, FaqItem,
  BodyImage,
} from '@/components/mdx/MdxComponents'
import { BrandCTA } from '@/components/marques/BrandCTA'
import rehypeAutolinkTerms from '@/lib/rehype-autolink-terms'
import { AUTOLINK_DICTIONARY } from '@/lib/autolink-dictionary'
import remarkGfm from 'remark-gfm'

interface Props {
  params: Promise<{ category: string; slug: string }>
}

const SITE_URL = 'https://www.toutou-gourmet.com'

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
 * Construit l'URL absolue de l'image cover pour un article.
 * - Cherche le slot dans le manifest pour utiliser le bon ext (.webp / .jpeg)
 * - Fallback sur la convention historique `.webp` si le slot n'est pas déclaré
 */
function getArticleImageUrl(slug: string, category: string): string {
  const slotId = getArticleSlot(slug, category)
  const slot = getSlotById(slotId)
  const path = slot
    ? getSlotPath(slot)
    : `/images/${slotId.startsWith('breed-') ? 'breeds' : 'articles'}/${slotId}.webp`
  return `${SITE_URL}${path}`
}

export async function generateStaticParams() {
  return getAllArticles()
    .filter((a) => a.frontmatter.categorySlug)
    .map((a) => ({ category: a.frontmatter.categorySlug, slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) return {}
  const { frontmatter } = article
  const canonical = `${SITE_URL}/chien/${frontmatter.categorySlug}/${slug}`
  const ogImage = getArticleImageUrl(slug, frontmatter.category)
  return {
    title: frontmatter.title,
    description: frontmatter.description,
    alternates: { canonical },
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.description,
      url: canonical,
      type: 'article',
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

export default async function ArticleCategoryPage({ params }: Props) {
  const { category, slug } = await params
  const article = getArticleBySlug(slug)
  if (!article || article.frontmatter.categorySlug !== category) notFound()

  const allArticles = getAllArticles()
  const cat = getCategoryBySlug(category)
  const { frontmatter, content, rawContent } = article
  const canonicalUrl = `${SITE_URL}/chien/${category}/${slug}`
  const articleImageUrl = getArticleImageUrl(slug, frontmatter.category)
  const tldrItems = extractTldr(rawContent)
  const readTime = estimateReadTime(rawContent)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: frontmatter.title,
    description: frontmatter.description,
    image: [articleImageUrl],
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
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
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  } : null

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      <ArticleLayout
        article={article}
        breadcrumb={[
          { label: 'Accueil', href: '/' },
          { label: 'Chien', href: '/chien' },
          ...(cat ? [{ label: cat.label, href: `/chien/${category}` }] : []),
          { label: frontmatter.title },
        ]}
        canonicalUrl={canonicalUrl}
        dateDisplay={formatDate(frontmatter.updatedAt || frontmatter.date)}
        readTime={readTime}
        tldrItems={tldrItems}
        allArticles={allArticles}
        currentSlug={slug}
        categorySlug={category}
      >
        <MDXRemote
          source={stripTldr(content)}
          components={mdxComponents}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [
                [rehypeAutolinkTerms, { terms: AUTOLINK_DICTIONARY, maxTotal: 3 }],
              ],
            },
          }}
        />
      </ArticleLayout>

      {frontmatter.affiliateA && frontmatter.affiliateB ? (
        <StickyCtaDouble
          eyebrow="Comparer les deux"
          brandA={{ label: `Acheter ${frontmatter.affiliateA.name}`, href: frontmatter.affiliateA.url }}
          brandB={{ label: `Acheter ${frontmatter.affiliateB.name}`, href: frontmatter.affiliateB.url }}
        />
      ) : frontmatter.affiliateA ? (
        <StickyCta config={{
          brandName: frontmatter.affiliateA.name,
          url: frontmatter.affiliateA.url,
          label: frontmatter.affiliateA.label ?? `disponible chez ${frontmatter.affiliateA.badge ?? 'Maxi Zoo'}`,
          badge: frontmatter.affiliateA.badge,
          code: frontmatter.affiliateA.code,
        }} />
      ) : (
        <StickyCta config={DOG_CHEF_CTA} />
      )}
    </>
  )
}
