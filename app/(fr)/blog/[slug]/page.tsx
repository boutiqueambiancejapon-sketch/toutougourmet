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
import { getStickyCtaForArticle, stickyAllowed } from '@/lib/sticky-cta-config'
import { ArticleLayout } from '@/components/blog/ArticleLayout'
import { getArticleSlot } from '@/components/blog/blog-categories'
import { getSlotPath, resolveSlot } from '@/data/image-utils'
import { articleMdxComponents } from '@/components/mdx/article-components'
import { DEFAULT_AUTHOR } from '@/data/authors'
import rehypeAutolinkTerms from '@/lib/rehype-autolink-terms'
import remarkGfm from 'remark-gfm'
import { signupInvitePlugins } from '@/lib/article-signup'
import { guideTopPlugins } from '@/lib/remark-guide-top'
import { getBreedForArticle } from '@/data/breeds'
import { AUTOLINK_DICTIONARY } from '@/lib/autolink-dictionary'

interface Props {
  params: Promise<{ slug: string }>
}

const SITE_URL = 'https://www.toutou-gourmet.com'

function getArticleImageUrl(slug: string, category: string): string {
  const slotId = getArticleSlot(slug, category)
  const slot = resolveSlot(slotId)
  const path = slot
    ? getSlotPath(slot)
    : `/images/${slotId.startsWith('breed-') ? 'breeds' : 'articles'}/${slotId}.webp`
  return `${SITE_URL}${path}`
}

export async function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) return {}
  const { frontmatter } = article
  const canonical = `${SITE_URL}/blog/${slug}`
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

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) notFound()

  if (article.frontmatter.categorySlug) {
    const { permanentRedirect } = await import('next/navigation')
    permanentRedirect(`/chien/${article.frontmatter.categorySlug}/${slug}`)
  }

  const allArticles = getAllArticles()
  const { frontmatter, content, rawContent } = article
  // @cdc CRO compte (maquette 3A) — encart compte avant la FAQ, selon le sujet (lib/article-signup).
  const guidePlugins = guideTopPlugins({ slug, categorySlug: frontmatter.categorySlug ?? '', verdict: frontmatter.verdict })
  const signupPlugins = signupInvitePlugins({
    slug,
    categorySlug: frontmatter.categorySlug ?? '',
    verdict: frontmatter.verdict,
    hasBreed: Boolean(getBreedForArticle(slug)),
  })
  const canonicalUrl = `${SITE_URL}/blog/${slug}`
  const articleImageUrl = getArticleImageUrl(slug, frontmatter.category)
  const tldrItems = extractTldr(rawContent)
  const readTime = estimateReadTime(rawContent)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: frontmatter.title,
    description: frontmatter.description,
    image: [articleImageUrl],
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

  // ── Sélection du sticky CTA ─────────────────────────────────
  // Priorité : frontmatter affiliateA+B (double explicite) > affiliateA seul (single explicite)
  // > routing intent-based (getStickyCtaForArticle, slug-aware)
  const explicitDouble = frontmatter.affiliateA && frontmatter.affiliateB
  const explicitSingle = !explicitDouble && frontmatter.affiliateA
  const intentSelection = !explicitDouble && !explicitSingle
    ? getStickyCtaForArticle(frontmatter.category, slug)
    : null

  // @cdc cro-carte — même règle que /chien/[category]/[slug] (ici sans encart du milieu).
  const showSticky = stickyAllowed({ categorySlug: frontmatter.categorySlug ?? '', slug, rawContent, midIsPartner: false })

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
          { label: 'Blog', href: '/blog' },
          { label: frontmatter.title },
        ]}
        canonicalUrl={canonicalUrl}
        dateDisplay={formatDate(frontmatter.updatedAt || frontmatter.date)}
        readTime={readTime}
        tldrItems={tldrItems}
        allArticles={allArticles}
      >
        <MDXRemote
          source={stripTldr(content)}
          components={articleMdxComponents}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm, ...signupPlugins, ...guidePlugins],
              rehypePlugins: [
                [rehypeAutolinkTerms, { terms: AUTOLINK_DICTIONARY, maxTotal: 3 }],
              ],
            },
          }}
        />
      </ArticleLayout>

      {!showSticky ? null : explicitDouble ? (
        <StickyCtaDouble
          eyebrow="Comparer les deux"
          brandA={{ label: `Acheter ${frontmatter.affiliateA!.name}`, href: frontmatter.affiliateA!.url }}
          brandB={{ label: `Acheter ${frontmatter.affiliateB!.name}`, href: frontmatter.affiliateB!.url }}
        />
      ) : explicitSingle ? (
        <StickyCta config={{
          brandName: frontmatter.affiliateA!.name,
          url: frontmatter.affiliateA!.url,
          label: frontmatter.affiliateA!.label ?? `disponible chez ${frontmatter.affiliateA!.badge ?? 'Maxi Zoo'}`,
          badge: frontmatter.affiliateA!.badge,
          code: frontmatter.affiliateA!.code,
        }} />
      ) : intentSelection?.kind === 'single' ? (
        <StickyCta config={intentSelection.config} />
      ) : null}
    </>
  )
}
