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
import { Badge } from '@/components/ui/Badge'
import {
  InfoBox, Callout, FeatureGrid, Feature,
  StatRow, Stat, CompareTable, CompareThead, CompareTh,
  CompareTr, CompareTd, Verdict, ProsConsList, ProsBlock, ConsBlock, ProItem, ConItem, SectionDivider, FaqList, FaqItem,
} from '@/components/mdx/MdxComponents'
import { BrandCTA } from '@/components/marques/BrandCTA'
import rehypeAutolinkTerms from '@/lib/rehype-autolink-terms'
import { AUTOLINK_DICTIONARY } from '@/lib/autolink-dictionary'

interface Props {
  params: Promise<{ slug: string }>
}

// Composants disponibles dans les fichiers MDX
const mdxComponents = {
  InfoBox, Callout, FeatureGrid, Feature,
  StatRow, Stat, CompareTable, CompareThead, CompareTh,
  CompareTr, CompareTd, Verdict, ProsConsList, ProsBlock, ConsBlock, ProItem, ConItem, SectionDivider, FaqList, FaqItem,
  BrandCTA,
}

export async function generateStaticParams() {
  const articles = getAllArticles()
  return articles.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) return {}
  const { frontmatter } = article
  return {
    title: frontmatter.title,
    description: frontmatter.description,
    alternates: { canonical: `https://www.toutou-gourmet.com/blog/${slug}` },
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.description,
      url: `https://www.toutou-gourmet.com/blog/${slug}`,
      type: 'article',
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) notFound()

  // 308 permanent redirect — articles with a categorySlug are canonical at /chien/[cat]/[slug]
  if (article.frontmatter.categorySlug) {
    const { permanentRedirect } = await import('next/navigation')
    permanentRedirect(`/chien/${article.frontmatter.categorySlug}/${slug}`)
  }

  const allArticles = getAllArticles()

  const { frontmatter, content, rawContent } = article
  const canonicalUrl = `https://www.toutou-gourmet.com/blog/${slug}`
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <div className="min-h-screen py-10 px-6 bg-[var(--bg-primary)]">
        <article className="max-w-[720px] mx-auto">

          {/* Header */}
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

          {/* TL;DR */}
          {tldrItems.length > 0 && <TLDR items={tldrItems} />}

          {/* SummarizeWithAI */}
          <SummarizeWithAI
            title={frontmatter.title}
            url={canonicalUrl}
            domain="toutou-gourmet.com"
          />

          {/* Contenu MDX avec composants custom */}
          <div className="mdx-content mt-8">
            <MDXRemote
              source={stripTldr(content)}
              components={mdxComponents}
              options={{
                mdxOptions: {
                  rehypePlugins: [
                    [rehypeAutolinkTerms, { terms: AUTOLINK_DICTIONARY, maxTotal: 3 }],
                  ],
                },
              }}
            />
          </div>

          {/* Tags */}
          {frontmatter.tags && frontmatter.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-[var(--border)]">
              {frontmatter.tags.map((tag: string) => (
                <Badge key={tag} variant="default">#{tag}</Badge>
              ))}
            </div>
          )}

          {/* Liens internes */}
          <div className="flex flex-wrap gap-4 mt-6 text-sm font-medium">
            <Link href="/quiz" className="text-[var(--accent-1)] hover:underline">
              → Faire le quiz personnalisé
            </Link>
            <Link href="/comparateur" className="text-[var(--accent-1)] hover:underline">
              → Voir le comparateur complet
            </Link>
          </div>

          {/* Articles similaires */}
          <RelatedArticles
            currentSlug={slug}
            categorySlug={frontmatter.categorySlug}
            allArticles={allArticles}
          />

          {/* Newsletter */}
          <div className="mt-10 pb-24">
            <NewsletterBlock />
          </div>
        </article>
      </div>

      <StickyCtaDogChef />
    </>
  )
}
