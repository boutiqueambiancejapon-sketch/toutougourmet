import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getAllArticles, getArticleBySlug, extractTldr, stripTldr, estimateReadTime, extractFaqs } from '@/lib/mdx'
import { formatDate } from '@/lib/utils'
import { TLDR } from '@/components/blog/TLDR'
import { SummarizeWithAI } from '@/components/blog/SummarizeWithAI'
import { NewsletterBlock } from '@/components/blog/NewsletterBlock'
import { RelatedArticles } from '@/components/blog/RelatedArticles'
import { StickyCtaDogChef } from '@/components/blog/StickyCtaDogChef'
import { StickyCtaDouble } from '@/components/blog/StickyCtaDouble'
import { Badge } from '@/components/ui/Badge'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { getCategoryBySlug } from '@/data/categories'
import {
  InfoBox, Callout, FeatureGrid, Feature,
  StatRow, Stat, CompareTable, CompareThead, CompareTh,
  CompareTr, CompareTd, Verdict, ProsConsList, ProsBlock, ConsBlock, ProItem, ConItem, SectionDivider, FaqList, FaqItem,
} from '@/components/mdx/MdxComponents'
import { BrandCTA } from '@/components/marques/BrandCTA'
import rehypeAutolinkTerms from '@/lib/rehype-autolink-terms'
import { AUTOLINK_DICTIONARY } from '@/lib/autolink-dictionary'
import remarkGfm from 'remark-gfm'

interface Props {
  params: Promise<{ category: string; slug: string }>
}

const mdxComponents = {
  InfoBox, Callout, FeatureGrid, Feature,
  StatRow, Stat, CompareTable, CompareThead, CompareTh,
  CompareTr, CompareTd, Verdict, ProsConsList, ProsBlock, ConsBlock, ProItem, ConItem, SectionDivider, FaqList, FaqItem,
  BrandCTA,
  table: (props: React.ComponentProps<'table'>) => (
    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <table {...props} />
    </div>
  ),
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
  return {
    title: frontmatter.title,
    description: frontmatter.description,
    alternates: { canonical: `https://www.toutou-gourmet.com/chien/${frontmatter.categorySlug}/${slug}` },
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.description,
      url: `https://www.toutou-gourmet.com/chien/${frontmatter.categorySlug}/${slug}`,
      type: 'article',
    },
  }
}

export default async function ArticleCategoryPage({ params }: Props) {
  const { category, slug } = await params
  const article = getArticleBySlug(slug)
  if (!article || article.frontmatter.categorySlug !== category) notFound()

  const allArticles = getAllArticles()

  const cat = getCategoryBySlug(category)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { frontmatter, content, rawContent } = article!
  const canonicalUrl = `https://www.toutou-gourmet.com/chien/${category}/${slug}`
  const tldrItems = extractTldr(rawContent)
  const readTime = estimateReadTime(rawContent)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: frontmatter.title,
    author: { '@type': 'Organization', name: 'Toutou Gourmet' },
    datePublished: frontmatter.date,
    dateModified: frontmatter.updatedAt || frontmatter.date,
    publisher: {
      '@type': 'Organization',
      name: 'Toutou Gourmet',
      logo: { '@type': 'ImageObject', url: 'https://www.toutou-gourmet.com/images/brand/logo.webp' },
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

      <div className="min-h-screen py-10 px-6 bg-[var(--bg-primary)]">
        <article className="max-w-[720px] mx-auto">
          <Breadcrumb items={[
            { label: 'Accueil', href: '/' },
            { label: 'Chien', href: '/chien' },
            ...(cat ? [{ label: cat.label, href: `/chien/${category}` }] : []),
            { label: frontmatter.title },
          ]} />

          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Badge>{frontmatter.category}</Badge>
              <span className="text-sm text-[var(--text-muted)]">
                {formatDate(frontmatter.updatedAt || frontmatter.date)}
              </span>
              <span className="text-sm text-[var(--text-muted)]">·</span>
              <span className="text-sm text-[var(--text-muted)]">{readTime} min de lecture</span>
            </div>
            <h1 className="page-title mb-3">{frontmatter.title}</h1>
            <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
              {frontmatter.description}
            </p>
          </header>

          {tldrItems.length > 0 && <TLDR items={tldrItems} />}

          <SummarizeWithAI title={frontmatter.title} url={canonicalUrl} domain="toutou-gourmet.com" />

          <div className="mdx-content mt-8">
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
          </div>

          {frontmatter.tags && frontmatter.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-[var(--border)]">
              {frontmatter.tags.map((tag: string) => (
                <Badge key={tag} variant="default">#{tag}</Badge>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-4 mt-6 text-sm font-medium">
            <Link href="/quiz" className="text-[var(--accent-1)] hover:underline">→ Faire le quiz personnalisé</Link>
            <Link href="/comparateur" className="text-[var(--accent-1)] hover:underline">→ Voir le comparateur complet</Link>
          </div>

          <RelatedArticles
            currentSlug={slug}
            categorySlug={category}
            allArticles={allArticles}
          />

          <div className="mt-10 pb-24">
            <NewsletterBlock />
          </div>
        </article>
      </div>

      {slug === 'eukanuba-vs-royal-canin' ? (
        <StickyCtaDouble
          eyebrow="Disponibles sur Amazon"
          brandA={{ label: 'Essayer Royal Canin', href: 'https://amzn.to/4rYE9JY' }}
          brandB={{ label: 'Essayer Eukanuba', href: 'https://amzn.to/4sAAulM' }}
        />
      ) : (
        <StickyCtaDogChef />
      )}
    </>
  )
}
