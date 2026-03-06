import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getAllArticles, getArticleBySlug } from '@/lib/mdx'
import { formatDate } from '@/lib/utils'
import { TLDR } from '@/components/blog/TLDR'
import { SummarizeWithAI } from '@/components/blog/SummarizeWithAI'
import { NewsletterBlock } from '@/components/blog/NewsletterBlock'
import { Badge } from '@/components/ui/Badge'

interface Props {
  params: Promise<{ slug: string }>
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
    alternates: { canonical: `https://toutougourmet.fr/blog/${slug}` },
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.description,
      url: `https://toutougourmet.fr/blog/${slug}`,
      images: frontmatter.image ? [{ url: `https://toutougourmet.fr${frontmatter.image}`, width: 1200, height: 630 }] : [],
      type: 'article',
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) notFound()

  const { frontmatter, content } = article
  const canonicalUrl = `https://toutougourmet.fr/blog/${slug}`

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: frontmatter.title,
    author: { '@type': 'Organization', name: 'Toutou Gourmet' },
    datePublished: frontmatter.date,
    dateModified: frontmatter.updatedAt || frontmatter.date,
    image: frontmatter.image ? `https://toutougourmet.fr${frontmatter.image}` : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'Toutou Gourmet',
      logo: { '@type': 'ImageObject', url: 'https://toutougourmet.fr/images/brand/logo.webp' },
    },
  }

  // Extract TL;DR from content (simple heuristic — first list after "TL;DR")
  const tldrMatch = content.match(/##?\s*TL;DR[^\n]*\n([\s\S]*?)(?=\n##)/i)
  const tldrItems: string[] = []
  if (tldrMatch) {
    const listPart = tldrMatch[1]
    const items = listPart.match(/^[-*]\s+(.+)$/gm)
    if (items) tldrItems.push(...items.map((i) => i.replace(/^[-*]\s+/, '')))
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <div className="min-h-screen py-12 px-4 bg-[var(--bg-primary)]">
        <article className="max-w-[720px] mx-auto">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge>{frontmatter.category}</Badge>
              <span className="text-sm text-[var(--text-muted)]">
                Mis à jour le {formatDate(frontmatter.updatedAt || frontmatter.date)}
              </span>
            </div>
            <h1 className="mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
              {frontmatter.title}
            </h1>
            <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
              {frontmatter.description}
            </p>
            {frontmatter.image && (
              <div className="relative aspect-[16/9] mt-6 rounded-[var(--radius-xl)] overflow-hidden">
                <Image
                  src={frontmatter.image}
                  alt={frontmatter.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </header>

          {/* TL;DR */}
          {tldrItems.length > 0 && <TLDR items={tldrItems} />}

          {/* SummarizeWithAI */}
          <SummarizeWithAI
            title={frontmatter.title}
            url={canonicalUrl}
            domain="toutougourmet.fr"
          />

          {/* Content */}
          <div className="prose prose-stone max-w-none
            [&_h2]:font-fraunces [&_h2]:font-bold [&_h2]:text-[var(--text-primary)] [&_h2]:mt-10 [&_h2]:mb-4
            [&_h3]:font-fraunces [&_h3]:font-bold [&_h3]:text-[var(--text-primary)] [&_h3]:mt-6 [&_h3]:mb-3
            [&_p]:text-[var(--text-secondary)] [&_p]:leading-relaxed [&_p]:mb-4
            [&_a]:text-[var(--accent-1)] [&_a]:underline
            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:text-[var(--text-secondary)]
            [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1
            [&_strong]:text-[var(--text-primary)] [&_strong]:font-semibold
            [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--accent-1)] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[var(--text-secondary)]">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>

          {/* Tags */}
          {frontmatter.tags && frontmatter.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-[var(--border)]">
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

          {/* Newsletter */}
          <div className="mt-10">
            <NewsletterBlock />
          </div>
        </article>
      </div>
    </>
  )
}
